// if user login, can go to other pages, but if not login, it should go to login page

import { LocalStorage } from 'quasar'

function authGuard (to, from, next) {
  if (LocalStorage.has('token')) {
    // or however you store your logged in state
    next() // allow to enter route
  } else {
    next('/login') // go to '/login';
  }
}

const routes = [
  {
    path: '/',
    beforeEnter: authGuard,
    component: () => import('layouts/LayoutSoftwareAsAService.vue'),
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('pages/Index.vue')
      },
      {
        path: '',
        name: 'administration',
        component: () => import('layouts/EmptyLayout.vue'),
        children: [
          {
            path: 'accounts',
            name: 'Accounts',
            component: () => import('pages/administration/account/accounts.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'accounts/create',
            name: 'Create New Account',
            component: () => import('pages/administration/account/detail.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'accounts/:id/detail',
            name: 'Update Account',
            component: () => import('pages/administration/account/detail.vue'),
            meta: { roles: [ 'admin', 'account' ] }
          },
          {
            path: 'roles',
            name: 'Roles',
            component: () => import('pages/administration/role/roles.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'roles/create',
            name: 'Create New Role',
            component: () => import('pages/administration/role/detail.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'roles/:id/detail',
            name: 'Update Role',
            component: () => import('pages/administration/role/detail.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'permissions',
            name: 'Permissions',
            component: () => import('pages/administration/permission/permissions.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'users',
            name: 'Users',
            component: () => import('pages/administration/user/users.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'users/create',
            name: 'Create New User',
            component: () => import('pages/administration/user/detail.vue'),
            meta: { roles: [ 'admin', 'account' ] }
          },
          {
            path: 'users/:accountID/:id/detail',
            name: 'Update User',
            component: () => import('pages/administration/user/detail.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'vehicles',
            name: 'Vehicles',
            component: () => import('pages/administration/vehicle/vehicles.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'vehicles/create',
            name: 'Create New Vehicle',
            component: () => import('pages/administration/vehicle/detail.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'vehicles/:accountID/:id/detail',
            name: 'Update Vehicle',
            component: () => import('pages/administration/vehicle/detail.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'groups',
            name: 'Groups',
            component: () => import('pages/administration/vehiclegroup/groups.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'groups/create',
            name: 'Create New Group',
            component: () => import('pages/administration/vehiclegroup/detail.vue'),
            meta: { roles: [ 'admin', 'account' ] }
          },
          {
            path: 'groups/:accountID/:id/detail',
            name: 'Update Group',
            component: () => import('pages/administration/vehiclegroup/detail.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'drivers',
            name: 'Drivers',
            component: () => import('pages/administration/driver/drivers.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'drivers/create',
            name: 'Create New Driver',
            component: () => import('pages/administration/driver/detail.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'drivers/:accountID/:id/detail',
            name: 'Update Driver',
            component: () => import('pages/administration/driver/detail.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'rules',
            name: 'Rules',
            component: () => import('pages/administration/rule/rules.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'rules/create',
            name: 'Create New Rule',
            component: () => import('pages/administration/rule/detail.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'rules/:id/detail',
            name: 'Update Rule',
            component: () => import('pages/administration/rule/detail.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'statuscodes',
            name: 'Status Codes',
            component: () => import('pages/administration/statuscode/statuscodes.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'statuscodes/create',
            name: 'Create New StatusCode',
            component: () => import('pages/administration/statuscode/detail.vue'),
            meta: { roles: [ 'admin', 'account' ] }
          },
          {
            path: 'statuscodes/:accountID/:id/detail',
            name: 'Update StatusCode',
            component: () => import('pages/administration/statuscode/detail.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'zones',
            name: 'GeoZone',
            component: () => import('pages/administration/geozone/geozone.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'zones/:id/detail',
            name: 'Update Geozone',
            component: () => import('pages/administration/geozone/detail.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'corridors',
            name: 'GeoCorridor',
            component: () => import('pages/administration/geocorridor/geocorridor.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'corridors/:id/detail',
            name: 'Update GeoCorridor',
            component: () => import('pages/administration/geocorridor/detail.vue'),
            meta: { roles: [ 'admin' ] }
          },
          {
            path: 'lastlocation',
            name: 'Last Location',
            component: () => import('pages/mapping/lastlocation/lastlocation.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'devicelocation',
            name: 'Vehicle Location',
            component: () => import('pages/mapping/vehiclelocation/vehicles.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          },
          {
            path: 'grouplocation',
            name: 'Group Location',
            component: () => import('pages/mapping/grouplocation/groups.vue'),
            meta: { roles: [ 'admin', 'account', 'user' ] }
          }
        ]
      }
    ]
  },
  {
    path: '/404',
    name: 'Error',
    component: () => import('pages/Error404.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('pages/administration/login.vue')
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('layouts/LayoutSoftwareAsAService.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ]
  })
}

export default routes
