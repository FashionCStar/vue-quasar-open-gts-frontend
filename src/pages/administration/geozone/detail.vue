<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-sm-12">
        <q-card>
          <side-bar>
            <template v-slot:firstPaneTitle>
              Geozone Info
            </template>
            <template v-slot:devicePane>
              <div class="q-pa-sm q-col-gutter-sm">
                <q-input outlined dense readonly v-model="zoneForm.geozoneID" :label="$t('geozoneID')"/>
                <q-input outlined dense v-model="zoneForm.description" label="Description (Address)" autofocus />
                <q-separator class="q-pt-none q-mt-sm"/>
                <q-select outlined dense v-model="zoneForm.priority"
                          :options="priorityOptions"
                          options-dense
                          options-cover
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          label="Overlap Priority"/>
                <q-select outlined dense v-model="zoneForm.groupID"
                          :options="groupList"
                          options-dense
                          options-cover
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          label="Assgin Group"/>
                <q-select outlined dense v-model="zoneForm.reverseGeocode"
                          :options="checkOptions"
                          options-dense
                          map-options
                          emit-value
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          label="Reverse Geocode"/>
                <q-select outlined dense v-model="zoneForm.arrivalStatusCode"
                          :options="arrivalCodes"
                          options-dense
                          map-options
                          emit-value
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          label="Arrival Status Code"/>
                <q-select outlined dense v-model="zoneForm.departureStatusCode"
                          :options="departureCodes"
                          options-dense
                          map-options
                          emit-value
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          label="Departure Status Code"/>
                <q-select outlined dense v-model="zoneForm.autoNotify"
                          :options="checkOptions"
                          options-dense
                          map-options
                          emit-value
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          label="Auto Notify"/>
                <q-select outlined dense v-model="zoneForm.shapeColor"
                          :options="shapeColors"
                          :option-label="opt => opt.label"
                          :option-value="opt => opt.value"
                          options-dense
                          map-options
                          emit-value
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          label="Zone Color"/>
                <q-input outlined dense v-model="zoneForm.zonePurposeID" label="Purpose ID"/>
                <q-separator class="q-pt-none q-mt-sm"/>
                <div class="text-center">
                  <q-btn label="save" color="primary" glossy @click="updateZone" />
                  <q-btn class="q-ml-sm" label="cancel"
                         color="primary" glossy
                         @click="$router.push('/zones')" />
                </div>
              </div>
            </template>
            <template v-slot:secondPaneTitle>
              Position Info
            </template>
            <template v-slot:locationPane>
              <div class="q-pa-sm q-col-gutter-sm">
                <q-input outlined dense
                         v-model="zoneForm.radius"
                         debounce="300"
                         label="Radius (meters)"
                         v-show="zoneForm.zoneType != 3"
                         @input="val => updateWeight(val)"
                />
                <q-separator class="q-pt-none q-mt-sm"/>
                <q-field class="q-pt-none" label="Cursor" stack-label >
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="0">{{ curLocation }}</div>
                  </template>
                </q-field>
                <q-table
                  title="Lat/Lon"
                  dense flat
                  :data="vertexMarkers"
                  :columns="columns"
                  class="q-mt-sm q-ml-sm"
                  :card-style="{backgroundColor: 'rgba(0, 0, 0, 0)'}">
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="id" :props="props">{{ props.row.id }}</q-td>
                      <q-td key="lat" :props="props">{{ props.row.lat.toFixed(5) }}</q-td>
                      <q-td key="lng" :props="props">{{ props.row.lng.toFixed(5) }}</q-td>
                    </q-tr>
                  </template>
                </q-table>
                <q-separator class="q-pt-none q-mt-sm"/>
                <div class="text-center">
                  <q-btn label="save" color="primary" glossy @click="updateZone" />
                  <q-btn class="q-ml-sm" label="cancel" color="primary" glossy
                         @click="$router.push('/zones')" />
                </div>
              </div>
            </template>
          </side-bar>
          <l-map style="height: calc(100vh - 125px); cursor: crosshair"
                 :zoom.sync="zoom"
                 :bounds="bounds"
                 :center.sync="center"
                 ref="map"
                 @baselayerchange="updateMapBounds"
                 @mousemove="onMouseMove"
                 @mousedown="onMouseDown"
                 @mouseup="onMouseUp"
                 @zoomend="updateWeight"
          >
            <q-resize-observer @resize="onResize"/>
            <l-control-layers :sort-layers="true" />
            <l-tile-layer
                    v-for="tileProvider in tileProviders"
                    :key="tileProvider.name"
                    :name="tileProvider.name"
                    :url="tileProvider.url"
                    :options="tileProvider.options"
                    :visible="tileProvider.visible"
                    layer-type="base"/>
            <l-feature-group>
              <l-polygon
                      :lat-lngs="vertexMarkers"
                      :weight="2"
                      :color="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                      :fillColor="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                      :visible="zoneForm.zoneType === 3"
              />
              <l-polyline
                      :lat-lngs="vertexMarkers"
                      :weight="corridorWidth"
                      :opacity="0.2"
                      :color="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                      :fillColor="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                      :visible="zoneForm.zoneType === 2"
              />
            </l-feature-group>
            <l-layer-group>
              <l-circle-marker
                      v-for="(vertexMarker, index) in vertexMarkers"
                      :key="'marker' + index"
                      :lat-lng="vertexMarker"
                      :radius="8"
                      :visible="zoneForm.zoneType > 0"
                      :opacity="0.8"
                      :weight="1"
                      :pane="'markerPane'"
                      :color="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                      :fillColor="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                      @mousedown="onVertexMouseDown"
                      @mouseup="onVertexMouseUp"
                      @click="onVertexMarkerClick"
                      @ready="onVertexReady"
                      ref="marker"
              />
              <l-circle-marker
                      v-for="(middleMarker, index) in middleMarkers"
                      :key="'middle' + index"
                      :lat-lng="middleMarker"
                      :radius="5"
                      :opacity="0.8"
                      :weight="1"
                      color="purple"
                      :pane="'markerPane'"
                      fillColor="purple"
                      :fillOpacity="0.8"
                      @mousedown="onMiddleMarkerMouseDown"
                      @click="onMiddleMarkerClick"
                      @ready="onMiddleMarkerReady"
                      ref="middleMarker"
              />
              <l-polyline
                      :lat-lngs="forwardGuideLine"
                      :weight="1"
                      :color="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                      :dash-array="'5,10'"
                      :interactive="false"
                      :visible="zoneForm.zoneType >= 2 && isDrawing"
              />
              <l-polyline
                      :lat-lngs="backwardGuideLine"
                      :weight="1"
                      :color="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                      :dash-array="'5,10'"
                      :interactive="false"
                      :visible="zoneForm.zoneType === 3 && isDrawing"
              />
            </l-layer-group>
            <l-circle
                    :lat-lng="vertexMarkers[0]"
                    :radius="parseInt(zoneForm.radius)"
                    :visible="zoneForm.zoneType == 0"
                    :opacity="0.8"
                    :weight="1"
                    :color="zoneForm.shapeColor ? `${zoneForm.shapeColor}` : `${defaultShapeColor}` "
                    :fillColor="`${zoneForm.shapeColor}`"
                    ref="zonePoint"
                    @mousedown="onVertexMouseDown"
                    @click="onVertexMarkerClick"
            />
          </l-map>

        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { api } from 'src/boot/api'
