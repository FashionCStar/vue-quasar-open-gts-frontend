<template>
  <q-page padding>
    <template>
      <div class="q-pa-md">
        <q-table
          :title="$t('vehicles')"
          :data="vehicleList"
          :visible-columns="visibleColumns"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getVehicleList"
          binary-state-sort
        >
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" :placeholder="$t('search')">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <div class="items-center q-ml-xl">
              <q-btn  v-show="enableEdit>=3" class="bg-white text-primary shadow-3 q-btn--push" @click="createNew()">
                {{$t('createnew', { item: $t('vehicle') })}}
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :props="col.props" v-for="(col, index) in props.cols" :key="index" :align="col.align" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.accountID, props.row.deviceID)">
              <q-td key="accountID" :props="props" v-show="isAdmin">{{ props.row.accountID }}</q-td>
              <q-td key="deviceID" :props="props">{{ props.row.deviceID }}</q-td>
              <q-td key="uniqueID" :props="props">{{ props.row.uniqueID }}</q-td>
              <q-td key="description" :props="props">{{ props.row.description }}</q-td>
              <q-td key="equipmentType" :props="props">{{ props.row.equipmentType }}</q-td>
              <q-td key="simPhoneNumber" :props="props">{{ props.row.simPhoneNumber }}</q-td>
              <q-td key="deviceCode" :props="props">{{ props.row.deviceCode }}</q-td>
              <q-td key="ignitionIndex" :props="props">{{ convertIgnitionState(props.row.ignitionIndex) }}</q-td>
              <q-td key="buttons" :props="props">
                <q-btn
                        v-show="enableEdit >= 3"
                        icon="fas fa-copy"
                        size="sm"
                        color="purple"
                        round glossy
                        @click.native.stop
                        @click="showClonePrompt(props.row)"
                />
                <q-btn
                  v-show="activeEdit >= 2"
                  :icon="props.row.isActive ? 'fas fa-check-circle' : 'fas fa-ban' "
                  size="sm"
                  :color="props.row.isActive ? 'teal' : 'red' "
                  round glossy
                  class="q-ml-sm"
                  @click.native.stop
                  @click="isActive(props.row)"
                />
                <q-btn
                  v-show="enableEdit >= 3"
                  icon="fas fa-trash-alt"
                  round glossy
                  size="sm"
                  color="black"
                  class="q-ml-sm"
                  @click.native.stop
                  @click="removeVehicle(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <q-dialog v-model="clonePrompt" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Clone Vehicle</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="cloneVehicle" class="q-gutter-sm" :model="vehicleForm">
              <q-select v-model="vehicleForm.accountID"
                        :options="accountIDList"
                        :label="$t('accountID')"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        disable
              />
              <q-input v-model="vehicleForm.deviceID"
                       :label="$t('deviceID')"
                       :rules="[val => !!val || 'Field is required']"
              />
              <q-input v-model="vehicleForm.uniqueID"
                       :label="$t('uniqueID')"
                       :rules="[val => !!val || 'Field is required']"
              />
              <q-input v-model="vehicleForm.simPhoneNumber"
                       :label="$t('simphone')"
                       :rules="[val => !!val || 'Field is required']"
              />
              <q-input v-model="vehicleForm.description"
                       :label="$t('description')"
              />
              <q-input v-model="vehicleForm.displayName"
                       :label="$t('displayName')"
              />
              <q-input v-model="vehicleForm.imeiNumber"
                       :label="$t('imeiNumber')"
              />
              <q-input v-model="vehicleForm.serialNumber"
                       :label="$t('serialNumber')"
              />
              <q-input v-model="vehicleForm.licensePlate"
                       :label="$t('licensePlate')"
              />

              <div class="text-right q-mt-md">
                <q-btn label="Cancel" color="primary" @click="resetForm" v-close-popup />
                <q-btn label="Clone" type="submit" color="primary" class="q-ml-sm"/>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script>

import { api } from 'src/boot/api'
import { LocalStorage } from 'quasar'
import { permissionChecker } from 'src/boot/checkPermission'

