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
                  <q-avatar icon="far fa-user-circle" text-color="black" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>My Profile</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="Logout">
                <q-item-section avatar>
                  <q-avatar icon="logout" text-color="black" />
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
      :width="250"
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
              <q-icon name="home" color="primary"></q-icon>
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
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" color="primary"/>
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
                    :inset-level="1"
            >
              <q-item-section avatar>
                  <img :src="'statics/img/' + route.image + '.png'" width="40px" alt=""/>
              </q-item-section>

              <q-item-section>
                <q-item-label> {{$t(route.title)}} </q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item clickable
                  @click="Logout" >
            <q-item-section avatar>
              <q-icon name="power_settings_new" color="primary"></q-icon>
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
          icon: 'map',
          title: 'mapping',
          to: '/index',
          meta: { roles: ['admin', 'account'] },
          routes: [
            {
              image: 'iDeviceMap',
              title: 'lastLocation',
              to: '/lastlocation',
              meta: { roles: [ 'admin' ] }
            },
            {
              image: 'iDeviceMap',
              title: 'vehicle',
              to: '/devicelocation',
              meta: { roles: [ 'admin', 'account' ] }
            },
            {
              image: 'iFleetMap',
              title: 'group',
              to: '/grouplocation',
              meta: { roles: [ 'admin', 'account' ] }
            }
          ]
        },
        // {
        //   icon: 'receipt',
        //   title: 'Reports',
        //   to: '/index',
        //   meta: { roles: ['admin', 'account'] },
        //   routes: [
        //     {
        //       icon: 'people',
        //       title: 'accounts',
        //       to: '/accounts',
        //       meta: { roles: [ 'admin' ] }
        //     },
        //     {
        //       icon: 'people',
        //       title: 'users',
        //       to: '/users',
        //       meta: { roles: [ 'admin', 'account' ] }
        //     },
        //     {
        //       icon: 'settings',
        //       title: 'vehicles',
        //       to: '/vehicles',
        //       meta: {}
        //     },
        //     {
        //       icon: 'list',
        //       title: 'vehicleGroups',
        //       to: '/groups',
        //       meta: {}
        //     },
        //     {
        //       icon: 'people',
        //       title: 'drivers',
        //       to: '/drivers',
        //       meta: {}
        //     }
        //   ]
        // },
        {
          icon: 'people',
          title: 'administration',
          to: '/index',
          meta: { roles: ['admin', 'account', 'user'] },
          routes: [
            {
              image: 'iAccountAdmin',
              title: 'account',
              to: '/accounts',
              meta: { roles: [ 'admin' ] }
            },
            {
              image: 'iUserAdmin',
              title: 'user',
              to: '/users',
              meta: { roles: [ 'admin', 'account' ] }
            },
            {
              image: 'iRoleAdmin',
              title: 'role',
              to: '/roles',
              meta: { roles: [ 'admin' ] }
            },
            {
              image: 'iDeviceAdmin',
              title: 'vehicle',
              to: '/vehicles',
              meta: {}
            },
            {
              image: 'iFleetAdmin',
              title: 'group',
              to: '/groups',
              meta: {}
            },
            {
              image: 'iDriverAdmin',
              title: 'driver',
              to: '/drivers',
              meta: {}
            },
            {
              image: 'iZoneAdmin',
              title: 'geozone',
              to: '/zones',
              meta: {}
            },
            {
              image: 'iZoneAdmin',
              title: 'geocorridor',
              to: '/corridors',
              meta: {}
            },
            {
              image: 'iRuleAdmin',
              title: 'rule',
              to: '/rules',
              meta: {}
            },
            {
              image: 'iStatusCodeAdmin',
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
      return state ? '250px' : '0px'
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
