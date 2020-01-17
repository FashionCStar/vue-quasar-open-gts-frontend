<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-xs-12">
        <q-card>
          <side-bar ref="sideBar">
            <template v-slot:firstPaneTitle>
              Device Info
            </template>
            <template v-slot:devicePane>
              <div class="q-pa-sm q-col-gutter-sm">
                <q-select outlined v-model="deviceID"
                          :options="filteredDeviceList"
                          :option-value="opt => opt === null ? null : opt.deviceID"
                          :option-label="opt => opt === null ? '- Null -' : (opt.description ? opt.description : opt.deviceID) + '  [' + opt.deviceID + ']'"
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
                          label="Vehicle"
                          @filter="filterDevice"
                          @input="val => {getLastEvent(val)}"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-field class="q-pt-none" label="Last Event" stack-label >
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="0">{{ lastLocation }}</div>
                  </template>
                </q-field>
                <q-input filled stack-label
                         v-model="startDateString"
                         label="From"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date v-model="startDate" mask="YYYY-MM-DD HH:mm" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>

                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="startDate" mask="YYYY-MM-DD HH:mm" format24h />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input filled stack-label
                         v-model="endDateString"
                         label="To"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date v-model="endDate" mask="YYYY-MM-DD HH:mm" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>

                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="endDate" mask="YYYY-MM-DD HH:mm" format24h />
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
                  <q-btn class="q-mt-sm" label="Update" color="primary" glossy @click="updateMap" />
                </div>
                <q-separator class="q-pt-none q-mt-sm"/>
                <q-field class="q-pt-none" label="Cursor Location" stack-label >
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="0">{{ curLocation }}</div>
                  </template>
                </q-field>
                <q-field class="q-pt-none" label="Total Distance" stack-label >
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="0">{{ formatDistance(totalDist) }}</div>
                  </template>
                </q-field>
              </div>
            </template>
            <template v-slot:secondPaneTitle>
              {{deviceID + (shortName ? ' (' + shortName + ')' : '')}} Info
            </template>
            <template v-slot:locationPane>
              <div class="q-pa-sm">
                <q-list  v-for="event in locationData"
                         :key="'event' + event.id">
                  <q-item @click="showToolTip(event)"
                          clickable
                  >
                    <q-item-section>
                      <q-item-label>{{ convertTimestamp(event.timestamp) }}</q-item-label>
                      <q-item-label v-html="getStreetViewLink(event)"/>
                      <q-item-label caption>{{ event.address }}</q-item-label>
                    </q-item-section>

                    <q-item-section side top>
                      <q-item-label>{{ getStatusCode(event.statusCode) }}</q-item-label>
                      <q-item-label caption>{{ event.speedKPH.toFixed(1) + ' KM/h'}}</q-item-label>
                      <q-item-label caption>{{ event.heading + '&deg;' }}</q-item-label>
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
                 :center="center"
                 ref="map"
                 @baselayerchange="updateMapBounds"
                 @mousemove="getCursorLocation"
                 @zoomend="updateMeasurement"
          >
            <q-resize-observer @resize="onResize"/>
            <l-control
                    position="bottomright"
                    class="measurement-control">
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
                       :label="measureUnit"
                       @click="changeMeasureUnit" />
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
            <l-polyline
                    :lat-lngs="route.latlngs"
                    :visible="route.visible"
                    :color="route.color"
                    :opacity="0.6"
            ></l-polyline>
            <l-circle-marker
                    v-for="(latlng, index) in route.latlngs"
                    :key="index"
                    :lat-lng="latlng"
                    :radius="3"
                    color="black"
                    fill-color="magenta"
                    :weight="1"
                    :fill-opacity="1"
              />
            <l-marker
                    :lat-lng="marker"
                    :visible="showMarker"
                    ref="marker" >
              <l-tooltip
                      :content.sync="marker.info"
                      :options="{
                          direction: 'bottom',
                          className: 'leaflet-tooltip-rounded-border' }"
              />
            </l-marker>
            <l-layer-group ref="measurementLayer">
              <measure-marker
                      v-for="(measurement, index) in measurements"
                      :key="index"
                      :lat-lng="measurement.latlng"
                      :measurement="measurement.distance"
                      :title="measurement.title"
                      :rotation="measurement.rotation"
                      :measure-unit="measureUnit"
                />
            </l-layer-group>
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
                      :visible="overlayZones" >
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
            <l-playback
                    :track-data="trackData"
                    :time-zone="timeZone"
                    :is-playback="isPlayback"
                    :toggle-sidebar-calender="true"
                    @update:markerPos="moveMarker"
                    @toggle:datePicker="openSideBar"
                    ref="playback"
            />
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
import { LMap, LLayerGroup, LControlLayers, LControl, LTileLayer, LCircle, LPolyline, LPolygon, LMarker, LCircleMarker, LTooltip } from 'vue2-leaflet'
import SideBar from '../../../components/SideBar'
import MeasureMarker from '../../../components/MeasureMarker'
import LPlayback from '../../../components/LPlayback'
import Util from 'src/boot/mapUtil'

