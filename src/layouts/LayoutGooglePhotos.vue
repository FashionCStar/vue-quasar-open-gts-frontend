<template>
  <q-layout view="lHh Lpr fff">
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

        <div class="text-h5 no-wrap row">
          <span class="text-blue-8">G</span><span class="text-red-8">o</span><span class="text-orange-6">o</span><span class="text-blue-8">g</span><span class="text-green-8">l</span><span class="text-red-8">e</span>&nbsp;Photos
        </div>

        <q-space />

        <q-input dense outlined v-model="search" input-class="text-left" label="Search" style="width: 35%;">
          <template v-slot:prepend>
            <q-icon v-if="search === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
          </template>
        </q-input>

        <q-btn flat dense color="primary" icon="add" no-caps label="Create" class="q-ml-sm">
          <q-menu
            anchor="top right"
            self="top right"
          >
            <q-list class="text-grey-8" style="min-width: 100px">
              <q-item aria-hidden="true">
                <q-item-section class="text-uppercase text-grey-7" style="font-size: 0.7rem">Create New</q-item-section>
              </q-item>
              <q-item v-for="menu in createMenu" :key="menu.text" clickable v-close-menu aria-hidden="true">
                <q-item-section avatar>
                  <q-icon :name="menu.icon" />
                </q-item-section>
                <q-item-section>{{ menu.text }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat dense color="primary" icon="cloud_upload" no-caps label="Upload" class="q-ml-sm" />

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
      bordered
      overlay
      content-class="bg-grey-2"
      @click="leftDrawerOpen = false"
    >
      <div class="drawer-title q-pl-lg q-pt-md q-pb-lg text-grey-7">
        <span class="text-blue-8">G</span><span class="text-red-8">o</span><span class="text-orange-6">o</span><span class="text-blue-8">g</span><span class="text-green-8">l</span><span class="text-red-8">e</span> Photos
      </div>

      <q-list bordered>
        <q-item v-for="link in links1" :key="link.text" clickable tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item v-for="link in links2" :key="link.text" clickable tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item v-for="link in links3" :key="link.text" clickable tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable tag="a" target="_blank" href="javascript:void(0)">
          <q-item-section avatar>
            <q-icon name="cloud" />
          </q-item-section>
          <q-item-section top>
            <q-item-label class="q-mt-md">Storage</q-item-label>
            <q-linear-progress :value="storage" class="q-my-sm" />
            <q-slider
              v-model="storage"
              readonly
            />
            <q-item-label caption  class="q-mb-md">2.6 GB of 15 GB</q-item-label>
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
      leftDrawerOpen: this.$q.platform.is.desktop,
      search: '',
      storage: 0.26,
      links1: [
        { icon: 'photo', text: 'Photos' },
        { icon: 'photo_album', text: 'Albums' },
        { icon: 'assistant', text: 'Assistant' },
        { icon: 'people', text: 'Sharing' },
        { icon: 'book', text: 'Photo books' }
      ],
      links2: [
        { icon: 'archive', text: 'Archive' },
        { icon: 'delete', text: 'Trash' }
      ],
      links3: [
        { icon: 'settings', text: 'Settings' },
        { icon: 'help', text: 'Help & Feedback' },
        { icon: 'get_app', text: 'App Downloads' }
      ],
      createMenu: [
        { icon: 'photo_album', text: 'Album' },
        { icon: 'people', text: 'Shared Album' },
        { icon: 'movie', text: 'Movie' },
        { icon: 'library_books', text: 'Animation' },
        { icon: 'dashboard', text: 'Collage' },
        { icon: 'book', text: 'Photo book' }
      ]
    }
  },
  methods: {
    openURL
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
</style>
