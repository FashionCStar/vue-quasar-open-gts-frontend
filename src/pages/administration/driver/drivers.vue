<template>
  <q-page padding>
    <template>
      <div class="q-pa-md">
        <q-table
          title="Drivers"
          :data="driverList"
          :columns="columns"
          :visible-columns="visibleColumns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getDriverList"
          binary-state-sort
        >
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <div class="items-center q-ml-xl">
              <q-btn v-show="enableEdit>=3" class="bg-white text-primary shadow-3 q-btn--push" @click="createNew()">
                Create New Driver
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :align="col.align" :props="col.props" v-for="(col, index) in props.cols" :key="index" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.accountID, props.row.driverID)">
              <q-td key="accountID" :props="props" v-show="isAdmin">{{ props.row.accountID }}</q-td>
              <q-td key="driverID" :props="props">{{ props.row.driverID }}</q-td>
              <q-td key="description" :props="props">{{ props.row.description }}</q-td>
              <q-td key="contactPhone" :props="props">{{ props.row.contactPhone }}</q-td>
              <q-td key="badgeID" :props="props">{{ props.row.badgeID }}</q-td>
              <q-td key="licenseNumber" :props="props">{{ props.row.licenseNumber }}</q-td>
              <q-td key="licenseType" :props="props">{{ props.row.licenseType }}</q-td>
              <q-td key="licenseExpire" :props="props">{{ convertToDate( props.row.licenseExpire ) }}</q-td>
              <q-td key="buttons" :props="props">
                <q-btn
                  v-show="enableEdit>=3"
                  icon="fas fa-trash-alt"
                  round glossy
                  size="sm"
                  color="black"
                  @click.native.stop
                  @click="removeDriver(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </template>
  </q-page>
</template>

<script>

import { api } from 'src/boot/api'
import { date, LocalStorage } from 'quasar'
import { permissionChecker } from 'src/boot/checkPermission'

export default {
  name: 'Drivers',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'driverID',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      visibleColumns: [],
      columns: [
        { name: 'accountID', required: true, label: 'accountID', align: 'left', field: 'accountID', sortable: true },
        { name: 'driverID', label: 'driverID', align: 'left', field: row => row.name, format: val => `${val}`, sortable: true },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'contactPhone', align: 'center', label: 'contactPhone', field: 'contactPhone', sortable: true },
        { name: 'badgeID', align: 'center', label: 'badgeID', field: 'badgeID', sortable: true },
        { name: 'licenseNumber', align: 'center', label: 'licenseNumber', field: 'licenseNumber', sortable: true },
        { name: 'licenseType', align: 'center', label: 'licenseType', field: 'licenseType', sortable: true },
        { name: 'licenseExpire', align: 'center', label: 'licenseExpire', field: 'licenseExpire', sortable: true },
        { name: 'buttons', required: true, label: '', field: 'buttons' }
      ],
      driverList: [],
      enableEdit: 3,
      userLevel: 'account',
      permissions: []
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.permissions = LocalStorage.getItem('permissions')
  },
  mounted () {
    // get initial vehicleList from server (1st page)
    if (LocalStorage.getItem('userLevel') === 'user') {
      this.enableEdit = permissionChecker.checkDriverAdmin(this.permissions)
      if (permissionChecker.checkDriverShowDriverID(this.permissions)) { this.visibleColumns.push('driverID') }
      if (permissionChecker.checkDriverShowDescription(this.permissions)) { this.visibleColumns.push('description') }
      if (permissionChecker.checkDriverShowContactPhone(this.permissions)) { this.visibleColumns.push('contactPhone') }
      if (permissionChecker.checkDriverShowBadgeID(this.permissions)) { this.visibleColumns.push('badgeID') }
      if (permissionChecker.checkDriverShowLicenseNumber(this.permissions)) { this.visibleColumns.push('licenseNumber') }
      if (permissionChecker.checkDriverShowLicenseType(this.permissions)) { this.visibleColumns.push('licenseType') }
      if (permissionChecker.checkDriverShowLicenseExpire(this.permissions)) { this.visibleColumns.push('licenseExpire') }
    } else {
      this.visibleColumns = ['driverID', 'description', 'contactPhone', 'badgeID', 'licenseNumber', 'licenseType', 'licenseExpire']
    }
    // get initial vehicleList from server (1st page)
    this.getDriverList({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    createNew () {
      this.$router.push('/drivers/create')
    },

    goToDetail (accountID, driverID) {
      if (this.enableEdit >= 1) {
        this.$router.push({ name: 'Update Driver', params: { accountID: accountID, id: driverID } })
      }
    },
    isAdmin () {
      return LocalStorage.getItem('userLevel') === 'admin'
    },
    convertToDate (value) {
      return value !== 0 ? date.formatDate(value * 1000, 'DD/MM/YYYY T HH:mm:ss') : 0
    },
    handleSort (col) {
      if (col.sortable) {
        if (this.pagination.sortBy === col.name) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = col.name
          this.pagination.descending = false
        }
        this.getDriverList({
          pagination: this.pagination,
          filter: this.filter
        })
      }
    },
    getDriverList: async function (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination
      let filter = props.filter

      this.loading = true

      // get all rows if "All" (0) is selected
      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage

      // calculate starting row of driverList
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
        let res = await api.getDrivers(params)

        // clear out existing vehicleList and add new
        this.driverList = res.data.drivers

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
        console.log('errorrrrrrrrrr', e)
      }
    },

    removeDriver (driverInfo) {
      // Confirm Remove Vehicle
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('confirmDelete', { item: this.$t('driver'), id: driverInfo.driverID }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            accountID: driverInfo.accountID,
            driverID: driverInfo.driverID
          }
        }
        try {
          let res = await api.removeDriver(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: driverInfo.driverID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getDriverList({
            pagination: this.pagination,
            filter: undefined
          })
        } catch (e) {
        }
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    }
  }
}
</script>

<!--<style lang="stylus">-->
<!--.my-sticky-header-table-->
<!--/* max height is important */-->

<!--.q-table__top,-->
<!--.q-table__bottom,-->
<!--thead tr:first-child th /* bg color is important for th; just specify one */-->
<!--background-color #c1f4cd-->

<!--thead tr:first-child th-->
<!--position sticky-->
<!--top 0-->
<!--opacity 1-->
<!--z-index 1-->
<!--</style>-->
