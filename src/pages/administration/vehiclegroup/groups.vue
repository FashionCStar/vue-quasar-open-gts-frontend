<template>
  <q-page padding>
    <template>
      <div class="q-pa-md">
        <q-table
          title="Vehicle Groups"
          :data="groupList"
          :columns="columns"
          :visible-columns="visibleColumns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getGroupList"
          binary-state-sort
        >
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
            <div class="items-center q-ml-xl">
              <q-btn v-show="enableEdit>=3" class="bg-white text-primary shadow-3 q-btn--push" @click="createNew()">
                Create New Group
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :props="col.props" v-for="(col, index) in props.cols" :key="index" :align="col.align" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.group.accountID, props.row.group.groupID)">
              <q-td key="accountID" :props="props" v-show="isAdmin">{{ props.row.group.accountID }}</q-td>
              <q-td key="groupID" :props="props">{{ props.row.group.groupID }}</q-td>
              <q-td key="displayName" :props="props">{{ props.row.group.displayName }}</q-td>
              <q-td key="description" :props="props">{{ props.row.group.description }}</q-td>
              <q-td key="vehicleCount" :props="props">{{ props.row.deviceCount }}</q-td>
              <q-td key="buttons" :props="props">
                <q-btn
                  v-show="enableEdit>=3"
                  icon="fas fa-trash-alt"
                  round glossy
                  size="sm"
                  color="black"
                  @click.native.stop
                  @click="removeGroup(props.row.group)"
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
  name: 'Vehicles',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'groupID',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      columns: [
        { name: 'accountID', required: true, label: 'accountID', align: 'left', field: row => row.name, format: val => `${val}`, sortable: true },
        { name: 'groupID', label: 'groupID', align: 'left', field: row => row.name, format: val => `${val}`, sortable: true },
        { name: 'displayName', align: 'center', label: 'groupName', field: 'displayName', sortable: true },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'vehicleCount', align: 'center', label: 'vehiclesCount', field: 'vehicleCount' },
        { name: 'buttons', required: true, label: '', field: 'buttons' }
      ],
      groupList: [],
      enableEdit: 3,
      permissions: [],
      userLevel: 'account',
      visibleColumns: []
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.permissions = LocalStorage.getItem('permissions')
  },
  mounted () {
    if (LocalStorage.getItem('userLevel') === 'user') {
      this.enableEdit = permissionChecker.checkGroupAdmin(this.permissions)
      if (permissionChecker.checkGroupShowGroupID(this.permissions)) { this.visibleColumns.push('groupID') }
      if (permissionChecker.checkGroupShowDescription(this.permissions)) { this.visibleColumns.push('description') }
      if (permissionChecker.checkGroupShowGroupName(this.permissions)) { this.visibleColumns.push('displayName') }
      if (permissionChecker.checkGroupShowCounts(this.permissions)) { this.visibleColumns.push('vehicleCount') }
    } else {
      this.visibleColumns = ['groupID', 'displayName', 'description', 'vehicleCount']
    }
    // get initial groupList from server (1st page)
    this.getGroupList({
      pagination: this.pagination,
      filter: undefined
    })
    if (LocalStorage.getItem('userLevel') === 'user') {
      this.enableEdit = permissionChecker.checkGroupAdmin(LocalStorage.getItem('permissions'))
    }
  },
  methods: {
    createNew () {
      this.$router.push('/groups/create')
    },

    goToDetail (accountID, groupID) {
      if (this.enableEdit >= 2) {
        this.$router.push({ name: 'Update Group', params: { accountID: accountID, id: groupID } })
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
        this.getGroupList({
          pagination: this.pagination,
          filter: this.filter
        })
      }
    },

    getGroupList: async function (props) {
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
        let res = await api.getDevicegroups(params)

        // clear out existing vehicleList and add new
        this.groupList = res.data.devicegroups

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

    removeGroup (groupInfo) {
      // Confirm Remove Vehicle
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('confirmDelete', { item: this.$t('group'), id: groupInfo.groupID }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            accountID: groupInfo.accountID,
            groupID: groupInfo.groupID
          }
        }
        try {
          let res = await api.removeDevicegroup(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: groupInfo.groupID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getGroupList({
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
  thead {
    background-color: rgba(99, 218, 161, 0.14);
  }
  tr:nth-child(odd) {
    background-color: rgba(207, 207, 207, 0.24);
  }
</style>
