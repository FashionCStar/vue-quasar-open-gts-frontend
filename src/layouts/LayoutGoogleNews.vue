<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-white text-grey-6">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <div class="text-h5 no-wrap row q-pl-lg">
          <span class="text-blue-8">G</span><span class="text-red-8">o</span><span class="text-orange-6">o</span><span class="text-blue-8">g</span><span class="text-green-8">l</span><span class="text-red-8">e</span>&nbsp;News
        </div>

        <q-space />

        <q-input filled v-model="search" color="bg-grey-7" input-class="text-left" label="Search for topics, locations & sources" style="width: 40%;">
          <template v-slot:prepend>
            <q-icon v-if="search === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              round
              aria-label="Menu"
              @clck="showAdvanced = !showAdvanced"
            >
              <q-icon v-if="showAdvanced" name="arrow_drop_up" />
              <q-icon v-else name="arrow_drop_down" />
              <q-tooltip>Advanced search</q-tooltip>
            </q-btn>
          </template>
          <q-menu v-model="showAdvanced" fit max-width="300px" anchor="bottom right" self="top right">
            <div class="q-px-md q-pb-md">
              <div class="text-subtitle2 text-grey">Narrow your search results</div>
              <div class="row items-end">
                <div class="col-3 text-subtitle2 text-grey">
                  Exact phrase
                </div>
                <div class="col-9">
                  <q-input v-model="exactPhrase" />
                </div>

                <div class="col-3 text-subtitle2 text-grey">
                  Has words
                </div>
                <div class="col-9">
                  <q-input v-model="hasWords" />
                </div>

                <div class="col-3 text-subtitle2 text-grey">
                  Exclude words
                </div>
                <div class="col-9">
                  <q-input v-model="excludeWords" />
                </div>

                <div class="col-3 text-subtitle2 text-grey">
                  Website
                </div>
                <div class="col-9">
                  <q-input v-model="byWebsite" />
                </div>

                <div class="col-3 text-subtitle2 text-grey q-pt-lg">
                  Date
                </div>
                <div class="col-3">
                  <q-btn flat dense no-caps :label="byDate" size="md" :icon-right="showDateOptions ? 'arrow_drop_up' : 'arrow_drop_down'" style="width: 180px;">
                    <q-menu v-model="showDateOptions" fit anchor="bottom right" self="top right">
                      <q-list dense>
                        <q-item v-for="option in dateOptions" :key="option" clickable @click="changeDate(option)">
                          <q-item-section>
                            <q-item-label>{{ option }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
                <div class="col-6" />
                <div class="col-12 q-pt-lg">
                  <q-btn flat dense no-caps color="grey-7" size="md" class="float-right" style="min-width: 68px;">Search</q-btn>
                  <q-btn flat dense no-caps color="grey-7" size="md" class="float-right" style="min-width: 68px;" @click="onClear">Clear</q-btn>
                </div>

              </div>
            </div>
          </q-menu>
        </q-input>

        <q-space />

        <div class="q-pa-md q-gutter-sm row items-center no-wrap">
          <q-btn round dense flat color="text-grey-7" size="16px" icon="apps">
            <q-tooltip>Google Apps</q-tooltip>
          </q-btn>
          <q-btn round dense flat color="text-grey-7" size="16px" icon="notifications">
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
          <q-btn round flat>
            <q-avatar size="26px" >
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <q-tooltip>Google Account</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      overlay
      bordered
      content-class="bg-white"
      :width="280"
    >
      <q-scroll-area style="width: 100%; height: 100%">
        <q-list class="text-grey-8">
          <q-item v-for="link in links1" :key="link.text" clickable class="news" tag="a" target="_blank" href="javascript:void(0)">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="local-separator" />

          <q-item v-for="link in links2" :key="link.text" clickable class="news" tag="a" target="_blank" href="javascript:void(0)">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="local-separator" />

          <q-item v-for="link in links3" :key="link.text" clickable class="news" tag="a" target="_blank" href="javascript:void(0)">
            <q-item-section>
              <q-item-label>{{ link.text }} <q-icon v-if="link.icon" :name="link.icon" /></q-item-label>
            </q-item-section>
          </q-item>

        <div style="margin-left: 24px; margin-top: 15px;">
          <div class="caption text-grey-7" style="position: absolute; bottom: 0">
            <q-btn flat dense no-caps aria-label="Privacy" size="sm">Privacy</q-btn>
            <span> - </span>
            <q-btn flat dense no-caps aria-label="Terms" size="sm">Terms</q-btn>
            <span> - </span>
            <q-btn flat dense no-caps aria-label="About" size="sm">About Google</q-btn>
          </div>
        </div>

        </q-list>
      </q-scroll-area>

    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: false,
      search: '',
      showAdvanced: false,
      showDateOptions: false,
      exactPhrase: '',
      hasWords: '',
      excludeWords: '',
      byWebsite: '',
      byDate: 'Any time',
      dateOptions: [
        'Any time', 'Past hour', 'Past 24 hours', 'Past week', 'Past year'
      ],
      links1: [
        { icon: 'web', text: 'Top stories' },
        { icon: 'person', text: 'For you' },
        { icon: 'star_border', text: 'Favourites' },
        { icon: 'search', text: 'Saved searches' }
      ],
      links2: [
        { icon: 'flag', text: 'Canada' },
        { icon: 'fas fa-globe-americas', text: 'World' },
        { icon: 'place', text: 'Local' },
        { icon: 'domain', text: 'Business' },
        { icon: 'memory', text: 'Technology' },
        { icon: 'local_movies', text: 'Entertainment' },
        { icon: 'directions_bike', text: 'Sports' },
        { icon: 'fas fa-flask', text: 'Science' },
        { icon: 'fitness_center', text: 'Health ' }
      ],
      links3: [
        { icon: '', text: 'Language & region' },
        { icon: '', text: 'Settings' },
        { icon: 'open_in_new', text: 'Get the Android app' },
        { icon: 'open_in_new', text: 'Get the iOS app' },
        { icon: '', text: 'Send feedback' },
        { icon: 'open_in_new', text: 'Help' }
      ]
    }
  },
  methods: {
    openURL,
    onClear () {
      this.exactPhrase = ''
      this.hasWords = ''
      this.excludeWords = ''
      this.byWebsite = ''
      this.byDate = 'Any time'
    },
    changeDate (option) {
      this.byDate = option
      this.showDateOptions = false
    }
  },
  mounted () {
    this.leftDrawerOpen = this.$q.platform.is.desktop
  },
  watch: {
    showDateOptions (val) {
      console.log('showDateOptions', this.showDateOptions)
    }
  }
}
</script>

<style>
.drawer-title {
    -webkit-box-flex: 1;
    -ms-flex: 1 1 0%;
    flex: 1 1 0%;
    min-width: 1px;
    max-width: 100%;
    font-size: 21px;
    font-weight: normal;
    letter-spacing: 0.01em;
}
.local-separator {
  width: 80%;
  margin-left: calc(calc(100% - 80%) / 2)
}
.news {
  min-height: 42px!important;
  max-height: 42px;
}
.news:hover {
  /* border-radius: 0 50% 50% 0 */
  color: #42a5f5!important;
  background-color: transparent!important;
}
</style>
