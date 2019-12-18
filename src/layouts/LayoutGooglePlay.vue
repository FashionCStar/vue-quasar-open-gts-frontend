<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-grey-3 text-grey-9">
      <q-toolbar style="max-height: 60px;" class="text-grey-6">
        <q-btn
          v-if="this.$q.platform.is.mobile || !leftDrawerOpen"
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <div class="q-px-lg">
          <img src="https://www.gstatic.com/android/market_images/web/play_prism_hlock_2x.png" style="width:183px;height:39px">
        </div>

        <div class="row no-wrap" style="min-width: 100px; width: 35%">
          <q-input dense outlined square v-model="search" input-class="{text-left:true}" placeholder="Search" class="bg-white text-grey-7 col" />
          <div class="bg-primary text-white row justify-center items-center" style="max-width: 60px; width: 100%;">
            <q-icon name="search" size="26px" />
          </div>
        </div>

        <q-space />

        <div class="q-pa-md q-gutter-sm row no-wrap items-center">
          <q-btn round dense flat :ripple="false" color="grey-8" size="14px" icon="apps">
            <q-tooltip>Google Apps</q-tooltip>
          </q-btn>

          <q-avatar size="26px" color="grey-8" text-color="white" icon="notifications">
            <q-tooltip>0 Google Notifications</q-tooltip>
          </q-avatar>

          <q-btn round flat>
            <q-avatar size="34px" >
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <q-tooltip>Google Account</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-grey-11 text-grey-7"
      :width="200"
    >
      <q-list bordered>

        <q-item clickable tag="a" target="_blank" href="javascript:void(0)" class="bg-grey-10 text-grey-3">
          <q-item-section avatar class="text-grey-1">
            <q-icon name="weekend" />
          </q-item-section>
          <q-item-section class="text-grey-3">
            <q-item-label>Entertainment</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable class="apps" tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar class="apps-icon bg-green-7 text-grey-1 text-center adjust-icon">
            <q-icon name="android" />
          </q-item-section>
          <q-item-section class="apps-text adjust-text">
            <q-item-label>Apps</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable class="movies" tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar class="movies-icon bg-red-7 text-grey-1 text-center adjust-icon">
            <q-icon name="local_movies" />
          </q-item-section>
          <q-item-section class="movies-text adjust-text">
            <q-item-label>Movies & TV</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable class="music" tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar class="music-icon bg-orange-7 text-grey-1 text-center adjust-icon">
            <q-avatar size="22px" color="white" text-color="orange-7" icon="music_note" />
          </q-item-section>
          <q-item-section class="music-text adjust-text">
            <q-item-label>Music</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable class="books" tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar class="books-icon bg-blue-7 text-grey-1 text-center adjust-icon">
            <q-icon name="book" />
          </q-item-section>
          <q-item-section class="books-text adjust-text">
            <q-item-label>Books</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable class="devices" tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar class="devices-icon bg-blue-grey-7 text-grey-1 text-center adjust-icon">
            <q-icon name="devices" />
          </q-item-section>
          <q-item-section class="devices-text adjust-text">
            <q-item-label>Devices</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item v-for="link in links1" :key="link.text" dense clickable tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section class="text-grey-8">
            <q-item-label>{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <div style="margin-left: 24px;">
          <div class="caption text-grey-7" style="position: absolute; bottom: 0">
            <q-btn flat dense no-caps aria-label="Privacy" size="sm">Privacy</q-btn>
            <span> - </span>
            <q-btn flat dense no-caps aria-label="Terms" size="sm">Terms</q-btn>
          </div>
        </div>

      </q-list>
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
      storage: 0.26,
      links1: [
        { text: 'Account' },
        { text: 'Payment methods' },
        { text: 'My subscriptions' },
        { text: 'Redeem' },
        { text: 'Buy gift card' },
        { text: 'My wishlist' },
        { text: 'My Play activity' },
        { text: 'Parent guide' }
      ]
    }
  },
  mounted () {
    if (!this.$q.platform.is.mobile) {
      this.leftDrawerOpen = true
    }
  },
  methods: {
    openURL
  },

  computed: {
  }
}
</script>

<style>
.adjust-icon {
  margin: -8px 0 -8px -16px;
  padding: 8px 0 8px 16px;
}
.adjust-text {
  margin: -8px -16px -8px 0;
  padding: 8px 16px 8px 2px;
}

.adjust-text > .q-item__label {
  padding-left: 14px;
}

.apps, .movies, .music, .books, .devices {
  background: #eee!important;
}
.apps:hover, .movies:hover, .music:hover, .books:hover, .devices:hover {
  color: #eee !important;
}
.apps:hover {
  background: #43a047!important;
}
.movies:hover {
  background: #e53935!important;
}
.music:hover {
  background: #fb8c00!important;
}
.books:hover {
  background: #1e88e5!important;
}
.devices:hover {
  background: #546e7a!important;
}
</style>