import { LocalStorage } from 'quasar'
import L from 'leaflet'
import { LMap, LControlLayers, LTileLayer, LLayerGroup, LFeatureGroup, LCircle, LCircleMarker, LPolyline, LPolygon } from 'vue2-leaflet'
import Util from 'src/boot/mapUtil'
import SideBar from '../../../components/SideBar'

export default {
  name: 'GeozoneDetail',
  components: {
    LMap,
    LControlLayers,
    LTileLayer,
    LLayerGroup,
    LFeatureGroup,
    LCircle,
    LCircleMarker,
    LPolyline,
    LPolygon,
    'side-bar': SideBar
  },
  data () {
    return {
      priorityOptions: [ 0, 1, 2, 3, 4, 5 ],
      groupList: [],
      checkOptions: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' }
      ],
      arrivalCodes: Util.arrivalCodes,
      departureCodes: Util.departureCodes,
      shapeColors: Util.shapeColors,
      accountID: '',
      defaultShapeColor: '#11a522',

      zoneForm: {
        geozoneID: '',
        description: '',
        priority: 0,
        groupID: '',
        reverseGeocode: 1,
        arrivalStatusCode: 0,
        departureStatusCode: 0,
        autoNotify: 0,
        shapeColor: '#11a522',
        radius: 0,
        zonePurposeID: '',
        zoneType: 0
      },

      vertexMarkers: [],
      middleMarkers: [],
      pathSegments: [],
      showGuideLine: false,
      forwardGuideLine: [],
      backwardGuideLine: [],
      minVertexes: 2,
      closed: false,
      isDrawing: false,
      mouseDown: null,
      corridorWidth: 10,
      draggingVertex: -1,
      movingVertex: false,
      hasChange: false,

      // Map Params
      tileProviders: Util.tileProviders,
      center: {
        lat: 1.3512,
        lng: 104.0084
      },
      bounds: [],
      zoom: 7,

      columns: [
        { name: 'id', align: 'center', field: 'id', label: '#' },
        { name: 'lat', align: 'center', field: 'lat', label: 'Lat' },
        { name: 'lng', align: 'center', field: 'lng', label: 'Lng' }
      ],

      loading: true,
      curLocation: ''
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
    this.zoneForm.geozoneID = this.$router.currentRoute.params.id
    this.accountID = this.$router.currentRoute.params.accountID
    this.getGroupList()
  },
  beforeRouteLeave (to, from, next) {
    if (this.hasChange) {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Would you like to save changes?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.updateZone()
        next()
      }).onCancel(() => {
        next()
      })
    } else {
      next()
    }
  },
  methods: {
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
        const deviceGroups = res.data.devicegroups
        this.groupList = deviceGroups.map(group => group.groupID)
        this.groupList.unshift('all')
        this.getZoneByID()
      } catch (e) {
      }
    },
    getZoneByID: async function () {
      const params = {
        conditions: {
          geozoneID: this.zoneForm.geozoneID
        }
      }

      try {
        let res = await api.getZoneByID(params)
        if (res.data) {
          const data = res.data.zone
          this.zoneForm = data
          if (this.zoneForm.groupID === '') {
            this.zoneForm.groupID = 'all'
          }
          this.vertexMarkers.splice(0, this.vertexMarkers.length)

          for (let i = 1; i <= 10; i++) {
            if (data['latitude' + i] && data['longitude' + i] && data['latitude' + i] !== 0 && data['longitude' + i] !== 0) {
              this.vertexMarkers.push({
                id: i,
                lat: data['latitude' + i],
                lng: data['longitude' + i]
              })
            }
          }

          if (data.vertices) {
            const points = data.vertices.split(',')
            points.map(point => {
              const pos = point.split('/')
              this.vertexMarkers.push({
                id: this.vertexMarkers.length,
                lat: parseFloat(pos[0]),
                lng: parseFloat(pos[1])
              })
            })
          }

          if (this.vertexMarkers.length > 0) {
            if (this.zoneForm.zoneType === 0) {
              // this.center = this.vertexMarkers[0]
              // this.$refs.map.setCenter(this.vertexMarkers[0])
              this.$refs.map.mapObject.setView(this.vertexMarkers[0], 15)
              // this.zoom = 15
            } else {
              this.bounds = [
                [data.minLatitude, data.minLongitude],
                [data.maxLatitude, data.maxLongitude]
              ]
            }
          } else {
            this.isDrawing = true
          }
        }

        switch (this.zoneForm.zoneType) {
          case 0:
            this.minVertexes = 1
            this.closed = false
            break
          case 2:
            this.minVertexes = 2
            this.closed = false
            break
          case 3:
            this.minVertexes = 3
            this.closed = true
        }

        this.createMiddleMarkers()
        this.updateWeight()

        this.loading = false
      } catch (e) {
        this.$router.push('/zones')
      }
    },
    onSubmit () {
      // console.log('CURRRENT POINT', this.curPoint)
    },
    updateZone: async function () {
      this.zoneForm.arrivalZone = this.zoneForm.arrivalStatusCode !== 0 ? 1 : 0
      this.zoneForm.departureZone = this.zoneForm.departureStatusCode !== 0 ? 1 : 0
      for (let i = 0; i < 10; i++) {
        this.zoneForm['latitude' + (i + 1)] = 0
        this.zoneForm['longitude' + (i + 1)] = 0
      }

      if (this.vertexMarkers.length > 0) {
        this.zoneForm.minLatitude = this.vertexMarkers[0].lat
        this.zoneForm.maxLatitude = this.vertexMarkers[0].lat
        this.zoneForm.minLongitude = this.vertexMarkers[0].lng
        this.zoneForm.maxLongitude = this.vertexMarkers[0].lng

        const vertices = []
        for (let i = 0; i < this.vertexMarkers.length; i++) {
          const lat = parseFloat(this.vertexMarkers[i].lat.toFixed(5))
          const lng = parseFloat(this.vertexMarkers[i].lng.toFixed(5))
          if (i < 10) {
            this.zoneForm['latitude' + (i + 1)] = lat
            this.zoneForm['longitude' + (i + 1)] = lng
          } else {
            vertices.push(`${lat}/${lng}`)
          }

          if (this.vertexMarkers[i].lat < this.zoneForm.minLatitude) {
            this.zoneForm.minLatitude = parseFloat(this.vertexMarkers[i].lat.toFixed(5))
          }
          if (this.vertexMarkers[i].lat > this.zoneForm.maxLatitude) {
            this.zoneForm.maxLatitude = parseFloat(this.vertexMarkers[i].lat.toFixed(5))
          }
          if (this.vertexMarkers[i].lng < this.zoneForm.minLongitude) {
            this.zoneForm.minLongitude = parseFloat(this.vertexMarkers[i].lng.toFixed(5))
          }
          if (this.vertexMarkers[i].lng > this.zoneForm.maxLongitude) {
            this.zoneForm.maxLongitude = parseFloat(this.vertexMarkers[i].lng.toFixed(5))
          }
        }

        this.zoneForm.vertices = vertices.join(',')
      }

      // console.log('SAVE DATA', this.zoneForm)
      const params = {
        conditions: {
          accountID: this.zoneForm.accountID,
          geozoneID: this.zoneForm.geozoneID
        },
        data: this.zoneForm
      }

      try {
        let res = await api.updateZone(params)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.zoneForm.geozoneID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
      } catch (e) {
      }
    },
    updateMapBounds (e) {
      this.$q.cookies.set('tileprovider', e.layer.options.id, {
        expires: 3
      })

      const bounds = e.layer.options.bounds
      // console.log('MAP BOUNDS', bounds, this.$refs.map.mapObject.getCenter())
      if (bounds) {
        // this.bounds = bounds
        this.$refs.map.mapObject.setMaxBounds(bounds)
      } else {
        this.bounds = null
        this.$refs.map.mapObject.setMaxBounds(null)
      }
    },
    onResize () {
      this.$refs.map.mapObject.invalidateSize()
    },
    onMouseDown: function (e) {
      if (!this.isDrawing) return
      if (e.originalEvent.which !== 1) return
      this.mouseDown = e
    },
    onMouseUp: function (e) {
      if (this.mouseDown) {
        const mouseDown = this.mouseDown
        this.mouseDown = null
        const origin = L.point(mouseDown.originalEvent.clientX, mouseDown.originalEvent.clientY)
        const distance = L.point(e.originalEvent.clientX, e.originalEvent.clientY).distanceTo(origin)
        if (Math.abs(distance) < 9 * (window.devicePixelRatio || 1)) this.processDrawingClick(e)
      }

      this.$refs.map.mapObject.dragging.enable()
      this.draggingVertex = -1
    },
    onMouseMove (e) {
      if (e.latlng) {
        this.curLocation = e.latlng.lat.toFixed(5) + ', ' + e.latlng.lng.toFixed(5)
      }

      if (this.isDrawing && this.vertexMarkers.length > 0) {
        this.forwardGuideLine.splice(1, 1, { lat: e.latlng.lat, lng: e.latlng.lng })
        this.backwardGuideLine.splice(1, 1, { lat: e.latlng.lat, lng: e.latlng.lng })
      }

      if (this.draggingVertex !== -1) {
        this.vertexMarkers.splice(this.draggingVertex, 1, {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          id: this.draggingVertex + 1
        })

        this.resetMiddleMarker(this.draggingVertex)
        this.movingVertex = true
        this.hasChange = true
      }
    },
    processDrawingClick: function (e) {
      if (!this.isDrawing) return
      if (this.zoneForm.zoneType === 0) {
        this.vertexMarkers.splice(0, 1, {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          id: 1
        })

        this.center = e.latlng
        this.zoom = 15
        this.hasChange = true
      } else {
        this.vertexMarkers.push({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          id: this.vertexMarkers.length + 1
        })

        if (this.vertexMarkers.length > 1) {
          this.addMiddleMarker(this.vertexMarkers.length - 1)
        }

        this.forwardGuideLine.splice(0, 1, { lat: e.latlng.lat, lng: e.latlng.lng })
        if (this.vertexMarkers.length === 1) {
          this.backwardGuideLine.splice(0, 1, { lat: e.latlng.lat, lng: e.latlng.lng })
        }
        this.hasChange = true
      }
    },
    onVertexReady: function (e) {
      // if (this.isDrawing) {
      //   L.DomEvent.disableClickPropagation(e)
      // }
    },
    onVertexMouseDown: function (e) {
      this.$refs.map.mapObject.dragging.disable()
      const index = this.getVertexIndex(e.target._latlng)
      this.draggingVertex = index
    },
    onVertexMouseUp: function (e) {
      this.mouseDown = null
    },
    onVertexMarkerClick: function (e) {
      const index = this.getVertexIndex(e.target._latlng)
      let commit = false

      if (!this.isDrawing) {
        if (this.movingVertex) {
          this.movingVertex = false
        } else {
          this.onVertexRawMarkerClick(index)
        }
        return
      }

      if (index === this.vertexMarkers.length - 1 && this.isDrawing) {
        if (index >= this.minVertexes - 1) commit = true
      } else if (index === 0 && this.vertexMarkers.length >= this.minVertexes && this.closed && this.isDrawing) {
        commit = true // Allow to close on first point also for polygons
      } else {
        this.onVertexRawMarkerClick(index)
      }

      if (commit) {
        this.isDrawing = false
      }
    },
    getVertexIndex: function (latlng) {
      for (let i = 0; i < this.vertexMarkers.length; i++) {
        const vertex = this.vertexMarkers[i]
        if (vertex.lat === latlng.lat && vertex.lng === latlng.lng) {
          return i
        }
      }
    },
    onVertexRawMarkerClick: function (index) {
      if (this.vertexMarkers.length > this.minVertexes) {
        this.vertexMarkers.splice(index, 1)
        this.middleMarkers.splice(index, 1)
        if (!this.closed && index === this.middleMarkers.length) {
          this.middleMarkers.splice(index - 1, 1)
        }
        const leftIndex = this.closed ? (index - 1 + this.vertexMarkers.length) % this.vertexMarkers.length : index - 1
        const rightIndex = this.closed ? index % this.vertexMarkers.length : index
        const left = this.vertexMarkers[leftIndex]
        const right = this.vertexMarkers[rightIndex]

        if (left && right) this.updateMiddleMarker(index - 1, left, right)
        this.resetVertexIds()
        this.hasChange = true
      }
    },
    resetVertexIds: function () {
      for (let i = 0; i < this.vertexMarkers.length; i++) {
        const marker = this.vertexMarkers[i]
        this.vertexMarkers.splice(i, 1, {
          lat: marker.lat,
          lng: marker.lng,
          id: i + 1
        })
      }
    },
    createMiddleMarkers: function () {
      const len = this.closed ? this.vertexMarkers.length : this.vertexMarkers.length - 1
      for (let i = 0; i < len; i++) {
        const left = this.vertexMarkers[i]
        const right = this.vertexMarkers[(i + 1) % this.vertexMarkers.length]
        this.middleMarkers.push({
          lat: (left.lat + right.lat) / 2,
          lng: (left.lng + right.lng) / 2
        })
      }
    },
    addMiddleMarker: function (index) {
      const left = this.vertexMarkers[index - 1]
      const right = this.vertexMarkers[index]
      this.updateMiddleMarker(index - 1, left, right)

      if (this.vertexMarkers.length > 2 && this.closed) {
        this.resetLastMiddleMarker()
      }
    },
    resetLastMiddleMarker: function () {
      const left = this.vertexMarkers[0]
      const right = this.vertexMarkers[this.vertexMarkers.length - 1]
      this.updateMiddleMarker(this.vertexMarkers.length - 1, left, right)
    },
    resetMiddleMarker: function (index) {
      const center = this.vertexMarkers[index]
      const leftIndex = this.closed ? (index - 1 + this.vertexMarkers.length) % this.vertexMarkers.length : index - 1
      const rightIndex = this.closed ? (index + 1) % this.vertexMarkers.length : index + 1
      const left = this.vertexMarkers[leftIndex]
      const right = this.vertexMarkers[rightIndex]

      if (left) this.updateMiddleMarker(index - 1, center, left)
      if (right) this.updateMiddleMarker(index, center, right)
    },
    updateMiddleMarker: function (index, left, right) {
      this.middleMarkers.splice(index, 1, {
        lat: (left.lat + right.lat) / 2,
        lng: (left.lng + right.lng) / 2
      })
    },
    onMiddleMarkerReady: function (e) {
      // L.DomEvent.disableClickPropagation(e)
    },
    onMiddleMarkerMouseDown: function (e) {
      this.$refs.map.mapObject.dragging.disable()
      // const index = this.getVertexIndex(e.target._latlng)
      // this.draggingVertex = index
    },
    onMiddleMarkerClick: function (e) {
      const index = this.getMiddleVertexIndex(e.target._latlng)
      this.vertexMarkers.splice(index + 1, 0, {
        lat: e.target._latlng.lat,
        lng: e.target._latlng.lng
      })
      this.middleMarkers.splice(index + 1, 0, {
        lat: e.target._latlng.lat,
        lng: e.target._latlng.lng
      })

      const rightIndex = this.closed ? (index + 2) % this.vertexMarkers.length : index + 2
      const center = this.vertexMarkers[index + 1]
      const left = this.vertexMarkers[index]
      const right = this.vertexMarkers[rightIndex]

      if (left) this.updateMiddleMarker(index, center, left)
      if (right) this.updateMiddleMarker(index + 1, center, right)
      this.resetVertexIds()
      this.hasChange = true
    },
    getMiddleVertexIndex: function (latlng) {
      for (let i = 0; i < this.middleMarkers.length; i++) {
        const middleMarker = this.middleMarkers[i]
        if (middleMarker.lat === latlng.lat && middleMarker.lng === latlng.lng) {
          return i
        }
      }
    },
    updateWeight: function () {
      this.corridorWidth = Math.round(this.getRadiusPixel(this.zoneForm.radius)) * 2
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
<style scoped>
  .q-table th {
    font-size: 14px;
  }
  .q-table tbody td {
    font-size: 14px;
  }
</style>
