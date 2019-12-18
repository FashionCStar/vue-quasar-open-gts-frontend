<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">{{ name }} layouts</div>
    </q-card-section>

    <q-card-section>
      <q-list>
        <q-item
          v-for="(name, index) in routeNames"
          :key="`route_${index}`"
          clickable
          :to="{name: name}"
        >
          <q-item-section>
            <q-item-label>
              {{ name }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script>

export default {
  data () {
    return {}
  },
  props: {
    name: {
      type: String,
      required: true
    },
    routes: {
      type: Array,
      required: true
    }
  },
  computed: {
    routeNames () {
      return this.routes && this.routes
        .map(x => x.children)
        .map(children => children && children.map(child => child.name))
        .flat()
        .filter(x => x)
    }
  }
}
</script>
