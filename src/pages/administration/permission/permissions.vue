<template>
  <q-page padding>
    <!-- content -->
    <template>
      <div class="q-pa-md">
        <q-table
          title="Permissions"
          :data="permissionList"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getPermissionList"
          binary-state-sort
        >
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" :placeholder="$t('search')">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <div class="items-center q-ml-xl">
              <q-btn class="bg-white text-primary shadow-3 q-btn--push" @click="createNew = true">
                {{$t('createnew', { item: $t('permission') })}}
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :align="col.align" :props="col.props" v-for="(col, index) in props.cols" :key="index" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="permissionID" :props="props">
                {{ props.row.permissionID }}
                <q-popup-edit v-model="props.row.permissionID" :title="$t('updatePermissionID')"
                              @save="(val, initialValue) => updatePermission(val, initialValue, props.row, 'permissionID')" buttons>
                  <q-input v-model="props.row.permissionID" dense autofocus />
                </q-popup-edit>
              </q-td>
              <q-td key="displayName" :props="props">
                {{ props.row.displayName }}
                <q-popup-edit v-model="props.row.displayName" :title="$t('updateDisplayName')"
                              @save="(val, initialValue) => updatePermission(val, initialValue, props.row, 'displayName')" buttons>
                  <q-input v-model="props.row.displayName" dense autofocus />
                </q-popup-edit>
              </q-td>
              <q-td key="description" :props="props">
                {{ props.row.description }}
                <q-popup-edit v-model="props.row.description" :title="$t('updateDescription')" buttons>
                  <q-input v-model="props.row.description" dense autofocus />
                </q-popup-edit>
              </q-td>
              <q-td key="buttons" :props="props">
                <q-btn
                  :icon=" 'fas fa-trash-alt' "
                  @click.native.stop
                  @click="removePermission(props.row.permissionID)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <q-dialog v-model="createNew" ref="dialog" @hide="onDialogHide" persistent>
          <q-card style="min-width: 300px" class="shadow-3 bg-white">
            <q-card-section>
              <div class="text-h6 text-center q-pa-md">{{$t('createnew', { item: $t('permission') })}}</div>
              <div class="row justify-between q-col-gutter-md" >
                <div class="col-12 col-sm-6">
                  <q-input outlined v-model="permissionForm.permissionID" ref="permissionID" :label="$t('permissionID')"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input outlined v-model="permissionForm.displayName" ref="displayName" :label="$t('displayName')"/>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input outlined v-model="permissionForm.description" ref="description" :label="$t('description')"/>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn flat label="Add Permission" @click="onSubmit"/>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </template>
  </q-page>
</template>

<script>

import { api } from 'src/boot/api'

export default {
  name: 'Permissions',
  data () {
    return {
      createNew: false,
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'permissionID',
        descending: false,
        page: 0,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      columns: [
        { name: 'permissionID', align: 'center', label: 'permissionID', field: 'permissionID', sortable: true },
        { name: 'displayName', align: 'center', label: 'displayName', field: 'displayName', sortable: true },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'buttons', label: '', field: 'buttons' }
      ],
      permissionList: [],
      permissionForm: {
        permissionID: '',
        displayName: '',
        description: ''
      }
    }
  },
  mounted () {
    // get initial accountList from server (1st page)
    this.getPermissionList({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    handleSort (col) {
      if (this.pagination.sortBy === col.name) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = col.name
        this.pagination.descending = false
      }
      this.getPermissionList({
        pagination: this.pagination,
        filter: this.filter
      })
    },

    show () {
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide () {
      this.$refs.dialog.hide()
    },
    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },
    async onSubmit () {
      const params = {
        data: this.permissionForm
      }
      try {
        let res = await api.createPermission(params)
        console.log(res)
        const permission = {
          permissionID: res.data.permission.permissionID,
          displayName: res.data.permission.displayName,
          description: res.data.permission.description
        }
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: res.data.success
        })
        this.$emit('ok')
        // or with payload: this.$emit('ok', { ... })

        // then hiding dialog
        this.hide()
        console.log(permission)
        this.permissionList.push(permission)
        this.permissionForm = {
          permissionID: '',
          displayName: '',
          description: ''
        }
      } catch (error) {
        console.log(error)
      }
    },
    async updatePermission (val, initialValue, rowData, field) {
      const params = {
        conditions: {},
        data: rowData
      }
      if (field === 'permissionID') {
        params.conditions.permissionID = initialValue
      } else {
        params.conditions.permissionID = rowData.permissionID
      }
      try {
        let res = await api.updatePermission(params)

        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: res.data.success
        })
      } catch (error) {
      }
    },
    getPermissionList: async function (props) {
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
        params.conditions.permissionID = filter
      }

      // fetch accountList from "server"
      try {
        let res = await api.getPermissions(params)

        // clear out existing accountList and add new
        this.permissionList = res.data.permissions

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
    }
  }
}
</script>

<style>
</style>
