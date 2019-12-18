<template>
  <q-page padding>
    <!-- content -->
    <template>
      <div class="q-pa-md">
        <q-table
          title="Roles"
          :data="roleList"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getRoleList"
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
                {{$t('createnew', { item: $t('role') })}}
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :align="col.align" :props="col.props" v-for="(col, index) in props.cols" :key="index" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.roleID)">
              <q-td key="roleID" :props="props">
                {{ props.row.roleID }}
              </q-td>
              <q-td key="displayName" :props="props">
                {{ props.row.displayName }}
              </q-td>
              <q-td key="permissionCount" :props="props">
                {{ getPermissionCounts(props.row.permissions) }}
              </q-td>
              <q-td key="buttons" :props="props">
                <q-btn v-show="enableEdit >= 3"
                        icon="fas fa-copy"
                       size="sm"
                       color="purple"
                       round glossy
                       @click.native.stop
                       @click="showClonePrompt(props.row)"
                />
                <q-btn v-show="enableEdit >= 3"
                  icon="fas fa-trash-alt"
                  round glossy
                  size="sm"
                  color="black"
                  class="q-ml-sm"
                  @click.native.stop
                  @click="removeRole(props.row.roleID)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <q-dialog v-model="clonePrompt" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Clone Role</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="cloneRole" :model="roleForm">
              <q-input v-model="roleForm.roleID"
                       label="Role ID"
                       :rules="[val => !!val || 'RoleID is required']"
              />
              <q-input v-model="roleForm.displayName"
                       label="Role Name"
                       :rules="[val => !!val || 'RoleName is required']"
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
  name: 'Roles',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'roleID',
        descending: false,
        page: 0,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      clonePrompt: false,
      columns: [
        { name: 'roleID', align: 'center', label: 'roleID', field: 'roleID', sortable: true },
        { name: 'displayName', align: 'center', label: 'description', field: 'displayName', sortable: true },
        { name: 'permissionCount', align: 'center', label: 'permissionCount', field: 'permissionCount' },
        { name: 'buttons', label: '', field: 'buttons' }
      ],
      enableEdit: 3,
      roleInfo: null,
      roleList: [],
      roleForm: {
        roleID: '',
        displayName: ''
      }
    }
  },
  mounted () {
    if (LocalStorage.getItem('userLevel') === 'user') {
      this.enableEdit = permissionChecker.checkRoleAdmin(LocalStorage.getItem('permissions'))
    }
    // get initial accountList from server (1st page)
    this.getRoleList({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    createNew () {
      this.$router.push('/roles/create')
    },
    goToDetail (roleID) {
      if (this.enableEdit >= 2) {
        this.$router.push({ name: 'Update Role', params: { id: roleID } })
      }
    },
    async handleSort (col) {
      if (col.sortable) {
        if (this.pagination.sortBy === col.name) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = col.name
          this.pagination.descending = false
        }
        this.getRoleList({
          pagination: this.pagination,
          filter: this.filter
        })
      }
    },

    getPermissionCounts (permissions) {
      return permissions.filter(item => item.RoleHasPermission.value !== '0').length
    },

    getRoleList: async function (props) {
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
        let res = await api.getRoles(params)

        // clear out existing accountList and add new
        this.roleList = res.data.roles

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

    removeRole: function (roleID) {
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('confirmDelete', { item: this.$t('role'), id: roleID }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            roleID: roleID
          }
        }
        try {
          let res = await api.removeRole(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: roleID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getRoleList({
            pagination: this.pagination,
            filter: undefined
          })
        } catch (e) {
        }
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    },
    showClonePrompt (roleInfo) {
      this.roleInfo = roleInfo
      this.clonePrompt = true
    },
    cloneRole () {
      const params = {
        data: {
          roleInfo: this.roleInfo,
          cloneData: this.roleForm
        }
      }

      api.cloneRole(params).then((res) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.roleForm.roleID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
        this.clonePrompt = false
        this.resetForm()
        this.getRoleList({
          pagination: this.pagination,
          filter: undefined
        })
      }).catch(() => {})
    },
    resetForm () {
      this.roleForm = {
        roleID: '',
        displayName: ''
      }
    }
  }
}
</script>

<style>
</style>
