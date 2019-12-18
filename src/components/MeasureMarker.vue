<template>
    <div style="display: none;">
        <slot v-if="ready" />
    </div>
</template>

<script>
import { LayerMixin, OptionsMixin, optionsMerger, findRealParent, propsBinder } from 'vue2-leaflet/src'
import { LMeasurementMarker } from '../boot/LMeasurementMarker'

export default {
  name: 'MeasureMarker',
  mixins: [ LayerMixin, OptionsMixin ],
  props: {
    latLng: {
      type: [Object, Array],
      custom: true,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    measureUnit: {
      type: String,
      default: 'km'
    },
    measurement: {
      type: String,
      default: ''
    },
    rotation: {
      type: Number,
      default: 0.0
    }
  },
  data () {
    return {
      ready: false
    }
  },
  mounted () {
    const options = optionsMerger(this.polygonOptions, this)
    this.mapObject = new LMeasurementMarker(this.latLng, this.measurement, this.title, this.rotation, options)
    propsBinder(this, this.mapObject, this.$options.props)
    this.ready = true
    this.parentContainer = findRealParent(this.$parent)
    this.parentContainer.addLayer(this, !this.visible)
    this.$nextTick(() => {
      this.$emit('ready', this.mapObject)
    })
  }
}
</script>

<style scoped>

</style>
