<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-sm-12">
        <q-card>
          <side-bar>
            <template v-slot:firstPaneTitle>
              Device Info
            </template>
            <template v-slot:devicePane>
              <div class="q-pa-sm q-col-gutter-sm">
                <q-select outlined v-model="locationForm.deviceID"
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
                         v-model="locationForm.startDate"
                         label="From"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date v-model="locationForm.startDate" mask="YYYY-MM-DD HH:mm" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>

                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="locationForm.startDate" mask="YYYY-MM-DD HH:mm" format24h />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input filled stack-label
                         v-model="locationForm.endDate"
                         label="To"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date v-model="locationForm.endDate" mask="YYYY-MM-DD HH:mm" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>

                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="locationForm.endDate" mask="YYYY-MM-DD HH:mm" format24h />
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
                  <q-btn class="q-mt-sm q-ml-sm" label="Auto" color="primary" glossy/>
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
                      <q-td key="number" :props="props" style="font-size: 12px; text-decoration: underline; cursor: pointer" @click="showToolTip">1</q-td>
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
                 @resize="onSubmit"
                 @baselayerchange="updateMapBounds"
                 @mousemove="getCursorLocation"
          >
            <q-resize-observer @resize="onResize"/>
<!--            <l-control-polyline-measure :options="{ showUnitControl: true }" position="bottomright"/>-->
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
                    :lat-lng="marker.position"
                    :visible="marker.visible"
                    ref="marker"
            >
              <l-tooltip
                      :content="marker.info"
                      :visible="true"
              />
            </l-marker>
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
import { LMap, LControlLayers, LTileLayer, LMarker, LTooltip } from 'vue2-leaflet'
import Util from 'src/boot/mapUtil'

export default {
  name: 'LastLocation',
  components: {
    LMap,
    LControlLayers,
    LTileLayer,
    LMarker,
    LTooltip,
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
      locationForm: {
        deviceID: null,
        startDate: null,
        endDate: null
      }
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
    this.formatFilterTimes(Date.now())
    this.getDeviceList()
  },
  methods: {
    convertTimestamp (val, showTimeZone = false) {
      const offset = showTimeZone ? this.timeOffset : 0

      const timeStamp = new Date((val + offset) * 1000)
      return date.formatDate(timeStamp, 'YYYY-MM-DD HH:mm:ss')
    },
    formatFilterTimes (val, isConverted = true) {
      let timestamp = val
      if (!isConverted) {
        timestamp = new Date(val * 1000)
      }
      this.locationForm.startDate = date.formatDate(timestamp, 'YYYY-MM-DD 00:00')
      this.locationForm.endDate = date.formatDate(timestamp, 'YYYY-MM-DD 23:59')
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
        this.locationForm.deviceID = this.deviceList[0].deviceID
        this.getLastEvent(this.locationForm.deviceID, null, null)
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
      try {
        let res = await api.getLastEvent(params)
        console.log('DATA', res.data.event)

        if (res.data.event) {
          const data = res.data.event
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

        // this.filteredDeviceList = this.deviceList
        // this.locationForm.deviceID = this.deviceList[0].deviceID
        // this.getLastEvent(this.locationForm.deviceID)
      } catch (e) {
        this.marker.visible = false
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
      const { deviceID, startDate, endDate } = this.locationForm
      this.getLastEvent(deviceID, startDate, endDate)
    },
    updateOffset () {
      this.timeOffset = this.timeZoneList.find(zone => zone.desc === this.timeZone).offset
    }
  }
}
</script>
