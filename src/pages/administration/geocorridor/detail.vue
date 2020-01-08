<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-xs-12">
        <q-card>
          <side-bar>
            <template v-slot:firstPaneTitle>
              Geocorridor Info
            </template>
            <template v-slot:devicePane>
              <div class="q-pa-sm q-col-gutter-sm">
                <q-input outlined dense readonly v-model="corridorForm.corridorID" :label="$t('corridorID')"/>
                <q-input outlined dense v-model="corridorForm.description" label="Description" autofocus />
                <q-separator class="q-pt-none q-mt-sm"/>
                <div class="text-center">
                  <q-btn label="save" color="primary" glossy @click="updateCorridor" />
                  <q-btn class="q-ml-sm" label="cancel"
                         color="primary" glossy
                         @click="$router.push('/corridors')" />
                </div>
              </div>
            </template>
            <template v-slot:secondPaneTitle>
              Position Info
            </template>
            <template v-slot:locationPane>
              <div class="q-pa-sm q-col-gutter-sm">
                <q-input outlined dense
                         v-model="corridorForm.radius"
                         debounce="300"
                         label="Radius (meters)"
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
                  <q-btn label="save" color="primary" glossy @click="updateCorridor" />
                  <q-btn class="q-ml-sm" label="cancel" color="primary" glossy
                         @click="$router.push('/corridors')" />
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
            <l-control position="bottomleft">
              <div style="width: 230px; border-radius: 10px">
                <q-toolbar class="bg-indigo-6 text-white rounded-borders">
                  <q-input dark standout dense
                           v-model="targetPos"
                           label="Position" />
                  <q-btn class="q-ml-sm"
                         round dense
                         flat
                         icon="search"
                         @click="trackPos"
                  />
                </q-toolbar>
              </div>
            </l-control>
            <l-tile-layer
                    v-for="tileProvider in tileProviders"
                    :key="tileProvider.name"
                    :name="tileProvider.name"
                    :url="tileProvider.url"
                    :options="tileProvider.options"
                    :visible="tileProvider.visible"
                    :attribution="tileProvider.attribution"
                    layer-type="base"/>
            <l-feature-group>
              <l-polyline
                      :lat-lngs="vertexMarkers"
                      :weight="corridorWidth"
                      :opacity="0.2"
                      :color="shapeColor"
                      :fillColor="shapeColor"
                      v-if="vertexMarkers.length > 1"
              />
            </l-feature-group>
            <l-layer-group>
              <l-circle-marker
                      v-for="(vertexMarker, index) in vertexMarkers"
                      :key="'marker' + index"
                      :lat-lng="vertexMarker"
                      :radius="8"
                      :opacity="0.8"
                      :weight="1"
                      :pane="'markerPane'"
                      :color="shapeColor"
                      :fillColor="shapeColor"
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
                      :color="shapeColor"
                      :dash-array="'5,10'"
                      :interactive="false"
                      :visible="isDrawing"
              />
            </l-layer-group>
          </l-map>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { api } from 'src/boot/api'
import L from 'leaflet'
import { LMap, LControlLayers, LTileLayer, LLayerGroup, LFeatureGroup, LCircleMarker, LPolyline, LControl } from 'vue2-leaflet'
import Util from 'src/boot/mapUtil'
import SideBar from '../../../components/SideBar'

