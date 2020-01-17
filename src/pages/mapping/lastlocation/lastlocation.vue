<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-xs-12">
        <q-card>
          <side-bar>
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
              </div>
            </template>
            <template v-slot:secondPaneTitle>
              {{deviceID + (shortName ? ' (' + shortName + ')' : '')}} Info
            </template>
            <template v-slot:locationPane>
              <div class="q-pa-sm">
                <q-list  v-for="(event, index) in locationData"
                         :key="'event' + index">
                  <q-item clickable
                          @click="showToolTip"
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
                 @resize="onSubmit"
                 @baselayerchange="updateMapBounds"
                 @mousemove="getCursorLocation"
          >
            <q-resize-observer @resize="onResize"/>
<!--            <l-control-polyline-measure :options="{ showUnitControl: true }" position="bottomright"/>-->
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
            <l-marker
                    :lat-lng="marker.position"
                    :visible="marker.visible"
                    ref="marker"
            >
              <l-tooltip
                      :content="marker.info"
                      :options="{
                          direction: 'bottom',
                          className: 'leaflet-tooltip-rounded-border' }"
                      :visible="true"
              />
            </l-marker>
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
import SideBar from '../../../components/SideBar'
// import LControlPolylineMeasure from 'vue2-leaflet-polyline-measure'
import L from 'leaflet'
import { LMap, LControlLayers, LTileLayer, LMarker, LTooltip, LCircle, LPolygon, LPolyline, LLayerGroup, LControl } from 'vue2-leaflet'
import Util from 'src/boot/mapUtil'

export default {
  name: 'LastLocation',
  components: {
    LMap,
    LControlLayers,
    LTileLayer,
    LLayerGroup,
    LMarker,
    LTooltip,
    LCircle,
    LPolyline,
    LPolygon,
    LControl,
    // LControlPolylineMeasure,
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
      marker: {
        position: {
          lat: 0, lng: 0
        },
        iconUrl: 'statics/pp/pin30_red.png',
        visible: false,
        info: ''
      },
      polygon: {
        latlngs: [
          { lat: 47.2263299, lng: -1.6222 },
          { lat: 47.21024000000001, lng: -1.6270065 },
          { lat: 47.1969447, lng: -1.6136169 },
          { lat: 47.18527929999999, lng: -1.6143036 },
          { lat: 47.1794457, lng: -1.6098404 },
          { lat: 47.1775788, lng: -1.5985107 },
          { lat: 47.1676598, lng: -1.5753365 },
          { lat: 47.2657179, lng: -1.589241 },
          { lat: 47.2589612, lng: -1.6204834 },
          { lat: 47.237287, lng: -1.6266632 }
        ],
        color: 'red'
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

      locationData: [],
      timeZoneList: Util.timeZoneList,

      loading: true,
      accountID: '',
      deviceList: [],
      filteredDeviceList: [],
      showLocations: false,
      curLocation: '',
      timeZone: 'GMT+08:00',
      timeOffset: 0,
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
        this.deviceID = this.deviceList[0].deviceID
        this.getLastEvent(this.deviceID, null, null)
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
    getLastEvent: async function (deviceID, startTime, endTime) {
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
        // this.loading = true
        let res = await api.getLastEvent(params)
        console.log('DATA', res.data.event)

        if (res.data.event) {
          const data = res.data.event
          this.shortName = data.displayName
          data.id = 1
          this.lastLocation = `${this.convertTimestamp(data.timestamp, true)} ${this.timeZone}`
          this.formatFilterTimes(data.timestamp, false)

          this.marker.position = {
            lat: data.latitude,
            lng: data.longitude
          }
          this.marker.visible = true
          this.marker.info = this.getMarkerInfo(data)
          this.marker.icon = Util.getHeadingMarkerURL(data)

          this.center = this.marker.position
          this.zoom = 12
          this.locationData.splice(0, 1, data)
        } else {
          this.lastLocation = 'unavailable'
          this.marker.visible = false
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
      console.log('CURRRENT POINT')
    },
    showToolTip () {
      this.showLocations = false
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
      this.getLastEvent(this.deviceID, this.startDate, this.endDate)
    },
    updateOffset () {
      this.timeOffset = this.timeZoneList.find(zone => zone.desc === this.timeZone).offset
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
        this.getLastEvent(this.deviceID, null, null)
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
