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
                :disable="enableEdit < 2"
                class="bg-white text-primary shadow-3 q-btn--push q-mr-md"
                rounded
                @click="$router.push('/users')"
                :icon=" 'fas fa-arrow-left' "
              />
              <span>{{isNewPage ? $t('newitem', { item: $t('user') }) : $t('itemdetail', { item: $t('user') }) }}</span>
            </div>
            <!--<div class="items-center">-->
              <!--<q-btn  v-show="enableEdit>=2" class="bg-white text-primary shadow-3 q-btn&#45;&#45;push" @click="onSubmit()">-->
                <!--{{$t('save')}}-->
              <!--</q-btn>-->
            <!--</div>-->
          </div>
        </template>
        <q-form
          @submit="onSubmit"
          rounded
          class="text-center q-gutter-y-md q-pa-md shadow-3 bg-white"
          ref="userForm"
          :model="userForm"
          style="width:100%; border-radius: 10px;"
        >
          <div class="row justify-between q-col-gutter-md" >
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="!(isNewPage && isAdmin)" v-model="userForm.accountID"
                        :options="accountIDList"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="accountID" :label="$t('accountID')"
                        @input = "val => {
                          getVehicleList(val)
                          getGroupList(val)
                         }"
                        @blur="$v.userForm.accountID.$touch"
                        :error="$v.userForm.accountID.$error"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                outlined
                :disable="!isNewPage"
                v-model="userForm.userID"
                ref="userID"
                :label="$t('userID')"
                @blur="$v.userForm.userID.$touch"
                :error="$v.userForm.userID.$error"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit < 2" v-model="userForm.description" ref="description" :label="$t('description')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit < 2"
                       v-model="userForm.password"
                       ref="password" :label="$t('password')"
                       :error="$v.userForm.password.$error"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit < 2" v-model="userForm.contactName" ref="contactName" :label="$t('contactName')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit < 2" v-model="userForm.contactPhone" ref="contactPhone" :label="$t('contactPhone')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit < 2" v-model="userForm.contactEmail" ref="contactEmail" :label="$t('contactEmail')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit < 2" v-model="userForm.notifyEmail" ref="notifyEmail" :label="$t('notifyEmail')"/>
            </div>
            <div class="col-12 col-sm-6">
              <!--<q-input outlined v-model="vehicleForm.licenseExpire" ref="licenseExpire" label="License Expiration"/>-->
              <q-select outlined :disable="enableEdit < 2" v-model="userForm.timeZone"
                        :options="timeZoneList"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="timeZone" :label="$t('timeZone')"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit < 2 || (enableEdit >= 2 && groupEdit < 2)" v-model="userForm.groupID"
                        :options="groupList"
                        :option-value="opt => opt === null ? null : opt.groupID"
                        :option-label="opt => opt === null ? '- Null -' : opt.groupID"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="groupID" :label="$t('groupID')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit < 2" v-model="userForm.firstLoginPageID"
                        :options="firstPageList"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="firstLoginPageID" :label="$t('firstLoginPageID')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit < 2" v-model="userForm.preferredDeviceID"
                        :options="vehicleList"
                        :option-value="opt => opt === null ? null : opt.deviceID"
                        :option-label="opt => opt === null ? '- Null -' : opt.deviceID"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="preferredDeviceID" :label="$t('preferredDeviceID')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit < 2" v-model="userForm.maxAccessLevel" ref="maxAccessLevel" :label="$t('maxAccessLevel')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit < 2 || (enableEdit >= 2 && roleEdit < 2)" v-model="userForm.newRole"
                        :options="roleList"
                        :option-value="opt => opt === null ? null : opt.roleID"
                        :option-label="opt => opt === null ? '- Null -' : opt.displayName"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="newRole" :label="$t('newRole')"
                        :error="$v.userForm.newRole.$error"
              />
            </div>
          </div>

          <!--<div class="q-pa-md">-->
            <!--<q-btn :label="isNewPage ? 'Add New Account' : 'Update Account'"  v-show="enableEdit>=2" type="submit" color="primary" class="q-btn&#45;&#45;push" style="width:200px; height:50px;"/>-->
          <!--</div>-->
          <q-page-sticky position="bottom-right" :offset="[108, 18]">
            <q-btn fab icon="save" color="accent" type="submit" />
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
      accountIDList: [],
      groupList: [],
      roleList: [],
      vehicleList: [],
      timeZoneList: [
        { value: 'US/Hawaii', desc: 'US/Hawaii' },
        { value: 'US/Alaska', desc: 'US/Alaska' },
        { value: 'US/Pacific', desc: 'US/Pacific' },
        { value: 'US/Arizona', desc: 'US/Arizona' },
        { value: 'US/Mountain', desc: 'US/Mountain' },
        { value: 'US/Central', desc: 'US/Central' },
        { value: 'US/Eastern', desc: 'US/Eastern' },
        { value: 'Canada/Pacific', desc: 'Canada/Pacific' },
        { value: 'Canada/Mountain', desc: 'Canada/Mountain' },
        { value: 'Canada/Central', desc: 'Canada/Central' },
        { value: 'Canada/Eastern', desc: 'Canada/Eastern' },
        { value: 'Canada/Atlantic', desc: 'Canada/Atlantic' },
        { value: 'Mexico/BajaNorte', desc: 'Mexico/BajaNorte' },
        { value: 'Mexico/BajaSur', desc: 'Mexico/BajaSur' },
        { value: 'Mexico/General', desc: 'Mexico/General' },
        { value: 'Europe/Athens', desc: 'Europe/Athens' },
        { value: 'Europe/Berlin', desc: 'Europe/Berlin' },
        { value: 'Europe/Dublin', desc: 'Europe/Dublin' },
        { value: 'Europe/Helsinki', desc: 'Europe/Helsinki' },
        { value: 'Europe/Kiev', desc: 'Europe/Kiev' },
        { value: 'Europe/Lisbon', desc: 'Europe/Lisbon' },
        { value: 'Europe/London', desc: 'Europe/London' },
        { value: 'Europe/Madrid', desc: 'Europe/Madrid' },
        { value: 'Europe/Moscow', desc: 'Europe/Moscow' },
        { value: 'Europe/Oslo', desc: 'Europe/Oslo' },
        { value: 'Europe/Paris', desc: 'Europe/Paris' },
        { value: 'Europe/Rome', desc: 'Europe/Rome' },
        { value: 'Europe/Stockholm', desc: 'Europe/Stockholm' },
        { value: 'Europe/Zurich', desc: 'Europe/Zurich' },
        { value: 'Pacific/Auckland', desc: 'Pacific/Auckland' },
        { value: 'Pacific/Chatham', desc: 'Pacific/Chatham' },
        { value: 'GMT', desc: 'GMT' },
        { value: 'GMT+00:00', desc: 'GMT+00:00' },
        { value: 'GMT+01:00', desc: 'GMT+01:00' },
        { value: 'GMT+02:00', desc: 'GMT+02:00' },
        { value: 'GMT+03:00', desc: 'GMT+03:00' },
        { value: 'GMT+04:00', desc: 'GMT+04:00' },
        { value: 'GMT+05:00', desc: 'GMT+05:00' },
        { value: 'GMT+05:30', desc: 'GMT+05:30' },
        { value: 'GMT+06:00', desc: 'GMT+06:00' },
        { value: 'GMT+07:00', desc: 'GMT+07:00' },
        { value: 'GMT+08:00', desc: 'GMT+08:00' },
        { value: 'GMT+09:00', desc: 'GMT+09:00' },
        { value: 'GMT+10:00', desc: 'GMT+10:00' },
        { value: 'GMT+11:00', desc: 'GMT+11:00' },
        { value: 'GMT+12:00', desc: 'GMT+12:00' },
        { value: 'GMT+13:00', desc: 'GMT+13:00' },
        { value: 'GMT+14:00', desc: 'GMT+14:00' },
        { value: 'GMT-01:00', desc: 'GMT-01:00' },
        { value: 'GMT-02:00', desc: 'GMT-02:00' },
        { value: 'GMT-03:00', desc: 'GMT-03:00' },
        { value: 'GMT-04:00', desc: 'GMT-04:00' },
        { value: 'GMT-05:00', desc: 'GMT-05:00' },
        { value: 'GMT-06:00', desc: 'GMT-06:00' },
        { value: 'GMT-07:00', desc: 'GMT-07:00' },
        { value: 'GMT-08:00', desc: 'GMT-08:00' },
        { value: 'GMT-09:00', desc: 'GMT-09:00' },
        { value: 'GMT-10:00', desc: 'GMT-10:00' },
        { value: 'GMT-11:00', desc: 'GMT-11:00' },
        { value: 'GMT-12:00', desc: 'GMT-12:00' }
      ],
      firstPageList: [
        'Device Map',
        'Fleet Map',
        'Detail Reports',
        'Fleet Reports'
      ],
      userForm: {
        accountID: '',
        userID: '',
        userType: '0',
        description: '',
        password: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        notifyEmail: '',
        timeZone: '',
        groupID: '',
        firstLoginPageID: '',
        preferredDeviceID: '',
        maxAccessLevel: 0,
        newRole: ''
      },
      currentAccountID: '',
      currentUserID: '',
      enableEdit: 2,
      roleEdit: 2,
      groupEdit: 2,
      permissions: [],
      userLevel: 'account'
    }
  },
  validations: {
    userForm: {
      accountID: { required },
      userID: { required },
      password: { required },
      newRole: { required }
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.userForm.accountID = LocalStorage.getItem('accountID')
    this.permissions = LocalStorage.getItem('permissions')

    this.getAccountIDList()
    this.getGroupList(this.userForm.accountID)
    this.getVehicleList(this.userForm.accountID)
    this.getRoleList()

    this.isNew()
    if (!this.isNewPage) {
      this.getUserByID()
    }
  },
  async mounted () {
    // get initial vehicleList from server (1st page)
    if (LocalStorage.getItem('userLevel') === 'user') {
      this.enableEdit = permissionChecker.checkProfileAuthorized(LocalStorage.getItem('permissions'))
      this.roleEdit = permissionChecker.checkUserRoleEditable(LocalStorage.getItem('permissions'))
      this.groupEdit = permissionChecker.checkUserGroupEditable(LocalStorage.getItem('permissions'))
    }
  },
  methods: {
    isNew () {
      if (this.$router.currentRoute.params.id !== null && this.$router.currentRoute.params.id !== undefined && this.$router.currentRoute.params.id !== '') {
        this.isNewPage = false
        this.currentAccountID = this.$router.currentRoute.params.accountID
        this.currentUserID = this.$router.currentRoute.params.id
      } else {
        this.isNewPage = true
        this.currentUserID = ''
      }
    },
    isAdmin () {
      return this.userLevel === 'admin'
    },
    async getUserByID () {
      const params = {
        conditions: {
          accountID: this.currentAccountID,
          userID: this.currentUserID
        }
      }

      try {
        let res = await api.getUserByID(params)
        this.userForm = res.data.user
        this.userForm.groupID = res.data.group
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/users')
      }
    },
    async getAccountIDList () {
      try {
        let res = await api.getAllAccountIDs()
        this.accountIDList = res.data.accountList.map(item => item.accountID)
        this.loading = false
      } catch (error) {
        this.$router.push('/users')
      }
    },
    async getGroupList (accountID) {
      const params = {
        conditions: {
          accountID: accountID
        }
      }

      try {
        let res = await api.getVehicleGroupsByAccount(params)
        this.groupList = res.data.groupList
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/users')
      }
    },
    async getVehicleList (accountID) {
      const params = {
        conditions: {
          accountID: accountID
        }
      }

      try {
        let res = await api.getVehiclesByAccount(params)
        this.vehicleList = res.data.vehicleList
        this.loading = false
      } catch (e) {
        this.$router.push('/users')
      }
    },
    async getRoleList () {
      try {
        let res = await api.getRolesForUser()
        this.roleList = res.data.roleList
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/users')
      }
    },
    async onSubmit () {
      this.$v.userForm.$touch()
      if (this.$v.userForm.$error) {
        Notify.create({
          message: 'Please review fields again.'
        })
        console.log(this.$v.userForm.$error)
        return
      }

      if (this.isNewPage) {
        const params = {
          data: this.userForm
        }
        try {
          let res = await api.createUser(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.userForm.userID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/users')
          // clear out existing vehicleGroupList and add new
        } catch (e) {
          this.$router.push('/users')
        }
      } else {
        const params = {
          conditions: {
            accountID: this.currentAccountID,
            userID: this.currentUserID
          },
          data: this.userForm
        }
        try {
          let res = await api.updateUser(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.currentUserID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/users')
          // clear out existing vehicleGroupList and add new
        } catch (e) {
          this.$router.push('/users')
        }
      }
    }
  }
}
</script>

<style>
</style>
