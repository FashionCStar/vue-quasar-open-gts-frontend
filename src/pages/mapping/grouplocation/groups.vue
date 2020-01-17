<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-xs-12">
        <q-card>
          <side-bar>
            <template v-slot:firstPaneTitle>
              Group Info
            </template>
            <template v-slot:devicePane>
              <div class="q-pa-sm q-col-gutter-sm">
                <q-select outlined v-model="groupID"
                          :options="filteredGroupList"
                          :option-value="opt => opt === null ? null : opt.groupID"
                          :option-label="opt => opt === null ? '- Null -' : (opt.description ? opt.description : opt.groupID) + '  [' + opt.groupID + ']'"
                          emit-value
                          map-options
                          use-input
                          hide-selected
                          fill-input
                          dense
                          options-dense
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          input-debounce="200"
                          label="Group"
                          @filter="filterGroup"
                          @input="val => {getLastEvents(val)}"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-input filled stack-label
                         v-model="lastTimeString"
                         label="To"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date v-model="lastTime" mask="YYYY-MM-DD HH:mm" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>

                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="lastTime" mask="YYYY-MM-DD HH:mm" format24h with-seconds/>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-select outlined v-model="timeZone"
                          :options="timeZoneList"
                          :option-value="opt => opt === null ? null : opt.value"
                          :option-label="opt => opt === null ? '- Null -' : opt.desc"
                          emit-value
                          map-options
                          options-cover
                          dense
                          options-dense
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          ref="timeZone" :label="$t('timeZone')"
                          @input="val => { updateOffset(val) }"
                />
                <q-separator class="q-pt-none q-mt-sm"/>
                <div class="text-center q-pt-none">
                  <q-btn class="q-mt-sm" label="Update" color="primary" glossy @click="getLastEvents" />