export default {
  name: 'Vehicles',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'deviceID',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      deviceInfo: '',
      clonePrompt: false,
      columns: [
        { name: 'accountID', required: true, label: 'accountID', align: 'left', field: 'accountID', sortable: true },
        {
          name: 'deviceID',
          label: 'deviceID',
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'uniqueID', align: 'center', label: 'uniqueID', field: 'uniqueID', sortable: true },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'equipmentType', align: 'center', label: 'equipmentType', field: 'equipmentType', sortable: true },
        { name: 'simPhoneNumber', align: 'center', label: 'simphone', field: 'simPhoneNumber', sortable: true },
        { name: 'deviceCode', align: 'center', label: 'serverID', field: 'deviceCode', sortable: true },
        { name: 'ignitionIndex', align: 'center', label: 'ignitionState', field: 'ignitionIndex', sortable: true },
        { name: 'buttons', required: true, label: '', field: 'buttons' }
      ],
      visibleColumns: [],
      vehicleList: [],
      vehicleForm: {
        accountID: '',
        deviceID: '',
        uniqueID: '',
        simPhoneNumber: '',
        description: '',
        displayName: '',
        imeiNumber: '',
        serialNumber: '',
        licensePlate: ''
      },
      groupList: [],
      enableEdit: 3,
      activeEdit: 3,
      ignitionIndexOptions: [
        { value: 'n/a', desc: 'n/a' },
        { value: 'IgnitionOn/Off', desc: 'IgnitionOn/Off' },
        { value: 'Start/Stop', desc: 'Start/Stop' },
        { value: '0', desc: '0' },
        { value: '1', desc: '1' },
        { value: '2', desc: '2' },
        { value: '3', desc: '3' },
        { value: '4', desc: '4' },
        { value: '5', desc: '5' },
        { value: '6', desc: '6' },
        { value: '7', desc: '7' }
      ],
      userLevel: 'account',
      accountIDList: [],
      permissions: []
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.vehicleForm.accountID = LocalStorage.getItem('accountID')
    this.permissions = LocalStorage.getItem('permissions')
    this.getAccountIDList()
  },
  mounted () {
    // get initial vehicleList from server (1st page)
    if (LocalStorage.getItem('userLevel') === 'user') {
      this.enableEdit = permissionChecker.checkVehicleAdmin(this.permissions)
      this.activeEdit = permissionChecker.checkVehicleActive(this.permissions)
      if (permissionChecker.checkVehicleShowVehicleID(this.permissions)) { this.visibleColumns.push('deviceID') }
      if (permissionChecker.checkVehicleShowDescription(this.permissions)) { this.visibleColumns.push('description') }
      if (permissionChecker.checkVehicleShowUniqueID(this.permissions)) { this.visibleColumns.push('uniqueID') }
      if (permissionChecker.checkVehicleShowEquipmentType(this.permissions)) { this.visibleColumns.push('equipmentType') }
      if (permissionChecker.checkVehicleShowSimPhoneNumber(this.permissions)) { this.visibleColumns.push('simPhoneNumber') }
      if (permissionChecker.checkVehicleShowServerID(this.permissions)) { this.visibleColumns.push('deviceCode') }
      if (permissionChecker.checkVehicleShowIgnitionState(this.permissions)) { this.visibleColumns.push('ignitionIndex') }
    } else {
      this.visibleColumns = ['deviceID', 'description', 'uniqueID', 'equipmentType', 'simPhoneNumber', 'deviceCode', 'ignitionIndex']
    }

    this.getVehicleList({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    async getAccountIDList () {
      try {
        let res = await api.getAllAccountIDs()
        this.accountIDList = res.data.accountList.map(item => item.accountID)
        this.loading = false
      } catch (error) {
        this.$router.push('/users')
      }
    },
    createNew () {
      this.$router.push('/vehicles/create')
    },
    goToDetail (accountID, deviceID) {
      if (this.enableEdit >= 2) {
        this.$router.push({ name: 'Update Vehicle', params: { accountID: accountID, id: deviceID } })
      }
    },
    isAdmin () {
      return LocalStorage.getItem('userLevel') === 'admin'
    },
    convertIgnitionState (value) {
      let state = ''
      if (value === -1 || value === 99 || value === 200) {
        state = 'Unknown'
      } else if (value >= 0 && value <= 7) {
        state = 'Off'
      }
      return state
    },
    handleSort (col) {
      if (col.sortable) {
        if (this.pagination.sortBy === col.name) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = col.name
          this.pagination.descending = false
        }
        this.getVehicleList({
          pagination: this.pagination,
          filter: this.filter
        })
      }
    },

    getVehicleList: async function (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination
      let filter = props.filter

      this.loading = true

      // get all rows if "All" (0) is selected
      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage

      // calculate starting row of vehicleList
      let startRow = (page - 1) * rowsPerPage

      const params = {
        conditions: {},
        start: startRow,
        numPerPage: fetchCount,
        sortBy: sortBy,
        descending: descending
      }
      if (LocalStorage.getItem('userLevel') !== 'admin') {
        params.conditions.accountID = LocalStorage.getItem('accountID')
      }
      if (filter) {
        params.conditions.filter = filter
      }

      // fetch vehicleList from "server"
      try {
        let res = await api.getVehicles(params)

        // clear out existing vehicleList and add new
        this.vehicleList = res.data.vehicles

        // update rowsCount with appropriate value
        this.pagination.rowsNumber = res.data.totalCount

        // don't forget to update local pagination object
        this.pagination.page = page
        this.pagination.rowsPerPage = rowsPerPage
        this.pagination.sortBy = sortBy
        this.pagination.descending = descending

        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
      }
    },

    async isActive (vehicleInfo) {
      vehicleInfo.isActive = !vehicleInfo.isActive
      const params = {
        conditions: {
          accountID: vehicleInfo.accountID,
          deviceID: vehicleInfo.deviceID
        },
        isActive: vehicleInfo.isActive
      }
      try {
        let res = await api.activeVehicle(params)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: vehicleInfo.deviceID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
      } catch (e) {
      }
    },

    removeVehicle (deviceInfo) {
      // Confirm Remove Vehicle
      this.$q.dialog({
        title: this.$t('confirm'),
        message: this.$t('confirmDelete', { item: this.$t('vehicle'), id: deviceInfo.deviceID }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            accountID: deviceInfo.accountID,
            deviceID: deviceInfo.deviceID
          }
        }
        try {
          let res = await api.removeVehicle(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: deviceInfo.deviceID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getVehicleList({
            pagination: this.pagination,
            filter: undefined
          })
        } catch (e) {
        }
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    },
    async getGroupList () {
      const params = {
        conditions: {
        }
      }
      if (this.isNewPage) {
        if (LocalStorage.getItem('userLevel') !== 'admin') {
          params.conditions.accountID = LocalStorage.getItem('accountID')
        }
      } else {
        params.conditions.accountID = this.currentAccountID
      }
      try {
        let res = await api.getVehicleGroupsByAccount(params)
        this.groupList = res.data.groupList
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/users')
      }
    },
    showClonePrompt (deviceInfo) {
      this.deviceInfo = deviceInfo
      this.vehicleForm.accountID = deviceInfo.accountID
      this.clonePrompt = true
    },
    async cloneVehicle () {
      let params = {
        conditions: {
          accountID: this.deviceInfo.accountID,
          deviceID: this.deviceInfo.deviceID
        } }
      const res = await api.getVehicleByID(params)
      this.groupList = res.data.groupList

      const groupList = this.groupList.map(group => ({
        accountID: group.accountID,
        groupID: group.groupID,
        deviceID: this.vehicleForm.deviceID,
        creationTime: parseInt(Date.now() / 1000),
        lastUpdateTime: parseInt(Date.now() / 1000) })
      )

      params = {
        data: {
          deviceData: this.deviceInfo,
          updateData: this.vehicleForm,
          groupList: groupList
        }
      }

      api.cloneVehicle(params).then((res) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.vehicleForm.deviceID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
        this.clonePrompt = false
        this.resetForm()
        this.getVehicleList({
          pagination: this.pagination,
          filter: undefined
        })
      }).catch(e => {
        this.clonePrompt = false
        this.resetForm()
      })
    },
    resetForm () {
      this.vehicleForm.deviceID = ''
      this.vehicleForm.uniqueID = ''
      this.vehicleForm.simPhoneNumber = ''
      this.groupList = []
    }
  }
}
</script>
