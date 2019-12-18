<template>
  <q-page padding>
    <template>
      <div class="q-pa-md">
        <q-table
          :title="$t('users')"
          :data="userList"
          :visible-columns="visibleColumns"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getUserList"
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
                {{$t('createnew', { item: $t('user') })}}
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :props="col.props" v-for="(col, index) in props.cols" :key="index" :align="col.align" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.accountID, props.row.userID)">
              <q-td key="accountID" :props="props" v-show="isAdmin">{{ props.row.accountID }}</q-td>
              <q-td key="userID" :props="props">{{ props.row.userID }}</q-td>
              <q-td key="description" :props="props">{{ props.row.description }}</q-td>
              <q-td key="roleID" :props="props">
                <div class="text-pre-wrap">{{ props.row.roleID }}</div>
              </q-td>
              <q-td key="newRole" :props="props">{{ props.row.newRole }}</q-td>
              <q-td key="contactName" :props="props">{{ props.row.contactName }}</q-td>
              <q-td key="contactPhone" :props="props">{{ props.row.contactPhone }}</q-td>
              <q-td key="contactEmail" :props="props">{{ props.row.contactEmail }}</q-td>
              <q-td key="timeZone" :props="props">{{ props.row.timeZone }}</q-td>
              <q-td key="lastLoginTime" :props="props">{{ convertToDate(props.row.lastLoginTime) }}</q-td>
              <q-td key="buttons" :props="props">
                <q-btn  :icon="props.row.isActive ? 'fas fa-check-circle' : 'fas fa-ban' "
                        :color="props.row.isActive ? 'teal' : 'red' "
                        size="sm"
                        round glossy
                        v-show="editable >= 3"
                        @click.native.stop
                        @click="isActive(props.row)"
                />
                <q-btn
                        class="q-ml-sm"
                        icon="fas fa-trash-alt"
                        round glossy
                        size="sm"
                        color="black"
                        v-show="editable >= 3"
                        @click.native.stop
                        @click="removeUser(props.row)"
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
  name: 'Users',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'userID',
        descending: false,
        page: 0,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      visibleColumns: [],
      columns: [
        { name: 'accountID', required: true, label: 'accountID', align: 'left', field: 'accountID', sortable: true },
        { name: 'userID', label: 'userID', align: 'left', field: row => row.name, format: val => `${val}`, sortable: true },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'roleID', align: 'center', label: 'role', field: 'roleID', sortable: true, style: 'width: 10px' },
        { name: 'newRole', align: 'center', label: 'newRole', field: 'newRole', sortable: true },
        { name: 'contactName', align: 'center', label: 'contactName', field: 'contactName', sortable: true },
        { name: 'contactPhone', align: 'center', label: 'contactPhone', field: 'contactPhone', sortable: true },
        { name: 'contactEmail', align: 'center', label: 'contactEmail', field: 'contactEmail', sortable: true },
        { name: 'timeZone', required: true, align: 'center', label: 'timezone', field: 'timeZone' },
        { name: 'lastLoginTime', align: 'center', label: 'lastLogin', field: 'lastLoginTime', sortable: true },
        { name: 'buttons', required: true, label: '', field: 'buttons' }
      ],
      userList: [],
      userLevel: 'account',
      permissions: [],
      editable: 3
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.permissions = LocalStorage.getItem('permissions')
  },
  mounted () {
    if (this.userLevel === 'user') {
      this.editable = permissionChecker.checkProfileAuthorized(this.permissions)
      if (permissionChecker.checkUserShowUserID(this.permissions)) { this.visibleColumns.push('userID') }
      if (permissionChecker.checkUserShowDescription(this.permissions)) { this.visibleColumns.push('description') }
      if (permissionChecker.checkUserShowRole(this.permissions)) { this.visibleColumns.push('roleID', 'newRole') }
      if (permissionChecker.checkUserShowContactName(this.permissions)) { this.visibleColumns.push('contactName') }
      if (permissionChecker.checkUserShowContactPhone(this.permissions)) { this.visibleColumns.push('contactPhone') }
      if (permissionChecker.checkUserShowContactEmail(this.permissions)) { this.visibleColumns.push('contactEmail') }
      if (permissionChecker.checkUserShowLastLogin(this.permissions)) { this.visibleColumns.push('lastLoginTime') }
    } else {
      this.visibleColumns = ['userID', 'description', 'roleID', 'newRole', 'contactName', 'contactPhone', 'contactEmail', 'lastLoginTime']
    }
    // get initial userList from server (1st page)
    this.getUserList({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    alert () {
      alert('alert')
    },

    createNew () {
      this.$router.push('/users/create')
    },

    goToDetail (accountID, userID) {
      this.$router.push({ name: 'Update User', params: { accountID: accountID, id: userID } })
    },

    isAdmin () {
      return LocalStorage.getItem('userLevel') === 'admin'
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
        this.getUserList({
          pagination: this.pagination,
          filter: undefined
        })
      }
    },

    getUserList: async function (props) {
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
        let res = await api.getUsers(params)

        // clear out existing userList and add new
        this.userList = res.data.users

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

    async isActive (userInfo) {
      userInfo.isActive = !userInfo.isActive
      const params = {
        conditions: {
          accountID: userInfo.accountID,
          userID: userInfo.userID
        },
        isActive: userInfo.isActive
      }
      try {
        let res = await api.activeUser(params)
        console.log(res.data)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: userInfo.userID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
      } catch (e) {
      }
    },

    removeUser (userInfo) {
      // Confirm Remove User
      this.$q.dialog({
        title: this.$t('confirm'),
        message: this.$t('confirmDelete', { item: this.$t('user'), id: userInfo.userID }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            accountID: userInfo.accountID,
            userID: userInfo.userID
          }
        }
        try {
          let res = await api.removeUser(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: userInfo.userID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getUserList({
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
