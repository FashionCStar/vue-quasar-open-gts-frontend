<template>
  <q-page padding>
    <!-- content -->
    <template>
      <div class="q-pa-md">
        <q-table
          title="Rules"
          :data="ruleList"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getRuleList"
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
                {{$t('createnew', { item: $t('rule') })}}
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :align="col.align" :props="col.props" v-for="(col, index) in props.cols" :key="index" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.accountID, props.row.ruleID)">
              <q-td key="accountID" :props="props" v-show="isAdmin">{{ props.row.accountID }}</q-td>
              <q-td key="ruleID" :props="props"> {{ props.row.ruleID }} </q-td>
              <q-td key="description" :props="props"> {{ props.row.description }} </q-td>
              <q-td key="selector" :props="props"> {{ props.row.selector }} </q-td>
              <q-td key="cronRule" :props="props"> {{ cronRules[props.row.isCronRule] }} </q-td>
              <q-td key="buttons" :props="props">
                <q-btn  v-show="enableEdit >= 2"
                        :icon="props.row.isActive ? 'fas fa-check-circle' : 'fas fa-ban' "
                        size="sm"
                        :color="props.row.isActive ? 'teal' : 'red' "
                        round glossy
                        class="q-ml-sm"
                        @click.native.stop
                        @click="activateRule(props.row)"
                />
                <q-btn v-show="enableEdit >= 3"
                  icon="fas fa-trash-alt"
                  round glossy
                  size="sm"
                  color="black"
                  class="q-ml-sm"
                  @click.native.stop
                  @click="removeRule(props.row.roleID)"
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
  name: 'Roles',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'ruleID',
        descending: false,
        page: 0,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      columns: [
        { name: 'accountID', required: true, align: 'center', label: 'accountID', field: 'accountID', sortable: true },
        { name: 'ruleID', align: 'center', label: 'ruleID', field: 'ruleID', sortable: true },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'selector', align: 'center', label: 'selector', field: 'selector' },
        { name: 'cronRule', align: 'center', label: 'cronRule', field: 'isCronRule' },
        { name: 'buttons', label: '', field: 'buttons' }
      ],
      cronRules: [ 'No', 'Yes', '30 Minute', 'Hourly', 'Daily', 'Weekly' ],
      enableEdit: 3,
      roleInfo: null,
      ruleList: [],
      roleForm: {
        roleID: '',
        displayName: ''
      }
    }
  },
  mounted () {
    if (LocalStorage.getItem('userLevel') === 'user') {
      this.enableEdit = permissionChecker.checkRuleAdmin(LocalStorage.getItem('permissions'))
    }
    // get initial accountList from server (1st page)
    this.getRuleList({
      pagination: this.pagination,
      filter: undefined
    })
  },
  methods: {
    isAdmin () {
      return LocalStorage.getItem('userLevel') === 'admin'
    },
    createNew () {
      this.$router.push('/rules/create')
    },
    goToDetail (accountID, roleID) {
      if (this.enableEdit >= 2) {
        this.$router.push({ name: 'Update Rule', params: { accountID: accountID, id: roleID } })
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
        this.getRuleList({
          pagination: this.pagination,
          filter: this.filter
        })
      }
    },

    getRuleList: async function (props) {
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
        let res = await api.getRules(params)

        // clear out existing accountList and add new
        this.ruleList = res.data.rules

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

    async activateRule (ruleInfo) {
      const params = {
        conditions: {
          accountID: ruleInfo.accountID,
          deviceID: ruleInfo.ruleID
        },
        isActive: !ruleInfo.isActive
      }
      try {
        let res = await api.activeVehicle(params)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: ruleInfo.ruleID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
        ruleInfo.isActive = !ruleInfo.isActive
      } catch (e) {
      }
    },

    removeRule: function (roleID) {
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
          let res = await api.removeRule(params)
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
    }
  }
}
</script>

<style>
</style>
