<template>
  <q-page class="flex flex-center">
    <q-card>
      <q-card-section>
        <div class="text-subtitle1 text-center">Quasar layout examples</div>
        <div class="text-subtitle2 text-grey text-center">Click to change layout</div>
      </q-card-section>

      <q-card-section class="text-center">
        <div>
          <div class="row justify-around q-gutter-lg">
            <div
              v-for="(routeGroup, index) in routeGroups"
              :key="`route_${index}`"
              class="col-auto"
            >
              <route-list
                :name="routeGroup.name"
                :routes="routeGroup.routes"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle1 text-center">To Participate, go to:</div>
          <div class="bg-black q-pa-xs">
            <center>
              <q-btn round dense flat icon="fab fa-github" size="19px" color="white" class="icon" no-caps type="a" href="https://github.com/hawkeye64/quasar-layouts" />
            </center>
          </div>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<style>
</style>

<script>
import RouteList from '../components/RouteList'

export default {
  name: 'PageIndex',
  components: {
    RouteList
  },
  computed: {
    routeGroups () {
      const children = this.$router.options.routes[0].children
      return children && children
        .filter(route => route.name && route.children)
        .map(route => {
          return {
            name: route.name,
            routes: route.children
          }
        })
    }
  }
}
</script>
