<template>
  <q-page padding>
    <template>
      <div class="q-pa-md">
        <q-table
          :title="$t('geocorridor')"
          :data="corridorList"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getCorridorList"
          binary-state-sort
        >
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" :placeholder="$t('search')">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <div class="items-center q-ml-xl">
              <q-btn class="bg-white text-primary shadow-3 q-btn--push" @click="showNewDialog = true">
                {{$t('createnew', { item: $t('geocorridor') })}}
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :props="col.props" v-for="(col, index) in props.cols" :key="index" :align="col.align" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.accountID, props.row.corridorID)">
              <q-td key="accountID" :props="props" v-show="isAdmin">{{ props.row.accountID }}</q-td>
              <q-td key="corridorID" :props="props">{{ props.row.corridorID }}</q-td>
              <q-td key="description" :props="props">{{ props.row.description }}</q-td>
              <q-td key="radius" :props="props">{{ props.row.radius }}</q-td>
              <q-td key="latitude" :props="props">{{ convertLatitude(props.row) }}</q-td>
              <q-td key="buttons" :props="props">
                <q-btn
                        class="q-ml-sm"
                        icon="fas fa-trash-alt"
                        round glossy
                        size="sm"
                        color="black"
                        v-show="editable >= 3"
                        @click.native.stop
                        @click="removeCorridor(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <q-dialog v-model="showNewDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">New Corridor</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="createCorridor" class="q-gutter-sm" :model="corridorForm">
              <q-select v-model="corridorForm.accountID"
                        :options="accountIDList"
                        :label="$t('accountID')"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        :readonly="userLevel !== 'admin'"
              />
              <q-input v-model="corridorForm.corridorID"
                       :label="$t('corridorID')"
                       :rules="[val => !!val || 'Field is required']"
              />
              <q-input v-model="corridorForm.description"
                       :label="$t('description')"
              />

              <div class="text-right q-mt-md">
                <q-btn label="Cancel" color="primary" @click="resetForm" v-close-popup />
                <q-btn label="Create" type="submit" color="primary" class="q-ml-sm"/>
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
  name: 'Users',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'corridorID',
        descending: false,
        page: 0,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      columns: [
        { name: 'accountID', required: true, label: 'accountID', align: 'center', field: 'accountID', sortable: true },
        { name: 'corridorID', label: 'corridorID', align: 'center', field: 'corridorID', sortable: true },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'radius', align: 'center', label: 'radius', field: 'radius', sortable: true },
        { name: 'latitude', align: 'center', label: 'startLatLng', field: 'latitude', sortable: true },
        { name: 'buttons', required: true, label: '', field: 'buttons' }
      ],
      corridorList: [],
      userLevel: 'account',
      permissions: [],
      editable: 3,
      showNewDialog: false,
      accountID: '',
      accountIDList: [],

      corridorForm: {
        accountID: '',
        corridorID: '',
        radius: 1000,
        displayName: '',
        description: ''
      }
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.permissions = LocalStorage.getItem('permissions')
    this.accountID = LocalStorage.getItem('accountID')
  },
  mounted () {
    if (this.userLevel === 'user') {
      this.editable = permissionChecker.checkGeoCorridorAdmin(this.permissions)
    }
    // get initial userList from server (1st page)
    this.getAccountIDList()
    this.getCorridorList({
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
        console.log('ERROR', error)
      }
    },
    isAdmin () {
      return LocalStorage.getItem('userLevel') === 'admin'
    },
    goToDetail (accountID, corridorID) {
      this.$router.push({ name: 'Update GeoCorridor', params: { accountID: accountID, id: corridorID } })
    },

    handleSort (col) {
      if (col.sortable) {
        if (this.pagination.sortBy === col.name) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = col.name
          this.pagination.descending = false
        }
        this.getCorridorList({
          pagination: this.pagination,
          filter: undefined
        })
      }
    },
    createCorridor: async function () {
      const params = {
        data: this.corridorForm
      }
      try {
        let res = await api.createCorridor(params)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.corridorForm.corridorID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
        this.getCorridorList({
          pagination: this.pagination,
          filter: this.filter
        })
        this.showNewDialog = false
        this.resetForm()
      } catch (e) {
        this.showNewDialog = false
        this.resetForm()
      }
    },
    getCorridorList: async function (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination
      let filter = props.filter

      this.loading = true

      // get all rows if "All" (0) is selected
      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage

      // calculate starting row of userList
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

      // fetch userList from "server"
      try {
        let res = await api.getCorridors(params)

        // clear out existing userList and add new
        this.corridorList = res.data.corridors
        this.corridorForm.accountID = this.accountID
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
    convertLatitude (location) {
      if (location.latitude) {
        return location.latitude.toFixed(5) + ' / ' + location.longitude.toFixed(5)
      } else {
        return '-- / --'
      }
    },

    removeCorridor (corridorInfo) {
      // Confirm Remove User
      this.$q.dialog({
        title: this.$t('confirm'),
        message: this.$t('confirmDelete', { item: this.$t('geocorridor'), id: corridorInfo.corridorID }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            accountID: corridorInfo.accountID,
            corridorID: corridorInfo.corridorID
          }
        }
        try {
          let res = await api.removeCorridor(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: corridorInfo.corridorID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getCorridorList({
            pagination: this.pagination,
            filter: undefined
          })
        } catch (e) {
        }
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    },
    resetForm () {
      this.corridorForm.accountID = this.accountID
      this.corridorForm.corridorID = ''
      this.corridorForm.description = ''
    }
  }
}
</script>

<style lang="stylus">
  .my-sticky-header-table
    /* max height is important */

    .q-table__top,
    .q-table__bottom,
      thead tr:first-child th /* bg color is important for th; just specify one */
      background-color #c1f4cd

    thead tr:first-child th
      position sticky
      top 0
      opacity 1
      z-index 1
</style>
