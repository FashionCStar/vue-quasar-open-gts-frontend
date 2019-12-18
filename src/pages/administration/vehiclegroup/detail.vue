<template>
  <q-page>
    <!-- content -->

    <div class="bg-primary" style="width: 100%; height: 200px; position: absolute">
    </div>
    <template>
      <div class="q-pa-md">
        <template>
          <div class="row items-center justify-between text-white" style="height: 150px; position: relative">
            <div class="items-center" style="font-size: 20px;">
              <q-btn
                class="bg-white text-primary shadow-3 q-btn--push q-mr-md"
                rounded
                @click="$router.push('/groups')"
                :icon=" 'fas fa-arrow-left' "
              />
              <span>{{isNewPage ? 'New Group' : 'Group Detail'}}</span>
            </div>
            <!--<div class="items-center">-->
              <!--<q-btn v-show="enableEdit>=2" class="bg-white text-primary shadow-3 q-btn&#45;&#45;push" @click="onSubmit()">-->
                <!--Save-->
              <!--</q-btn>-->
            <!--</div>-->
          </div>
        </template>
        <q-form
          @submit="onSubmit"
          rounded
          class="text-center q-gutter-y-md q-pa-md shadow-3 bg-white"
          ref="groupForm"
          :model="groupForm"
          style="width:100%; border-radius: 10px;"
        >
          <div class="row justify-between q-col-gutter-md" >
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="!(isNewPage && isAdmin)" v-model="groupForm.group.accountID"
                        :options="accountIDList"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="accountID" :label="$t('accountID')"
                        @input="val => { getVehicles(val) }"
                        @blur="$v.groupForm.group.accountID.$touch"
                        :error="$v.groupForm.group.accountID.$error"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                :rules="[val => !!val || 'GroupID is required']"
                outlined :disable="!isNewPage"
                v-model="groupForm.group.groupID"
                ref="groupID" label="Group ID"
                @blur="$v.groupForm.group.groupID.$touch"
                :error="$v.groupForm.group.groupID.$error"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="groupForm.group.displayName" ref="displayName" label="Group Name"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="groupForm.group.description" ref="description" label="Description"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit<2" v-model="groupForm.devices" multiple
                        :options="vehicleOptions"
                        :option-value="opt => opt === null ? null : opt.deviceID"
                        :option-label="opt => opt === null ? '- Null -' : (opt.description ? opt.description : opt.deviceID) + '  [' + opt.deviceID + ']'"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        :label="$t('vehicles')"
              />
            </div>
            <div class="col-12 col-sm-6">
            </div>
          </div>
          <div class="q-pa-md" v-show="!isNewPage">
            <q-table
              title="Vehicle in Group"
              :data="groupForm.devices"
              :columns="columns"
              row-key="name"
              binary-state-sort
            >
              <template v-slot:body="props">
                <q-tr :props="props" @click.native="goToVehicleDetail(props.row.accountID, props.row.deviceID)">
                  <q-td key="deviceID" :props="props">{{ props.row.deviceID }}</q-td>
                  <q-td key="uniqueID" :props="props">{{ props.row.uniqueID }}</q-td>
                  <q-td key="displayName" :props="props">{{ props.row.displayName }}</q-td>
                  <q-td key="description" :props="props">{{ props.row.description }}</q-td>
                  <q-td key="equipmentType" :props="props">{{ props.row.equipmentType }}</q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
          <!--<div class="q-pa-md">-->
            <!--<q-btn v-show="enableEdit>=2" :label="isNewPage ? 'Add New Group' : 'Update Group'" type="submit" color="primary" class="q-btn&#45;&#45;push" style="width:200px; height:50px;"/>-->
          <!--</div>-->

          <q-page-sticky position="bottom-right" :offset="[108, 18]">
            <q-btn v-show="enableEdit>=2" fab icon="save" color="accent" type="submit" />
          </q-page-sticky>
        </q-form>
      </div>
    </template>
    <!-- place QPageScroller at end of page -->
    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="accent" />
    </q-page-scroller>
  </q-page>
</template>

<script>

