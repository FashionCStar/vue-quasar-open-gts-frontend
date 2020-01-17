import axios from 'axios'
import { Notify, LocalStorage } from 'quasar'
import i18n from 'src/i18n'

const API_URL = 'http://localhost:3000/api'

class RestApi {
  instance = void 0
  __token = void 0
  constructor () {
    this.instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.token = LocalStorage.getItem('token')
  }
  config ({ router }) {
    let that = this
    this.instance.interceptors.request.use(function (config) {
      config.headers.authorization = 'bearer ' + that.token
      return config
    }, function (error) {
      return Promise.reject(error)
    })

    this.instance.interceptors.response.use(function (response) {
      return response
    }, function (error) {
      const data = error.response.data
      switch (error.response.status) {
        case 401:
          Notify.create({
            color: 'red-5',
            textColor: 'white',
            position: 'top',
            icon: 'fas fa-exclamation-triangle',
            message: i18n.t(data.failed)
          })

          LocalStorage.remove('token')
          LocalStorage.remove('userLevel')
          LocalStorage.remove('accountInfo')
          LocalStorage.remove('userInfo')
          router.push('/login')
          return Promise.reject(error)

        default:
          const message = i18n.t(data.failed, { item: i18n.t(data.item), field: i18n.t(data.field), id: data.id })
          Notify.create({
            color: 'red-5',
            textColor: 'white',
            position: 'top',
            icon: 'fas fa-exclamation-triangle',
            message: message
          })
          return Promise.reject(error)
      }
    })
  }

  async accountLogin (params) {
    let response = await this.instance.post('/account/authenticate', params)
    this.token = response.data.token
    return response
  }

  getAccounts (params) {
    return this.instance.post('/account/accounts', params)
  }
  getAllAccountIDs (params) {
    return this.instance.post('/account/allAccountIDs', params)
  }
  getAccountByID (params) {
    return this.instance.post('/account/detail', params)
  }
  activeAccount (params) {
    return this.instance.post('/account/active', params)
  }
  removeAccount (params) {
    return this.instance.post('/account/remove', params)
  }
  createAccount (params) {
    return this.instance.post('/account/create', params)
  }
  updateAccount (params) {
    return this.instance.post('/account/update', params)
  }

  getPermissions (params) {
    return this.instance.post('/permission/permissions', params)
  }
  removePermission (params) {
    return this.instance.post('/permission/remove', params)
  }
  createPermission (params) {
    return this.instance.post('/permission/create', params)
  }
  updatePermission (params) {
    return this.instance.post('/permission/update', params)
  }

  getAllPermissions () {
    return this.instance.post('/role/permissions')
  }
  getRoles (params) {
    return this.instance.post('/role/roles', params)
  }
  getRoleByID (params) {
    return this.instance.post('/role/detail', params)
  }
  removeRole (params) {
    return this.instance.post('/role/remove', params)
  }
  createRole (params) {
    return this.instance.post('/role/create', params)
  }
  cloneRole (params) {
    return this.instance.post('/role/clone', params)
  }
  updateRole (params) {
    return this.instance.post('/role/update', params)
  }

  getZones (params) {
    return this.instance.post('/zone/zones', params)
  }
  getZonesByAccount (params) {
    return this.instance.post('/zone/account', params)
  }
  getZoneByID (params) {
    return this.instance.post('/zone/detail', params)
  }
  removeZone (params) {
    return this.instance.post('/zone/remove', params)
  }
  createZone (params) {
    return this.instance.post('/zone/create', params)
  }
  updateZone (params) {
    return this.instance.post('/zone/update', params)
  }
  activateZone (params) {
    return this.instance.post('/zone/activate', params)
  }

  getCorridors (params) {
    return this.instance.post('/corridor/corridors', params)
  }
  getCorridorsByAccount (params) {
    return this.instance.post('/corridor/account', params)
  }
  getCorridorByID (params) {
    return this.instance.post('/corridor/detail', params)
  }
  removeCorridor (params) {
    return this.instance.post('/corridor/remove', params)
  }
  createCorridor (params) {
    return this.instance.post('/corridor/create', params)
  }
  updateCorridor (params) {
    return this.instance.post('/corridor/update', params)
  }

