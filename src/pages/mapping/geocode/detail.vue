<template>
  <q-page padding class="flex">
    <q-card style="flex:1">
      <geocode-map
        style="height: calc(100vh - 50px)"></geocode-map>
    </q-card>
  </q-page>
</template>

<script>
import GeocodeMap from '../../../components/GeocodeMap'

export default {
  name: 'Geocode',
  components: {
    GeocodeMap
  },
  data () {
    return {

    }
  }
}
</script>
<style>
</style>
