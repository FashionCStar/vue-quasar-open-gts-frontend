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

        <q-btn flat :ripple="false" icon="fab fa-youtube" size="22px" color="red" no-caps>
          <div class="text-black" style="font-variant: small-caps slashed-zero olstyle-nums;">YouTube</div>
        </q-btn>

        <q-space />

        <q-input outlined v-model="search" input-class="text-left" label="Search" style="width: 35%;">
          <template v-slot:append>
            <q-icon v-if="search === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
          </template>
        </q-input>

        <q-space />

        <div class="q-pa-md q-gutter-sm row items-center no-wrap">
          <q-btn round dense flat color="text-grey-7" size="22px" icon="video_call">
            <q-tooltip>Create a video or post</q-tooltip>
          </q-btn>
          <q-btn round dense flat color="text-grey-7" size="22px" icon="apps">
            <q-tooltip>Apps</q-tooltip>
          </q-btn>
          <q-btn round dense flat color="text-grey-7" size="22px" icon="message">
            <q-tooltip>Messages</q-tooltip>
          </q-btn>
          <q-btn round dense flat color="text-grey-7" size="22px" icon="notifications">
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
          <q-btn round flat>
            <q-avatar class="gt-xs">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-grey-2 text-grey-7"
    >
      <q-scroll-area style="width: 100%; height: 100%">
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

          <q-item-label header>MORE FROM YOUTUBE</q-item-label>
          <q-item v-for="link in links3" :key="link.text" clickable tag="a" target="_blank" href="javascript:void(0)">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item v-for="link in links4" :key="link.text" clickable tag="a" target="_blank" href="javascript:void(0)">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <div>
            <q-btn v-for="button in buttons1" :key="button.text" flat no-caps :ripple="false" :label="button.text" size="0.8rem" />
          </div>
          <div>
            <q-btn v-for="button in buttons2" :key="button.text" flat no-caps :ripple="false" :label="button.text" size="0.8rem" />
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
      leftDrawerOpen: this.$q.platform.is.desktop,
      search: '',
      links1: [
        { icon: 'home', text: 'Home' },
        { icon: 'whatshot', text: 'Trending' },
        { icon: 'subscriptions', text: 'Subscriptions' }
      ],
      links2: [
        { icon: 'folder', text: 'Library' },
        { icon: 'restore', text: 'History' },
        { icon: 'watch_later', text: 'Watch later' },
        { icon: 'thumb_up_alt', text: 'Liked videos' }
      ],
      links3: [
        { icon: 'fab fa-youtube', text: 'YouTube Premium' },
        { icon: 'local_movies', text: 'Movies & Shows' },
        { icon: 'videogame_asset', text: 'Gaming' },
        { icon: 'live_tv', text: 'Live' }
      ],
      links4: [
        { icon: 'settings', text: 'Settings' },
        { icon: 'flag', text: 'Report history' },
        { icon: 'help', text: 'Help' },
        { icon: 'feedback', text: 'Send feedback' }
      ],
      buttons1: [
        { text: 'About' },
        { text: 'Press' },
        { text: 'Copyright' },
        { text: 'Contact us' },
        { text: 'Creators' },
        { text: 'Advertise' },
        { text: 'Developers' }
      ],
      buttons2: [
        { text: 'Terms' },
        { text: 'Privacy' },
        { text: 'Policy & Safety' },
        { text: 'Test new features' }
      ]
    }
  },
  methods: {
    openURL
  }
}
</script>

<style>
</style>