export default {
  name: 'CorridorDetail',
  components: {
    LMap,
    LControlLayers,
    LControl,
    LTileLayer,
    LLayerGroup,
    LFeatureGroup,
    LCircleMarker,
    LPolyline,
    'side-bar': SideBar
  },
  data () {
    return {
      accountID: '',
      shapeColor: '#11a522',

      corridorForm: {
        corridorID: '',
        radius: 50,
        displayName: '',
        description: ''
      },

      vertexMarkers: [],
      middleMarkers: [],
      showGuideLine: false,
      forwardGuideLine: [],
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
      curLocation: '',
      targetPos: '1.3512, 104.0084'
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
    this.corridorForm.corridorID = this.$router.currentRoute.params.id
    this.accountID = this.$router.currentRoute.params.accountID
    this.getCorridorByID()
  },
  beforeRouteLeave (to, from, next) {
    if (this.hasChange) {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Would you like to save changes?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.updateCorridor()
        next()
      }).onCancel(() => {
        next()
      })
    } else {
      next()
    }
  },
  methods: {
    getCorridorByID: async function () {
      const params = {
        conditions: {
          accountID: this.accountID,
          corridorID: this.corridorForm.corridorID
        }
      }

      try {
        let res = await api.getCorridorByID(params)
        if (res.data) {
          const data = res.data.corridor
          this.corridorForm = data.corridorInfo

          for (let i = 0; i < data.corridorList.length; i++) {
            const positions = data.corridorList[i]
            for (let pos = 1; pos <= 10; pos++) {
              if (positions['latitude' + pos] && positions['longitude' + pos] && positions['latitude' + pos] !== 0 && positions['longitude' + pos] !== 0) {
                this.vertexMarkers.push({
                  id: i * 10 + pos,
                  lat: positions['latitude' + pos],
                  lng: positions['longitude' + pos]
                })
              }
            }
          }

          if (this.vertexMarkers.length > 0) {
            let minLatitude = this.vertexMarkers[0].lat
            let maxLatitude = this.vertexMarkers[0].lat
            let minLongitude = this.vertexMarkers[0].lng
            let maxLongitude = this.vertexMarkers[0].lng

            for (let i = 1; i < this.vertexMarkers.length; i++) {
              if (this.vertexMarkers[i].lat < minLatitude) {
                minLatitude = this.vertexMarkers[i].lat
              }
              if (this.vertexMarkers[i].lat > maxLatitude) {
                maxLatitude = this.vertexMarkers[i].lat
              }
              if (this.vertexMarkers[i].lng < minLongitude) {
                minLongitude = this.vertexMarkers[i].lng
              }
              if (this.vertexMarkers[i].lng > maxLongitude) {
                maxLongitude = this.vertexMarkers[i].lng
              }
            }

            this.bounds = [
              [minLatitude, minLongitude],
              [maxLatitude, maxLongitude]
            ]
          } else {
            this.isDrawing = true
          }
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
    trackPos () {
      const pos = this.targetPos.split(',')
      if (pos.length > 1) {
        const lat = parseFloat(pos[0])
        const lng = parseFloat(pos[1])
        this.$refs.map.mapObject.setView({ lat, lng }, 13)
      }
    },
    updateCorridor: async function () {
      const record = {}
      for (let i = 0; i < 10; i++) {
        record['latitude' + (i + 1)] = 0
        record['longitude' + (i + 1)] = 0
      }

      const corridorList = []
      if (this.vertexMarkers.length > 0) {
        let sortID = 0, markerIndex = 0
        corridorList.push(Object.assign({}, record, { sortID }))
        while (markerIndex < this.vertexMarkers.length) {
          const colId = markerIndex % 10 + 1
          corridorList[sortID]['latitude' + colId] = parseFloat(this.vertexMarkers[markerIndex].lat.toFixed(5))
          corridorList[sortID]['longitude' + colId] = parseFloat(this.vertexMarkers[markerIndex].lng.toFixed(5))
          markerIndex += 1

          if (markerIndex % 10 === 0) {
            sortID += 1
            corridorList.push(Object.assign({}, record, { sortID }))
          }
        }
      }

      const params = {
        conditions: {
          accountID: this.accountID,
          corridorID: this.corridorForm.corridorID
        },
        data: this.corridorForm,
        list: corridorList
      }

      try {
        let res = await api.updateCorridor(params)
        this.hasChange = false
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.corridorForm.corridorID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
        this.$router.push('/corridors')
      } catch (e) {
      }
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
    onResize () {
      this.$refs.map.mapObject.invalidateSize()
    },
    onMouseDown: function (e) {
      if (!this.isDrawing) return
      if (e.originalEvent.which !== 1) return
      this.mouseDown = e
    },
    onMouseUp: function (e) {
      // this.$refs.map.mapObject.dragging.enable()
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

      this.vertexMarkers.push({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        id: this.vertexMarkers.length + 1
      })

      if (this.vertexMarkers.length > 1) {
        this.addMiddleMarker(this.vertexMarkers.length - 1)
      }

      this.hasChange = true
      this.forwardGuideLine.splice(0, 1, { lat: e.latlng.lat, lng: e.latlng.lng })
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
      //
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
      this.corridorWidth = Math.round(this.getRadiusPixel(this.corridorForm.radius)) * 2
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