<!--                  <q-btn class="q-mt-sm q-ml-sm"-->
<!--                         :label="autoUpdate ? 'Stop : ' + remainTime: 'Auto'"-->
<!--                         color="primary" glossy-->
<!--                         @click="toggleAutoUpdate"/>-->
                </div>
                <q-separator class="q-pt-none q-mt-sm"/>
                <q-field class="q-pt-none" label="Cursor Location" stack-label >
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="0">{{ curLocation }}</div>
                  </template>
                </q-field>
              </div>
            </template>
            <template v-slot:secondPaneTitle>
              {{ groupID }} Group Info
            </template>
            <template v-slot:locationPane>
              <div class="q-pa-sm">
                <q-list  v-for="(event, index) in locationData"
                         :key="'event' + index">
                  <q-item clickable
                          @click="showToolTip(event, index)"
                  >
                    <q-item-section top>
                      <q-item-label class="text-weight-medium">{{ getDeviceID(event) }}</q-item-label>
                      <q-item-label>{{ convertTimestamp(event.timestamp) }}</q-item-label>
                      <q-item-label v-html="getStreetViewLink(event)" />
                      <q-item-label caption>{{ event.address }}</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <q-item-label class="text-weight-medium">{{ getStatusCode(event.statusCode) }}</q-item-label>
                      <q-item-label caption>{{ event.speedKPH.toFixed(1) + ' KM/h'}}</q-item-label>
                      <q-item-label caption>{{ event.heading + '&deg;' }}</q-item-label>
                      <q-btn class="q-mt-sm" round color="brown-5" glossy icon="directions_car" @click="showVehicleMap(event)"/>
                    </q-item-section>
                  </q-item>

                  <q-separator spaced inset />
                </q-list>
              </div>
            </template>
          </side-bar>
          <l-map style="height: calc(100vh - 125px); cursor: crosshair"
                 :zoom.sync="zoom"
                 :bounds="bounds"
                 :center.sync="center"
                 ref="map"
                 @baselayerchange="updateMapBounds"
                 @mousemove="getCursorLocation"
          >
            <q-resize-observer @resize="onResize"/>
            <l-control position="bottomright">
              <div style="display: flex; flex-direction: column; font-family: 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif">
                <q-btn color="primary"
                       round glossy
                       :icon="autoUpdate ? '' : 'fas fa-hourglass-half'"
                       :label="autoUpdate ? remainTime : ''"
                       @click="toggleAutoUpdate" />
                <q-btn class="q-mt-sm"
                       round glossy
                       :color="overlayZones? 'primary' : 'grey'"
                       icon="fas fa-draw-polygon"
                       @click="toggleOverlayZones" />
                <q-btn class="q-mt-sm"
                       color="primary"
                       round glossy
                       :icon="isClustering ? 'bubble_chart' : 'group_work'"
                       @click="changeClusterMode" />
              </div>
            </l-control>
            <l-control-layers :sort-layers="true" />
            <l-tile-layer
                    v-for="tileProvider in tileProviders"
                    :key="tileProvider.name"
                    :name="tileProvider.name"
                    :url="tileProvider.url"
                    :options="tileProvider.options"
                    :visible="tileProvider.visible"
                    :attribution="tileProvider.attribution"
                    layer-type="base"/>
            <l-layer-group>
              <l-circle
                      v-for="(radiusZone, i) in radiusZones"
                      :key="'radiusZone' + i"
                      :lat-lng="radiusZone.latlngs[0]"
                      :radius="radiusZone.radius"
                      :weight="1"
                      :opacity="0.8"
                      :color="shapeColor"
                      :fillColor="shapeColor"
                      :visible="overlayZones">
                <l-tooltip
                  :content="radiusZone.label"
                  :options="{ permanent: true, direction: 'center' }"
                />
              </l-circle>
              <l-polyline
                      v-for="(polylineZone, i) in polylineZones"
                      :key="'polylineZone' + i"
                      :lat-lngs="polylineZone.latlngs"
                      :weight="Math.round(getRadiusPixel(polylineZone.radius)) * 2"
                      :opacity="0.4"
                      :lineCap="'butt'"
                      :color="shapeColor"
                      :fillColor="shapeColor"
                      :visible="overlayZones">
                <l-tooltip
                  :content="polylineZone.label"
                  :options="{ permanent: true, direction: 'center' }"
                />
              </l-polyline>
              <l-polygon
                      v-for="(polygonZone, i) in polygonZones"
                      :key="'polygonZone' + i"
                      :lat-lngs="polygonZone.latlngs"
                      :visible="overlayZones"
                      :weight="1"
                      :color="shapeColor"
                      :fillColor="shapeColor">
                <l-tooltip
                  :content="polygonZone.label"
                  :options="{ permanent: true, direction: 'center' }"
                />
              </l-polygon>
            </l-layer-group>
            <l-marker
                    v-for="(marker, index) in markers"
                    :key="'clusterMarker' + index"
                    :lat-lng="marker"
                    :visible="!isClustering"
                    ref="marker1"
            >
              <l-icon
                      :icon-anchor="marker.icon.iconOffset"
                      class-name="someExtraClass">
                <img :src="marker.icon.iconUrl" :height="marker.icon.iconHeight" v-if="marker.icon.pushpin !== 'arrow_spd' && marker.icon.pushpin !== 'arrow_grn'"/>
                <svg height="20" width="20" :style="'transform: rotate(' + marker.icon.heading + 'deg)'" v-else>
                  <polygon points="10,2 2,18 10,14 18,18" style="fill:red;stroke:black;stroke-width:1" v-if="marker.icon.color === 'red'"/>
                  <polygon points="10,2 2,18 10,14 18,18" style="fill:#88FF88;stroke:black;stroke-width:1" v-else/>
                </svg>
                <svg height="10" width="10" :style="'transform: rotate(' + marker.icon.heading + 'deg); position: absolute; top: 3px; left: 4px'"
                     v-if="marker.icon.pushpin === 'pp_arrow_c' || marker.icon.pushpin === 'pp_arrow_y'">
                  <polygon points="5,0 0,10 5,8 10,10" style="fill:black;stroke-width:1"/>
                </svg>
              </l-icon>
              <l-tooltip
                      :content.sync="marker.info"
                      :options="{
                          direction: 'bottom',
                          className: 'leaflet-tooltip-rounded-border' }"
              />
            </l-marker>
            <l-marker-cluster
                    :options="{
                      showCoverageOnHover: false
                    }"
            >
              <l-marker
                      v-for="(marker, index) in markers"
                      :key="'simpleMarker' + index"
                      :lat-lng="marker"
                      :visible="isClustering"
                      ref="marker2"
              >
                <l-icon
                        :icon-anchor="marker.icon.iconOffset"
                        class-name="someExtraClass">
                  <img :src="marker.icon.iconUrl" :height="marker.icon.iconHeight" v-if="marker.icon.pushpin !== 'arrow_spd' && marker.icon.pushpin !== 'arrow_grn'"/>
                  <svg height="20" width="20" :style="'transform: rotate(' + marker.icon.heading + 'deg)'" v-else>
                    <polygon points="10,2 2,18 10,14 18,18" style="fill:red;stroke:black;stroke-width:1" v-if="marker.icon.color === 'red'"/>
                    <polygon points="10,2 2,18 10,14 18,18" style="fill:#88FF88;stroke:black;stroke-width:1" v-else/>
                  </svg>
                  <svg height="10" width="10" :style="'transform: rotate(' + marker.icon.heading + 'deg); position: absolute; top: 3px; left: 4px'"
                       v-if="marker.icon.pushpin === 'pp_arrow_c' || marker.icon.pushpin === 'pp_arrow_y'">
                    <polygon points="5,0 0,10 5,8 10,10" style="fill:black;stroke-width:1"/>
                  </svg>
                </l-icon>
                <l-tooltip
                        :content.sync="marker.info"
                        :options="{
                          direction: 'bottom',
                          className: 'leaflet-tooltip-rounded-border' }"
                />
              </l-marker>
            </l-marker-cluster>
          </l-map>
        </q-card>
      </div>
    </div>
    <q-inner-loading :showing="loading" style="z-index: 1000">
      <q-spinner-puff size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>

