<template>
  <q-page padding>
    <template>
      <div class="q-pa-md">
        <q-table
          title="Status Codes"
          :data="statuscodeList"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getStatusCodeList"
          binary-state-sort
        >
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <div class="items-center q-ml-xl">
              <q-btn v-show="enableEdit >= 3" class="bg-white text-primary shadow-3 q-btn--push" @click="createNew()">
                Create New StatusCode
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :align="col.align" :props="col.props" v-for="(col, index) in props.cols" :key="index" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.accountID, props.row.statusCode)">
              <q-td key="accountID" :props="props" v-show="isAdmin">{{ props.row.accountID }}</q-td>
              <q-td key="statusCode" :props="props">{{ props.row.statusCode }}</q-td>
              <q-td key="statusName" :props="props">{{ props.row.statusName }}</q-td>
              <q-td key="description" :props="props">{{ props.row.description }}</q-td>
              <q-td key="buttons" :props="props">
                <q-btn
                  v-show="enableEdit >= 3"
                  icon="fas fa-trash-alt"
                  round glossy
                  size="sm"
                  color="black"
                  @click.native.stop
                  @click="removeStatuscode(props.row)"
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
import { LocalStorage } from 'quasar'
import { permissionChecker } from 'src/boot/checkPermission'

export default {
  name: 'Statuscodes',
  data () {
    return {
      filter: '',
      loading: false,
      enableEdit: 3,
      pagination: {
        sortBy: 'statusCode',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      columns: [
        { name: 'accountID', label: 'accountID', align: 'left', field: 'accountID', sortable: true },
        { name: 'statusCode', label: 'statusCode', align: 'left', field: row => row.name, format: val => `${val}`, sortable: true },
        { name: 'statusName', align: 'center', label: 'statusName', field: 'statusName', sortable: true },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'buttons', label: '', field: 'buttons' }
      ],
      statuscodeList: []
    }
  },
  mounted () {
    if (LocalStorage.getItem('userLevel') === 'user') {
      this.enableEdit = permissionChecker.checkStatusCodeAdmin(LocalStorage.getItem('permissions'))
    }
    // get initial vehicleList from server (1st page)

    this.getStatusCodeList({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    createNew () {
      this.$router.push('/statuscodes/create')
    },

    goToDetail (accountID, statusCode) {
      if (this.enableEdit >= 2) {
        this.$router.push({ name: 'Update StatusCode', params: { accountID: accountID, id: statusCode } })
      }
    },
    isAdmin () {
      return LocalStorage.getItem('userLevel') === 'admin'
    },

    handleSort (col) {
      if (col.sortable) {
        if (this.pagination.sortBy === col.name) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = col.name
          this.pagination.descending = false
        }
        this.getStatusCodeList({
          pagination: this.pagination,
          filter: this.filter
        })
      }
    },

    getStatusCodeList: async function (props) {
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
        let res = await api.getStatuscodes(params)

        // clear out existing vehicleList and add new
        this.statuscodeList = res.data.statuscodes

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

    removeStatuscode (statuscodeInfo) {
      // Confirm Remove Vehicle
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('confirmDelete', { item: this.$t('statuscode'), id: statuscodeInfo.statusCode }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            accountID: statuscodeInfo.accountID,
            statusCode: statuscodeInfo.statusCode
          }
        }
        try {
          let res = await api.removeStatuscode(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: statuscodeInfo.statusCode + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getStatuscodeList({
            pagination: this.pagination,
            filter: undefined
          })
        } catch (e) {
        }
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    }
  },
  created () {
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
