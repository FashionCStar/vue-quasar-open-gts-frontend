<template>
  <q-layout view="hHr lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="bg-white">
        <q-btn dense flat round icon="menu" @click="navDrawer = !navDrawer" color="secondary" />

        <q-toolbar-title class="q-py-sm">
          <img src="https://cdn.quasar.dev/img/quasar-logo.png" height="50px" />
        </q-toolbar-title>

        <div class="q-py-sm">
          <q-btn-dropdown
            class="q-px-xs"
            text-color="black"
            style="box-shadow: none;"
          >
            <template v-slot:label>
              <div class="row items-center no-wrap">
                <q-avatar size="50px;">
                  <img src="https://cdn.quasar.dev/img/avatar.png">
                </q-avatar>
                <div class="text-center q-px-sm">
                  {{accountID ? accountID : userID}}
                </div>
              </div>
            </template>
            <q-list>
              <q-item v-if="showProfile" clickable v-close-popup @click="gotoPage((userID?'/users/':'/accounts/')+(userID ? userAccountID+'/'+userID : accountID)+'/detail')">
                <q-item-section avatar>
                  <q-avatar icon="fas fa-id-badge" text-color="text-grey" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>My Profile</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="Logout">
                <q-item-section avatar>
                  <q-avatar icon="fas fa-sign-out-alt" text-color="text-grey" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Logout</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <div class="q-pl-md">
          <q-select v-if="windowWidth >= 600" v-model="lang" map-options :options="langs" class="row"/>
          <q-select v-if="windowWidth < 600" v-model="lang" map-options :options="flags" class="row">
            <template v-slot:selected>
              <q-avatar square size='40px'>
                <img :src="lang.url">
              </q-avatar>
            </template>
          </q-select>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="navDrawer"
      overlay
      @mouseover="miniNavDrawerState = false"
      @mouseout="miniNavDrawerState = false"
      :width="200"
      :breakpoint="500"
      show-if-above
      bordered
      content-class="bg-white"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item clickable
                  @click="gotoPage('/index')" >
            <q-item-section avatar>
              <q-icon name="fas fa-home" color="grey-9"/>
            </q-item-section>

            <q-item-section>
              <q-item-label> {{$t('dashboard')}} </q-item-label>
            </q-item-section>
          </q-item>

          <q-expansion-item
                  v-for="menuItem in menu"
                  :key="menuItem.title"
                  expand-icon="keyboard_arrow_down"
                  v-show="menuAccessable(menuItem.meta.roles)"
                  :content-inset-level="0.5"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" color="grey-9"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{$t(menuItem.title)}}</q-item-label>
              </q-item-section>
            </template>

            <q-item
                    v-for="route in menuItem.routes"
                    :key="'sub_menu_' + route.title"
                    v-show="menuAccessable(route.meta.roles)"
                    clickable
                    v-ripple
                    @click="gotoPage(route.to)"
            >
              <q-item-section avatar>
                <q-icon :name="route.icon" color="grey-9"/>
              </q-item-section>

              <q-item-section>
                <q-item-label> {{$t(route.title)}} </q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item clickable
                  @click="Logout" >
            <q-item-section avatar>
              <q-icon name="fas fa-sign-out-alt" color="grey-9" />
            </q-item-section>

            <q-item-section>
              <q-item-label> Logout </q-item-label>
            </q-item-section>
          </q-item>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container :style="{ paddingLeft : isLeftNavOpen(navDrawer) }">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { permissionChecker } from 'src/boot/checkPermission'
import { LocalStorage } from 'quasar'