import { api } from 'src/boot/api'
import { LocalStorage, date } from 'quasar'
import L, { latLng } from 'leaflet'
import { LMap, LControlLayers, LTileLayer, LLayerGroup, LMarker, LCircle, LPolyline, LPolygon, LIcon, LTooltip, LControl } from 'vue2-leaflet'
import SideBar from '../../../components/SideBar'
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import Util from 'src/boot/mapUtil'

export default {
  name: 'GroupLocation',
  components: {
    LMap,
    LControlLayers,
    LControl,
    LTileLayer,
    LLayerGroup,
    LCircle,
    LPolyline,
    LPolygon,
    LMarker,
    LIcon,
    // LCircleMarker,
    LTooltip,
    // LIcon,
    'l-marker-cluster': Vue2LeafletMarkerCluster,
    'side-bar': SideBar
  },
  data () {
    return {
      tileProviders: Util.tileProviders,
      center: {
        lat: 1.3512,
        lng: 104.0084
      },
      bounds: [],
      zoom: 7,
      curMarker: null,
      markers: [],
      route: {
        latlngs: [],
        visible: true
      },
      isClustering: true,

      columns: [
        { name: 'number', align: 'center', label: '#' },
        { name: 'time', align: 'center', label: 'Date/Time' },
        { name: 'status', align: 'center', label: 'Status' },
        { name: 'position', align: 'center', label: 'Lat/Lon' },
        { name: 'speed', align: 'center', label: 'KM/h', field: 'speedKPH' },
        { name: 'heading', align: 'center', label: 'Heading', field: 'heading' },
        { name: 'address', align: 'center', label: 'Address', field: 'address' }
      ],
      pagination: {
        rowsPerPage: 10
      },

      trackData: [],
      locationData: [],
      measurements: [],
      minPixelDistance: 30,
      measureUnit: 'km',
      totalDist: 0,
      timeZoneList: Util.timeZoneList,

      loading: true,
      accountID: '',
      deviceList: [],
      groupList: [],
      filteredGroupList: [],
      showLocations: false,
      curLocation: '',
      timeZone: 'GMT+08:00',
      timeOffset: 0,
      isPlayback: false,
      // last location info
      lastImgURL: 'statics/pp/CrosshairRed.gif',
      lastLocation: 'unavailable',
      lastTime: 0,
      lastTimeString: '',
      groupID: null,
      autoUpdate: true,
      remainTime: 30,
      refreshInterval: null,
      overlayZones: false,

      radiusZones: [],
      polylineZones: [],
      polygonZones: [],
      shapeColor: '#11a522'
    }
  },
  created () {
    if (this.$q.cookies.has('tileprovider')) {
      const tileProvider = this.$q.cookies.get('tileprovider')
      this.tileProviders.forEach(layer => {
        if (layer.name === tileProvider) {
          layer.visible = true
        } else {
          layer.visible = false
        }
      })
    }

    if (this.$q.cookies.has('overlayZones')) {
      this.overlayZones = this.$q.cookies.get('overlayZones')
    }
  },
  watch: {
    lastTime: function (val) {
      console.log('UPDATE LAST TIME', val)
      const newDate = new Date(val)
      this.lastTimeString = date.formatDate(newDate, 'DD/MM/YYYY HH:mm:ss')
    }
  },
  mounted () {
    this.lastTime = date.formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss')
    this.getGroupList()
  },
  beforeRouteLeave (to, from, next) {
    this.autoUpdate = false
    this.refreshCountStop()
    next()
  },
  methods: {
    convertTimestamp (val, showTimeZone = false) {
      const offset = showTimeZone ? this.timeOffset : 0

      const timeStamp = new Date((val + offset) * 1000)
      return date.formatDate(timeStamp, 'DD/MM/YYYY HH:mm:ss')
    },
    getCompass (heading) {
      return Util.getCompass(heading)
    },
    getStatusCode (code) {
      return Util.getStatusCode(code)
    },
    getMarkerInfo (d) {
      return Util.getMarkerInfo(d, this.timeZone)
    },
    getMarkerIcon (d) {
      return Util.getMarkerIcon(d)
    },
    getGroupList: async function () {
      const params = {
        conditions: {}
      }
      if (LocalStorage.getItem('userLevel') !== 'admin') {
        params.conditions.accountID = LocalStorage.getItem('accountID')
      }
      // fetch groupList from "server"
      try {
        let res = await api.getGroups(params)
        this.groupList = res.data.devicegroups
        this.filteredGroupList = this.groupList
        this.groupList.unshift({
          groupID: 'All',
          description: 'All Vehicles'
        })
        this.groupID = 'All'
        this.getLastEvents()
      } catch (e) {
      }
    },
    filterGroup (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.filteredGroupList = this.groupList.filter(function (el) {
          if (el.groupID && ((el.description ? el.description : el.groupID) + '  [' + el.groupID + ']').toLowerCase().indexOf(needle) > -1) {
            return el
          }
        })
      })
    },
    getLastEvents: async function () {
      const params = {
        conditions: {
        }
      }

      const endDate = new Date(this.lastTime)
      const timeStamp = endDate.getTime() / 1000
      params.conditions.lastTime = timeStamp - this.timeOffset

      if (this.groupID !== 'All') {
        params.conditions.groupID = this.groupID
        params.conditions.accountID = this.groupList.find(group => group.groupID === this.groupID).accountID
      }

      const accountID = this.groupList.find(group => group.groupID === this.groupID).accountID
      this.getOverlayZone(accountID)

      try {
        // this.loading = true
        let res = await api.getGroupLastEvent(params)
        console.log('RESULT', res)
        let eventCount = 0

        res.data.event.map(event => {
          if (event) eventCount++
        })

        if (eventCount > 0) {
          this.locationData = []
          this.markers = []
          const data = res.data.event
          const bounds = {
            northBound: data[0].latitude,
            southBound: data[0].latitude,
            eastBound: data[0].longitude,
            westBound: data[0].longitude
          }

          data.map((item, idx) => {
            item.id = data.length - idx
            this.markers.push({
              id: data.length - idx,
              lat: item.latitude,
              lng: item.longitude,
              info: this.getMarkerInfo(item),
              icon: this.getMarkerIcon(item)
            })

            this.locationData.push({
              id: data.length - idx,
              ...item
            })

            if (bounds.eastBound < item.longitude) {
              bounds.eastBound = item.longitude
            }
            if (bounds.westBound > item.longitude) {
              bounds.westBound = item.longitude
            }
            if (bounds.northBound > item.latitude) {
              bounds.northBound = item.latitude
            }
            if (bounds.southBound < item.latitude) {
              bounds.southBound = item.latitude
            }
          })

          this.$refs.map.mapObject.fitBounds([
            [bounds.northBound, bounds.westBound],
            [bounds.southBound, bounds.eastBound]
          ])
        } else {
          this.markers.splice(0, this.markers.length)
          this.locationData = []
          this.center = {
            lat: 1.3512,
            lng: 104.0084
          }
          this.zoom = 4
        }

        this.loading = false
        this.remainTime = 30
        if (this.autoUpdate) {
          this.refreshCountStart()
        }

        console.log('MARKERS', this.markers)
      } catch (e) {
        console.log('ERROR', e)
      }
    },
    getOverlayZone: async function (accountID) {
      console.log('ACCOUNTID', accountID)
      const params = {
        conditions: {}
      }

      if (accountID) {
        params.conditions.accountID = accountID
      }

      try {
        const zoneData = await api.getZonesByAccount(params)
        const corridorData = await api.getCorridorsByAccount(params)
        this.radiusZones.splice(0, this.radiusZones.length)
        this.polylineZones.splice(0, this.polylineZones.length)
        this.polygonZones.splice(0, this.polygonZones.length)

        if (zoneData.data.zones) {
          const data = zoneData.data.zones
          for (let i = 0; i < data.length; i++) {
            const latlngs = []
            for (let j = 1; j <= 10; j++) {
              if (data[i]['latitude' + j] && data[i]['longitude' + j] && data[i]['latitude' + j] !== 0 && data[i]['longitude' + j] !== 0) {
                latlngs.push({
                  lat: data[i]['latitude' + j],
                  lng: data[i]['longitude' + j]
                })
              }
            }

            if (data[i].vertices) {
              const points = data[i].vertices.split(',')
              points.map(point => {
                const pos = point.split('/')
                latlngs.push({
                  lat: parseFloat(pos[0]),
                  lng: parseFloat(pos[1])
                })
              })
            }

            if (latlngs.length > 0) {
              switch (data[i].zoneType) {
                case 0:
                  this.radiusZones.push({
                    latlngs: latlngs,
                    radius: data[i].radius,
                    label: data[i].description
                  })
                  break
                case 2:
                  this.polylineZones.push({
                    latlngs: latlngs,
                    radius: data[i].radius,
                    label: data[i].description
                  })
                  break
                default:
                  this.polygonZones.push({
                    latlngs: latlngs,
                    label: data[i].description
                  })
              }
            }
          }
        }

        if (corridorData.data.corridors) {
          const data = corridorData.data.corridors

          for (let i = 0; i < data.length; i++) {
            const latlngs = []

            for (let j = 0; j < data[i].latlngs.length; j++) {
              const positions = data[i].latlngs[j]

              for (let pos = 1; pos <= 10; pos++) {
                if (positions['latitude' + pos] && positions['longitude' + pos] && positions['latitude' + pos] !== 0 && positions['longitude' + pos] !== 0) {
                  latlngs.push({
                    lat: positions['latitude' + pos],
                    lng: positions['longitude' + pos]
                  })
                }
              }
            }

            if (latlngs.length > 0) {
              this.polylineZones.push({
                latlngs: latlngs,
                radius: data[i].radius
              })
            }
          }
        }
      } catch (e) {
        console.log('ERROR', e)
      }
    },
    onSubmit () {
      console.log('UPDATE PLAYBACK STATUS, PRUNE CLUSTER')
    },
    showToolTip (data, index) {
      this.isPlayback = false
      this.showLocations = false
      this.center = Object.assign({}, { lat: data.latitude, lng: data.longitude })
      this.$refs.map.mapObject.setView(this.center, 12)

      for (let i = 0; i < this.markers.length; i++) {
        if (i === index) {
          this.$refs.marker1[i].mapObject.openTooltip()
          this.$refs.marker2[i].mapObject.openTooltip()
        } else {
          this.$refs.marker1[i].mapObject.closeTooltip()
          this.$refs.marker2[i].mapObject.closeTooltip()
        }
      }
    },
    getCursorLocation (e) {
      if (e.latlng) {
        this.curLocation = e.latlng.lat.toFixed(5) + ', ' + e.latlng.lng.toFixed(5)
      }
    },
    onResize () {
      this.$refs.map.mapObject.invalidateSize()
    },
    updateMapBounds (e) {
      this.$q.cookies.set('tileprovider', e.layer.options.id, {
        expires: 3
      })

      const bounds = e.layer.options.bounds
      if (bounds) {
        // this.bounds = bounds
        this.$refs.map.mapObject.setMaxBounds(bounds)
      } else {
        this.bounds = null
        this.$refs.map.mapObject.setMaxBounds(null)
      }
    },
    updateOffset () {
      this.timeOffset = this.timeZoneList.find(zone => zone.desc === this.timeZone).offset
    },
    updateMeasurement (opt = null) {
      this.measurements.splice(0, this.measurements.length)
      this.totalDist = 0
      const data = this.route.latlngs

      for (let i = data.length - 1; i > 0; i--) {
        const ll1 = latLng(data[i])
        const ll2 = latLng(data[i - 1])
        const dist = ll1.distanceTo(ll2)
        this.totalDist += dist

        const p1 = this.$refs.map.mapObject.latLngToLayerPoint(ll1)
        const p2 = this.$refs.map.mapObject.latLngToLayerPoint(ll2)
        const pixelDist = p1.distanceTo(p2)
        // console.log('POINTS' + i, p1, p2)

        if (pixelDist >= this.minPixelDistance) {
          this.measurements.push({
            latlng: this.$refs.map.mapObject.layerPointToLatLng([(p1.x + p2.x) / 2, (p1.y + p2.y) / 2]),
            distance: this.formatDistance(dist),
            title: 'Segment Length',
            rotation: this.getRotation(ll1, ll2)
          })
        }
      }

      if (data.length > 0) {
        this.measurements.push({
          latlng: latLng(data[0]),
          distance: this.formatDistance(this.totalDist),
          title: 'Total Length',
          rotation: 0
        })
      }
    },
    getRotation: function (ll1, ll2) {
      const p1 = this.$refs.map.mapObject.project(ll1)
      const p2 = this.$refs.map.mapObject.project(ll2)

      return Math.atan((p2.y - p1.y) / (p2.x - p1.x))
    },
    formatDistance: function (d) {
      switch (this.measureUnit) {
        case 'km':
          d = d / 1000
          break
        case 'mi':
          d = d / 1609.344
      }

      if (d < 100) {
        return d.toFixed(1) + ' ' + this.measureUnit
      } else {
        return Math.round(d) + ' ' + this.measureUnit
      }
    },
    changeClusterMode () {
      this.isClustering = !this.isClustering
    },
    getDeviceID (d) {
      let deviceID = d.deviceID
      if (d.displayName) {
        deviceID += ' (' + d.displayName + ')'
      }
      return deviceID
    },
    getStreetViewLink (d) {
      const flat = d.latitude.toFixed(5)
      const flon = d.longitude.toFixed(5)
      let mapLink = '<a href="https://maps.google.com/?q=' + d.latitude + ',' + d.longitude + '" target="_blank">'
      mapLink += flat + ' / ' + flon + '</a>'
      return mapLink
    },
    showVehicleMap (d) {
      this.$router.push({ name: 'Vehicle Location', params: { deviceID: d.deviceID } })
    },
    toggleAutoUpdate () {
      this.autoUpdate = !this.autoUpdate
      if (this.autoUpdate) {
        this.refreshCountStart()
      } else {
        this.refreshCountStop()
      }
    },
    toggleOverlayZones () {
      this.overlayZones = !this.overlayZones
      this.$q.cookies.set('overlayZones', this.overlayZones, {
        expires: 3
      })
    },
    refreshCountStart () {
      if (this.refreshInterval) return
      this.remainTime = 30
      this.refreshInterval = window.setInterval(this.tick, 1000)
    },
    refreshCountStop () {
      if (!this.refreshInterval) return
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    },
    tick () {
      this.remainTime -= 1
      if (this.remainTime < 1) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
        this.getLastEvents()
      }
    },
    getRadiusPixel: function (radius) {
      const map = this.$refs.map.mapObject
      const centerLatLng = map.getCenter() // get map center
      const pointC = map.latLngToContainerPoint(centerLatLng) // convert to containerpoint (pixels)
      const pointX = L.point(pointC.x + 10, pointC.y) // add 10 pixels to x

      // convert containerpoints to latlng's
      const latLngX = map.containerPointToLatLng(pointX)
      const radiusInPixel = radius * 10 / centerLatLng.distanceTo(latLngX)
      return radiusInPixel // calculate distance between c and x (latitude)
    }
  }
}
</script>