export default {
  name: 'VehicleLocation',
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
    LCircleMarker,
    LTooltip,
    // LPopup,
    // LIcon,
    'measure-marker': MeasureMarker,
    'side-bar': SideBar,
    LPlayback
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
      marker: {
        lat: 0,
        lng: 0,
        iconUrl: 'statics/pp/pin30_red.png',
        info: ''
      },
      showMarker: false,
      route: {
        latlngs: [],
        color: 'red',
        visible: true
      },

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
      filteredDeviceList: [],
      showLocations: false,
      curLocation: '',
      timeZone: 'GMT+08:00',
      timeOffset: 0,
      isPlayback: false,
      // last location info
      lastImgURL: 'statics/pp/CrosshairRed.gif',
      lastLocation: 'unavailable',
      lastDate: null,
      deviceID: '',
      shortName: '',
      startDate: null,
      startDateString: '',
      endDate: null,
      endDateString: '',
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
    startDate: function (val) {
      const newDate = new Date(val)
      this.startDateString = date.formatDate(newDate, 'DD/MM/YYYY HH:mm:ss')
    },
    endDate: function (val) {
      const newDate = new Date(val)
      this.endDateString = date.formatDate(newDate, 'DD/MM/YYYY HH:mm:ss')
    }
  },
  mounted () {
    this.formatFilterTimes(Date.now())
    this.getDeviceList()
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
    formatFilterTimes (val, isConverted = true) {
      let timestamp = val
      if (!isConverted) {
        timestamp = new Date(val * 1000)
      }
      this.startDate = date.formatDate(timestamp, 'YYYY-MM-DD 00:00')
      this.endDate = date.formatDate(timestamp, 'YYYY-MM-DD 23:59')
    },
    getStatusCode (code) {
      return Util.getStatusCode(code)
    },
    getMarkerInfo (d) {
      return Util.getMarkerInfo(d, this.timeZone)
    },
    getDeviceList: async function () {
      const params = {
        conditions: {}
      }
      if (LocalStorage.getItem('userLevel') !== 'admin') {
        params.conditions.accountID = LocalStorage.getItem('accountID')
      }
      // fetch vehicleList from "server"
      try {
        let res = await api.getAllVehicles(params)

        // clear out existing vehicleList and add new
        this.deviceList = res.data.vehicles
        this.filteredDeviceList = this.deviceList
        if (!this.$router.currentRoute.params.deviceID) {
          this.deviceID = this.deviceList[0].deviceID
        } else {
          this.deviceID = this.$router.currentRoute.params.deviceID
        }

        this.getLastEvent(this.deviceID)
      } catch (e) {
      }
    },
    filterDevice (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.filteredDeviceList = this.deviceList.filter(function (el) {
          if (el.deviceID && ((el.description ? el.description : el.deviceID) + '  [' + el.deviceID + ']').toLowerCase().indexOf(needle) > -1) {
            return el
          }
        })
      })
    },
    getLastEvent: async function (deviceID) {
      const params = {
        conditions: {
          deviceID: deviceID
        }
      }
      try {
        // this.loading = true
        let res = await api.getLastEvent(params)
        console.log('RES', res.data)

        if (res.data.event) {
          const data = res.data.event
          this.lastLocation = `${this.convertTimestamp(data.timestamp, true)} ${this.timeZone}`
          this.formatFilterTimes(data.timestamp, false)
          this.getVehicleRoute(deviceID, this.startDate, this.endDate)
        } else {
          this.lastLocation = 'unavailable'
          this.showMarker = false
          this.locationData = []
          this.route.latlngs = []
          this.center = {
            lat: 1.3512,
            lng: 104.0084
          }
          this.zoom = 4
          this.updateMeasurement()
        }

        this.loading = false
        this.remainTime = 30
        if (this.autoUpdate) {
          this.refreshCountStart()
        }
      } catch (e) {
        this.showMarker = false
        console.log('ERROR', e)
      }
    },
    getVehicleRoute: async function (deviceID, startTime, endTime) {
      const params = {
        conditions: {
          deviceID: deviceID
        }
      }
      if (startTime) {
        const startDate = new Date(startTime)
        const timeStamp = startDate.getTime() / 1000
        params.conditions.start = timeStamp - this.timeOffset
      }
      if (endTime) {
        const endDate = new Date(endTime)
        const timeStamp = endDate.getTime() / 1000
        params.conditions.end = timeStamp - this.timeOffset
      }

      const accountID = this.deviceList.find(device => device.deviceID === deviceID).accountID
      this.getOverlayZone(accountID)

      try {
        this.loading = true
        let res = await api.getRouteData(params)
        console.log('DATA', params, res.data)

        if (res.data.events) {
          this.trackData = []
          this.locationData = []
          this.route.latlngs = []
          const data = res.data.events
          this.shortName = data[0].displayName
          const bounds = {
            northBound: data[0].latitude,
            southBound: data[0].latitude,
            eastBound: data[0].longitude,
            westBound: data[0].longitude
          }

          data.map((item, idx) => {
            this.route.latlngs.push({
              lat: item.latitude,
              lng: item.longitude
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

          this.marker = {
            lat: data[data.length - 1].latitude,
            lng: data[data.length - 1].longitude,
            info: this.getMarkerInfo(this.locationData[data.length - 1])
          }
          this.showMarker = true

          // if (this.$refs.map) {
          this.$refs.map.mapObject.fitBounds([
            [bounds.northBound, bounds.westBound],
            [bounds.southBound, bounds.eastBound]
          ])
          // }

          this.trackData.push(Array.from(this.locationData).reverse())
          this.updateMeasurement()
          // this.marker.icon = Util.getHeadingMarkerURL(data)
          //
          // this.center = this.marker.position
          // this.zoom = 12
          // this.locationData.splice(0, 1, data)
        } else {
          this.lastLocation = 'unavailable'
          this.marker.visible = false

          this.center = {
            lat: 1.3512,
            lng: 104.0084
          }
          this.zoom = 4
        }

        this.loading = false
      } catch (e) {
        this.marker.visible = false
        console.log('ERROR', e)
      }
    },
    getOverlayZone: async function (accountID) {
      const params = {
        conditions: {
          accountID: accountID
        }
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
      console.log('UPDATE PLAYBACK STATUS')
    },
    openSideBar () {
      this.$refs.sideBar.openDevicePane()
    },
    moveMarker (data) {
      this.$refs.marker.mapObject.closeTooltip()
      this.marker = data[0]
      this.center = Object.assign({}, { lat: data[0].lat, lng: data[0].lng })
      this.$refs.map.mapObject.setView(this.center)
    },
    showToolTip (data) {
      this.isPlayback = false
      this.showLocations = false
      this.marker = Object.assign({}, { lat: data.latitude, lng: data.longitude, info: this.getMarkerInfo(data) })
      this.center = Object.assign({}, { lat: data.latitude, lng: data.longitude })
      this.$refs.map.mapObject.setView(this.center)
      this.$refs.marker.mapObject.openTooltip()
      this.$refs.playback.setTimestamp(data.timestamp)
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
    updateMap () {
      this.getVehicleRoute(this.deviceID, this.startDate, this.endDate)
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

      if (d < 10) {
        return d.toFixed(2) + ' ' + this.measureUnit
      } else if (d < 100) {
        return d.toFixed(1) + ' ' + this.measureUnit
      } else {
        return Math.round(d) + ' ' + this.measureUnit
      }
    },
    changeMeasureUnit () {
      if (this.measureUnit === 'km') {
        this.measureUnit = 'mi'
      } else {
        this.measureUnit = 'km'
      }
      this.updateMeasurement()
    },
    getStreetViewLink (d) {
      const flat = d.latitude.toFixed(5)
      const flon = d.longitude.toFixed(5)
      let mapLink = '<a href="https://maps.google.com/?q=' + d.latitude + ',' + d.longitude + '" target="_blank">'
      mapLink += flat + ' / ' + flon + '</a>'
      return mapLink
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
        this.getLastEvent(this.deviceID)
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
