<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-sm-12">
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
                  <!--                  <q-btn class="q-mt-sm q-ml-sm" label="Last" color="primary" glossy type="submit" />-->
                  <!--                  <q-btn class="q-mt-sm q-ml-sm" label="Auto" color="primary" glossy type="reset"/>-->
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
              Location Info
            </template>
            <template v-slot:locationPane>
              <div class="q-pa-sm">
                <q-table
                        title="Location Details"
                        dense flat
                        :data="locationData"
                        :columns="columns"
                        :pagination.sync="pagination"
                        :card-style="{backgroundColor: 'rgba(0, 0, 0, 0)'}" >
                  <template v-slot:header="props">
                    <q-tr :props="props">
                      <q-th :props="col.props" v-for="(col, index) in props.cols" :key="index" :align="col.align" style="font-size: 12px">{{col.label}}</q-th>
                    </q-tr>
                  </template>
                  <template v-slot:body="props">
                    <q-tr>
                      <q-td key="number" :props="props" style="font-size: 12px; text-decoration: underline; cursor: pointer"
                            @click="showToolTip(props.row)"> {{ props.row.id }} </q-td>
                      <q-td key="time" :props="props" style="font-size: 12px">{{ convertTimestamp(props.row.timestamp) }}</q-td>
                      <q-td key="status" :props="props" style="font-size: 12px">{{ getStatusCode(props.row.statusCode) }}</q-td>
                      <q-td key="position" :props="props" style="font-size: 12px">{{ `${props.row.latitude.toFixed(4)}/${props.row.longitude.toFixed(4)}` }}</q-td>
                      <q-td key="speed" :props="props" style="font-size: 12px">{{ props.row.speedKPH.toFixed(1) }}</q-td>
                      <q-td key="heading" :props="props" style="font-size: 12px">{{ props.row.heading }}</q-td>
                      <q-td key="address" :props="props" style="font-size: 12px">{{ props.row.address }}</q-td>
                    </q-tr>
                  </template>
                </q-table>
<!--                <q-btn class="q-mt-md full-width bg-white shadow-2 text-primary" label="Location Detail" @click="showLocations = true"/>-->
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
            <l-control position="bottomright">
              <q-btn color="primary"
                     round
                     :icon="isClustering ? 'bubble_chart' : 'group_work'"
                     @click="changeClusterMode" />
            </l-control>
            <l-control-layers :sort-layers="true" />
            <l-tile-layer
                    v-for="tileProvider in tileProviders"
                    :key="tileProvider.name"
                    :name="tileProvider.name"
                    :url="tileProvider.url"
                    :options="tileProvider.options"
                    :visible="tileProvider.visible"
                    layer-type="base"/>
            <l-marker
                    v-for="(marker, index) in markers"
                    :key="index"
                    :lat-lng="marker"
                    :visible="!isClustering"
            >
              <l-tooltip
                      :content.sync="marker.info"
                      :options="{ permanent: true, direction: 'top' }"
              />
            </l-marker>
            <l-marker-cluster
                    :options="{
                      showCoverageOnHover: false
                    }"
            >
              <l-marker
                      v-for="(marker, index) in markers"
                      :key="index"
                      :lat-lng="marker"
                      :visible="isClustering"
              >
                <l-tooltip
                        :content.sync="marker.info"
                        :options="{ permanent: true, direction: 'top' }"
                />
              </l-marker>
            </l-marker-cluster>
            <l-playback
                    :track-data="trackData"
                    :time-zone="timeZone"
                    :is-playback="isPlayback"
                    :use-slider="false"
                    @update:boundTime="updateMarker"
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
import { latLng } from 'leaflet'
import { LMap, LControlLayers, LTileLayer, LMarker, LTooltip, LControl } from 'vue2-leaflet'
import SideBar from '../../../components/SideBar'
import LPlayback from '../../../components/LPlayback'
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import Util from 'src/boot/mapUtil'

export default {
  name: 'GroupLocation',
  components: {
    LMap,
    LControlLayers,
    LControl,
    LTileLayer,
    // LLayerGroup,
    // LPolyline,
    LMarker,
    // LCircleMarker,
    LTooltip,
    // LPopup,
    // LIcon,
    'l-marker-cluster': Vue2LeafletMarkerCluster,
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
      groupID: null
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
  },
  mounted () {
    const now = new Date()
    this.lastTime = now.getTime() / 1000
    this.getGroupList()
  },
  methods: {
    convertTimestamp (val, showTimeZone = false) {
      const offset = showTimeZone ? this.timeOffset : 0

      const timeStamp = new Date((val + offset) * 1000)
      return date.formatDate(timeStamp, 'YYYY-MM-DD HH:mm:ss')
    },
    getCompass (heading) {
      return Util.getCompass(heading)
    },
    getStatusCode (code) {
      return Util.getStatusCode(code)
    },
    getMarkerInfo (d) {
      const dev = d.deviceID.toUpperCase()
      const spdfmt = d.speedKPH.toFixed(1) + ' km/h'
      const compass = this.getCompass(d.heading)

      let str = '<span>' + dev + '</span><br>'
      str += '<span>' + spdfmt + '</span><br>'
      if (d.speedKPH > 0) {
        const head = d.heading.toFixed(0) + '&deg; &nbsp;(' + compass + ')'
        str += '<span>' + head + '</span>'
      }
      return str
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
          lastTime: this.lastTime
        }
      }

      if (this.groupID !== 'All') {
        params.conditions.groupID = this.groupID
        params.conditions.accountID = this.groupList.find(group => group.groupID === this.groupID).accountID
      }

      try {
        this.loading = true
        let res = await api.getGroupLastEvent(params)
        console.log('RESULT', res)

        if (res.data.event) {
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
            this.markers.push({
              id: data.length - idx,
              lat: item.latitude,
              lng: item.longitude,
              info: this.getMarkerInfo(item)
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
      } catch (e) {
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
      try {
        this.loading = true
        let res = await api.getRouteData(params)
        console.log('DATA', res.data)

        if (res.data.events) {
          this.trackData = []
          this.locationData = []
          this.route.latlngs = []
          const data = res.data.events
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
            lng: data[data.length - 1].longitude
          }
          this.marker.visible = true
          this.marker.info = this.getMarkerInfo(this.locationData[data.length - 1])

          this.$refs.map.mapObject.fitBounds([
            [bounds.northBound, bounds.westBound],
            [bounds.southBound, bounds.eastBound]
          ])

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
    onSubmit () {
      console.log('UPDATE PLAYBACK STATUS, PRUNE CLUSTER')
    },
    updateMarker (time) {
      this.lastTime = time
      this.getLastEvents()
    },
    showToolTip (data) {
      this.isPlayback = false
      this.showLocations = false
      this.marker.lat = data.latitude
      this.marker.lng = data.longitude
      this.marker.info = this.getMarkerInfo(data)
      this.$refs.marker.mapObject.openTooltip()
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
      const { deviceID, startDate, endDate } = this.locationForm
      this.getVehicleRoute(deviceID, startDate, endDate)
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
    }
  }
}
</script>