export default {
  data () {
    return {

      langs: [
        {
          label: 'US English',
          value: 'en-us'
        },
        {
          label: 'German',
          value: 'de'
        }
      ],
      flags: [
        {
          label: 'US English',
          value: 'en-us',
          url: '../assets/icons/lang/en-us.png'
        },
        {
          label: 'German',
          value: 'de',
          url: '../assets/icons/lang/de.png'
        }
      ],
      lang: {
        label: 'US English',
        value: 'en-us',
        url: '../assets/icons/lang/en-us.png'
      },
      navDrawer: true,
      miniNavDrawerState: true,
      menu: [
        // {
        //   icon: 'home',
        //   title: 'dashboard',
        //   to: '/index',
        //   meta: { roles: ['admin', 'account'] }
        // },
        {
          icon: 'fas fa-map',
          title: 'mapping',
          to: '/index',
          meta: { roles: ['admin', 'account'] },
          routes: [
            {
              icon: 'fas fa-map-marked-alt',
              title: 'lastLocation',
              to: '/lastlocation',
              meta: { roles: [ 'admin' ] }
            },
            {
              icon: 'fas fa-route',
              title: 'vehicle',
              to: '/devicelocation',
              meta: { roles: [ 'admin', 'account' ] }
            },
            {
              icon: 'fas fa-map-marked-alt',
              title: 'group',
              to: '/grouplocation',
              meta: { roles: [ 'admin', 'account' ] }
            }
          ]
        },
        {
          icon: 'fas fa-list-alt',
          title: 'Reports',
          to: '/index',
          meta: { roles: ['admin', 'account'] },
          routes: [
            // {
            //   icon: 'far fa-chart-bar',
            //   title: 'vehicleDetail',
            //   to: '/accounts',
            //   meta: { roles: [ 'admin' ] }
            // },
            // {
            //   icon: 'fas fa-chart-bar',
            //   title: 'groupDetail',
            //   to: '/users',
            //   meta: { roles: [ 'admin', 'account' ] }
            // },
            // {
            //   icon: 'fas fa-chart-pie',
            //   title: 'groupSummary',
            //   to: '/vehicles',
            //   meta: {}
            // },
            // {
            //   icon: 'fas fa-poll',
            //   title: 'performance',
            //   to: '/groups',
            //   meta: {}
            // }
          ]
        },
        {
          icon: 'fas fa-users-cog',
          title: 'administration',
          to: '/index',
          meta: { roles: ['admin', 'account', 'user'] },
          routes: [
            {
              icon: 'fas fa-user-shield',
              title: 'account',
              to: '/accounts',
              meta: { roles: [ 'admin' ] }
            },
            {
              icon: 'fas fa-user-cog',
              title: 'user',
              to: '/users',
              meta: { roles: [ 'admin', 'account' ] }
            },
            {
              icon: 'fas fa-user-tag',
              title: 'role',
              to: '/roles',
              meta: { roles: [ 'admin' ] }
            },
            {
              icon: 'fas fa-car',
              title: 'vehicle',
              to: '/vehicles',
              meta: {}
            },
            {
              icon: 'fas fa-users',
              title: 'group',
              to: '/groups',
              meta: {}
            },
            {
              icon: 'fas fa-user-tie',
              title: 'driver',
              to: '/drivers',
              meta: {}
            },
            {
              icon: 'fas fa-draw-polygon',
              title: 'geozone',
              to: '/zones',
              meta: {}
            },
            {
              icon: 'fa fa-road',
              title: 'geocorridor',
              to: '/corridors',
              meta: {}
            },
            {
              icon: 'fas fa-code-branch',
              title: 'rule',
              to: '/rules',
              meta: {}
            },
            {
              icon: 'fas fa-info-circle',
              title: 'statusCode',
              to: '/statuscodes',
              meta: {}
            }
          ]
        }
      ],
      accountID: '',
      userID: '',
      userAccountID: '',
      showProfile: true,
      windowWidth: 0,
      expanded: false
    }
  },
  watch: {
    lang (lang) {
      this.$i18n.locale = lang.value
      import(`quasar/lang/${lang.value}`).then(language => {
        this.$q.lang.set(language.default)
      }).catch(error => {
        throw error
      })
    }
  },
  created () {
    this.windowWidth = window.innerWidth
    window.addEventListener('resize', () => {
      this.windowWidth = window.innerWidth
    })
    // get initial userList from server (1st page)
    this.accountID = this.$q.localStorage.getItem('accountInfo') ? this.$q.localStorage.getItem('accountInfo').accountID : null
    this.userID = this.$q.localStorage.getItem('userInfo') ? this.$q.localStorage.getItem('userInfo').userID : null
    this.userAccountID = this.$q.localStorage.getItem('userInfo') ? this.$q.localStorage.getItem('userInfo').accountID : null

    if (this.$q.localStorage.getItem('userLevel') === 'user') {
      if (permissionChecker.checkProfileAuthorized(this.$q.localStorage.getItem('permissions')) === 0) {
        this.showProfile = false
      }
    }
  },
  methods: {
    menuAccessable (roles) {
      let userLevel = LocalStorage.getItem('userLevel')
      if (roles) {
        if (Array.isArray(roles)) {
          return roles.includes(userLevel)
        } else {
          return roles === userLevel
        }
      } else {
        return true
      }
    },
    isLeftNavOpen (state) {
      return state ? '200px' : '0px'
    },
    gotoPage (url) {
      if (this.$router.currentRoute.path !== url) {
        this.$router.push(url)
      }
    },
    Logout () {
      this.$q.localStorage.remove('accountInfo')
      this.$q.localStorage.remove('userInfo')
      this.$q.localStorage.remove('userLevel')
      this.$q.localStorage.remove('token')
      this.$router.push('/login')
    }
  }
}
</script>
