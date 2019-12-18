<template>
    <div id="sidebar" class="sidebar sidebar-left leaflet-touch" :class="{collapsed: !showDevicePane && !showLocationPane}">
        <!-- Nav tabs -->
        <div class="sidebar-tabs text-center">
            <ul role="tablist">
                <q-btn :flat="!showDevicePane"
                       round icon="commute"
                       style="padding: 2px 0"
                       color="purple"
                       @click="toggleDevicePane"/>
                <q-btn :flat="!showLocationPane"
                       round icon="room"
                       style="padding: 2px 0"
                       color="primary"
                       @click="toggleLocationPane"/>
            </ul>
        </div>

        <!-- Tab panes -->
        <div class="sidebar-content">
            <div class="sidebar-pane" :class="{active: showDevicePane}" id="filter">
                <q-toolbar class="bg-primary text-white sidebar-header glossy">
                    <q-toolbar-title>
                        <slot name="firstPaneTitle"></slot>
                    </q-toolbar-title>
                    <q-btn flat round dense icon="arrow_left" @click="showDevicePane = false" />
                </q-toolbar>
                <slot name="devicePane"></slot>
            </div>

            <div class="sidebar-pane" :class="{active: showLocationPane}" id="data">
                <q-toolbar class="bg-primary text-white sidebar-header glossy">
                    <q-toolbar-title>
                        <slot name="secondPaneTitle"></slot>
                    </q-toolbar-title>
                    <q-btn flat round dense icon="arrow_left" @click="showLocationPane = false" />
                </q-toolbar>
                <slot name="locationPane"></slot>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'SideBar',
  data: function () {
    return {
      showDevicePane: false,
      showLocationPane: false
    }
  },
  mounted () {
  },
  methods: {
    toggleDevicePane () {
      this.showDevicePane = !this.showDevicePane
      this.showLocationPane = false
    },
    toggleLocationPane () {
      this.showLocationPane = !this.showLocationPane
      this.showDevicePane = false
    }
  }
}

</script>