  getRules (params) {
    return this.instance.post('/rule/rules', params)
  }
  getRuleByID (params) {
    return this.instance.post('/rule/detail', params)
  }
  removeRule (params) {
    return this.instance.post('/rule/remove', params)
  }
  createRule (params) {
    return this.instance.post('/rule/create', params)
  }
  updateRule (params) {
    return this.instance.post('/rule/update', params)
  }
  activateRule (params) {
    return this.instance.post('/rule/activate', params)
  }

  async userLogin (params) {
    let response = await this.instance.post('/user/authenticate', params)
    this.token = response.data.token
    return response
  }
  createUser (params) {
    return this.instance.post('/user/create', params)
  }
  getUserByID (params) {
    return this.instance.post('/user/detail', params)
  }
  getUsers (params) {
    return this.instance.post('/user/users', params)
  }
  updateUser (params) {
    return this.instance.post('/user/update', params)
  }
  activeUser (params) {
    return this.instance.post('/user/active', params)
  }
  removeUser (params) {
    return this.instance.post('/user/remove', params)
  }
  getVehicleGroupsByAccount (params) {
    return this.instance.post('/user/devicegroups', params)
  }
  getVehiclesByAccount (params) {
    return this.instance.post('/user/devices', params)
  }
  getRolesForUser (params) {
    return this.instance.post('/user/roles', params)
  }

  getVehicles (params) {
    return this.instance.post('/vehicle/vehicles', params)
  }
  getVehicleByID (params) {
    return this.instance.post('/vehicle/detail', params)
  }
  createVehicle (params) {
    return this.instance.post('/vehicle/create', params)
  }
  cloneVehicle (params) {
    return this.instance.post('/vehicle/clone', params)
  }
  updateVehicle (params) {
    return this.instance.post('/vehicle/update', params)
  }
  activeVehicle (params) {
    return this.instance.post('/vehicle/active', params)
  }
  removeVehicle (params) {
    return this.instance.post('/vehicle/remove', params)
  }
  getGroups (params) {
    return this.instance.post('/vehicle/groups', params)
  }

  getAllVehicles (params) {
    return this.instance.post('/group/vehicles', params)
  }
  getDevicegroups (params) {
    return this.instance.post('/group/groups', params)
  }
  getDevicegroupById (params) {
    return this.instance.post('/group/detail', params)
  }
  createDevicegroup (params) {
    return this.instance.post('/group/create', params)
  }
  updateDevicegroup (params) {
    return this.instance.post('/group/update', params)
  }
  removeDevicegroup (params) {
    return this.instance.post('/group/remove', params)
  }

  getDrivers (params) {
    return this.instance.post('/driver/drivers', params)
  }
  getDriverByID (params) {
    return this.instance.post('/driver/detail', params)
  }
  createDriver (params) {
    return this.instance.post('/driver/create', params)
  }
  updateDriver (params) {
    return this.instance.post('/driver/update', params)
  }
  removeDriver (params) {
    return this.instance.post('/driver/remove', params)
  }
  getDriverDevices (params) {
    return this.instance.post('/driver/vehicles', params)
  }

  getStatuscodes (params) {
    return this.instance.post('/statuscode/statuscodes', params)
  }
  getStatuscodeByID (params) {
    return this.instance.post('/statuscode/detail', params)
  }
  createStatuscode (params) {
    return this.instance.post('/statuscode/create', params)
  }
  updateStatuscode (params) {
    return this.instance.post('/statuscode/update', params)
  }
  removeStatuscode (params) {
    return this.instance.post('/statuscode/remove', params)
  }

  getLastEvent (params) {
    return this.instance.post('/eventdata/getlastevent', params)
  }
  getGroupLastEvent (params) {
    return this.instance.post('/eventdata/getgrouplastevent', params)
  }
  getRouteData (params) {
    return this.instance.post('/eventdata/getevents', params)
  }
}

const api = new RestApi()

export default ({ Vue, router }) => {
  api.config({ router })
  Vue.prototype.$api = api
}
export { api }
