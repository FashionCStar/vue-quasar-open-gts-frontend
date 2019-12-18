<template>
  <l-map :zoom="zoom" :center="center" @click="({latlng}) => drawCircle(latlng)">
    <l-tile-layer :url="url"></l-tile-layer>
    <l-polygon
      :lat-lngs="polygon.latlngs"
      :color="polygon.color"
    ></l-polygon>
    <l-marker
      v-for="(markerLatLng, index) in polygon.latlngs"
      :key="`marker_${index}`"
      :lat-lng="markerLatLng"
      @update:latLng="updateMap($event, index)"
      draggable
    ></l-marker>
    <l-circle
      :lat-lng="circle.center"
      :radius="1000"
      :fillColor="circle.fillColor"
      :fillOpacity="circle.fillOpacity"
      :opacity="circle.opacity"
      draggable
    ></l-circle>
    <!-- @update:latLng="move" -->
  </l-map>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolygon, LCircle } from 'vue2-leaflet'
export default {
  name: 'GeocodeMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPolygon,
    LCircle
  },
  data () {
    return {
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      zoom: 12,
      center: {
        lat: 47.230759648346925,
        lng: -1.5545654296875002
      },
      circle: {
        center: {
          lat: 47.230759648346925,
          lng: -1.5545654296875002
        },
        opacity: 0,
        radius: 300,
        fillColor: '#0000ff',
        fillOpacity: 0
      },
      // center: [47.413220, -1.319482],
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
        color: 'green'
      }
    }
  },
  props: {
    name: {
      type: String,
      required: false
    },
    routes: {
      type: Array,
      required: false
    }
  },
  methods: {
    // add (...args) {
    //   console.log('click:', args)
    // },
    updateMap (event, index) {
      console.log('4444444444444', event, index)
      this.polygon.latlngs.splice(index, 1, event)
    },
    drawCircle (latlng) {
      console.log('latlnggggggg', latlng)
      this.circle.center = latlng
      this.circle.opacity = 1
      this.circle.fillOpacity = 0.5
    }
  }
}
</script>