import { api } from 'src/boot/api'
import { LocalStorage, Notify } from 'quasar'
import { permissionChecker } from 'src/boot/checkPermission'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'Detail',
  data: function () {
    return {
      isNewPage: true,
      groupForm: {
        group: {
          accountID: '',
          groupID: '',
          displayName: '',
          description: ''
        },
        devices: []
      },
      columns: [
        {
          name: 'deviceID',
          required: true,
          label: 'Device ID',
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'uniqueID', align: 'center', label: 'Unique ID', field: 'uniqueID', sortable: true },
        { name: 'displayName', align: 'center', label: 'Device Name', field: 'displayName' },
        { name: 'description', align: 'center', label: 'Description', field: 'description', sortable: true },
        { name: 'equipmentType', align: 'center', label: 'Equipment Type', field: 'equipmentType', sortable: true }
      ],
      currentAccountID: '',
      currentGroupID: '',
      enableEdit: 2,
      vehicleList: [],
      vehicleOptions: [''],

      userLevel: 'account',
      accountIDList: []
    }
  },
  validations: {
    groupForm: {
      group: {
        accountID: { required },
        groupID: { required }
      }
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.groupForm.group.accountID = LocalStorage.getItem('accountID')
    this.getAccountIDList()
    this.getVehicles(this.groupForm.group.accountID)
  },
  mounted () {
    if (this.userLevel === 'user') {
      this.enableEdit = permissionChecker.checkGroupAdmin(LocalStorage.getItem('permissions'))
    }
    this.isNew()
    if (!this.isNewPage) {
      this.getGroupByID()
    }
  },
  methods: {
    isNew () {
      if (this.$router.currentRoute.params.id !== null && this.$router.currentRoute.params.id !== undefined && this.$router.currentRoute.params.id !== '') {
        this.isNewPage = false
        this.currentAccountID = this.$router.currentRoute.params.accountID
        this.currentGroupID = this.$router.currentRoute.params.id
      } else {
        this.isNewPage = true
      }
    },
    isAdmin () {
      return this.userLevel === 'admin'
    },

    async getAccountIDList () {
      try {
        let res = await api.getAllAccountIDs()
        this.accountIDList = res.data.accountList.map(item => item.accountID)
        this.loading = false
      } catch (error) {
        this.$router.push('/groups')
      }
    },
    async getGroupByID () {
      const params = {
        conditions: {
          accountID: this.currentAccountID,
          groupID: this.currentGroupID
        }
      }

      try {
        let res = await api.getDevicegroupById(params)
        this.groupForm = res.data.devicegroup
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          position: 'top',
          icon: 'fas fa-exclamation-triangle',
          message: 'Didnt get Group details'
        })
        this.$router.push('/groups')
      }
    },

    goToVehicleDetail (accountID, vehicleID) {
      if (this.enableEdit >= 1) {
        this.$router.push({ name: 'Update Vehicle', params: { accountID: accountID, id: vehicleID } })
      }
    },
    async getVehicles (accountID) {
      if (this.isNewPage) {
        this.groupForm.devices = []
      }
      const params = {
        conditions: {
          accountID: accountID
        }
      }

      try {
        let res = await api.getAllVehicles(params)
        // clear out existing vehicleGroupList and add new
        this.vehicleOptions = res.data.vehicles
      } catch (e) {
        this.vehicleOptions = []
      }
    },

    async onSubmit () {
      this.$v.groupForm.$touch()
      if (this.$v.groupForm.$error) {
        Notify.create({
          message: 'Please review fields again.'
        })
        console.log(this.$v.groupForm.$error)
        return
      }
      if (this.currentGroupID !== '') {
        this.groupForm.group.groupID = this.currentGroupID
      }

      this.groupForm.devices = this.groupForm.devices.map(device => ({
        accountID: device.accountID,
        groupID: this.groupForm.group.groupID,
        deviceID: device.deviceID,
        creationTime: parseInt(Date.now() / 1000),
        lastUpdateTime: parseInt(Date.now() / 1000)
      }))

      if (this.isNewPage) {
        const params = {
          data: this.groupForm
        }
        try {
          let res = await api.createDevicegroup(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.groupForm.group.groupID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/groups')
          // clear out existing vehicleGroupList and add new
        } catch (e) {
          this.$router.push('/groups')
        }
      } else {
        const params = {
          conditions: {
            accountID: this.currentAccountID,
            groupID: this.currentGroupID
          },
          data: this.groupForm
        }
        try {
          let res = await api.updateDevicegroup(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.currentGroupID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/groups')
          // clear out existing vehicleGroupList and add new
        } catch (e) {
          this.$q.notify({
            color: 'red-5',
            textColor: 'white',
            position: 'top',
            message: 'Group is not updated'
          })
          this.$router.push('/groups')
        }
      }
    }
  }
}
</script>

<style>
</style>
