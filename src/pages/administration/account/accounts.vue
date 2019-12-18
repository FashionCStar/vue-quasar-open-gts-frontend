<template>
  <q-page padding>
    <template>
      <div class="q-pa-md">
        <q-table
          :title="$t('accounts')"
          :data="accountList"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getAccountList"
          binary-state-sort
        >
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" :placeholder="$t('search')">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <div class="items-center q-ml-xl">
              <q-btn class="bg-white text-primary shadow-3 q-btn--push" @click="createNew()">
                {{$t('createnew', { item: $t('account') })}}
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :props="col.props" v-for="(col, index) in props.cols" :key="index" :align="col.align" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.accountID)">
              <q-td key="accountID" :props="props">{{ props.row.accountID }}</q-td>
              <q-td key="description" :props="props">{{ props.row.description }}</q-td>
              <q-td key="managerID" :props="props">{{ props.row.managerID }}</q-td>
              <q-td key="deviceCounts" :props="props">{{ props.row.deviceCount }}</q-td>
              <q-td key="contactName" :props="props">{{ props.row.contactName }}</q-td>
              <q-td key="contactPhone" :props="props">{{ props.row.contactPhone }}</q-td>
              <q-td key="contactEmail" :props="props">{{ props.row.contactEmail }}</q-td>
              <q-td key="timeZone" :props="props">{{ props.row.timeZone }}</q-td>
              <q-td key="lastLoginTime" :props="props">{{ convertToDate(props.row.lastLoginTime) }}</q-td>
              <q-td key="buttons" :props="props">
                <q-btn
                  :icon="props.row.isActive ? 'fas fa-check-circle' : 'fas fa-ban' "
                  :color="props.row.isActive ? 'teal' : 'red' "
                  size="sm"
                  round glossy
                  @click.native.stop
                  @click="isActive(props.row)"
                />
                <q-btn
                        class="q-ml-sm"
                  icon="fas fa-trash-alt"
                  round glossy
                  size="sm"
                  color="black"
                  @click.native.stop
                  @click="removeAccount(props.row)"
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
import { date } from 'quasar'

export default {
  name: 'Accounts',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'accountID',
        descending: false,
        page: 0,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      columns: [
        {
          name: 'accountID',
          required: true,
          label: 'accountID',
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'managerID', align: 'center', label: 'manager', field: 'managerID', style: 'width: 10px', sortable: true },
        { name: 'deviceCounts', align: 'center', label: 'deviceCounts', field: 'deviceCounts', sortable: true },
        { name: 'contactName', align: 'center', label: 'contactName', field: 'contactName', sortable: true },
        { name: 'contactPhone', align: 'center', label: 'contactPhone', field: 'contactPhone', sortable: true },
        { name: 'contactEmail', align: 'center', label: 'contactEmail', field: 'contactEmail', sortable: true },
        { name: 'timeZone', align: 'center', label: 'timezone', field: 'timeZone' },
        { name: 'lastLoginTime', align: 'center', label: 'lastLogin', field: 'lastLoginTime', sortable: true },
        { name: 'buttons', label: '', field: 'buttons' }
      ],
      accountList: []
    }
  },
  mounted () {
    // get initial accountList from server (1st page)
    this.getAccountList({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    createNew () {
      this.$router.push('/accounts/create')
    },
    goToDetail (deviceID) {
      this.$router.push({ name: 'Update Account', params: { id: deviceID } })
    },

    convertToDate (value) {
      return date.formatDate(value * 1000, 'DD/MM/YYYY T HH:mm:ss')
    },

    handleSort (col) {
      if (col.sortable) {
        if (this.pagination.sortBy === col.name) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = col.name
          this.pagination.descending = false
        }
        this.getAccountList({
          pagination: this.pagination,
          filter: this.filter
        })
      }
    },

    getAccountList: async function (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination
      let filter = props.filter

      this.loading = true

      // get all rows if "All" (0) is selected
      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage

      // calculate starting row of accountList
      let startRow = (page - 1) * rowsPerPage

      const params = {
        conditions: {},
        start: startRow,
        numPerPage: fetchCount,
        sortBy: sortBy,
        descending: descending
      }
      if (filter) {
        params.conditions.filter = filter
      }

      // fetch accountList from "server"
      try {
        let res = await api.getAccounts(params)

        // clear out existing accountList and add new
        this.accountList = res.data.accounts.rows

        // update rowsCount with appropriate value
        this.pagination.rowsNumber = res.data.totalCounts.length

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

    async isActive (accountInfo) {
      accountInfo.isActive = !accountInfo.isActive
      const params = {
        conditions: {
          accountID: accountInfo.accountID
        },
        isActive: accountInfo.isActive
      }
      try {
        let res = await api.activeAccount(params)
        console.log(res.data)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: accountInfo.accountID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
      } catch (e) {
      }
    },

    removeAccount (accountInfo) {
      // Confirm Remove User
      this.$q.dialog({
        title: this.$t('confirm'),
        message: this.$t('confirmDelete', { item: this.$t('account'), id: accountInfo.accountID }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            accountID: accountInfo.accountID
          }
        }
        try {
          let res = await api.removeAccount(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: accountInfo.accountID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getAccountList({
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
    // this.getUsers()
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
