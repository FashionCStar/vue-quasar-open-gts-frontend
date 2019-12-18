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
                @click="$router.push('/accounts')"
                :icon=" 'fas fa-arrow-left' "
              />
              <span>{{isNewPage ? $t('newitem', { item: $t('account') }) : $t('itemdetail', { item: $t('account') }) }}</span>
            </div>
            <!--<div class="items-center">-->
              <!--<q-btn class="bg-white text-primary shadow-3 q-btn&#45;&#45;push" @click="onSubmit()">-->
                <!--{{$t('save')}}-->
              <!--</q-btn>-->
            <!--</div>-->
          </div>
        </template>
        <q-form
          @submit="onSubmit"
          rounded
          class="text-center q-gutter-y-md q-pa-md shadow-3 bg-white"
          ref="accountForm"
          :model="accountForm"
          style="width:100%; border-radius: 10px;"
        >
          <div class="row justify-between q-col-gutter-md" >
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="!isNewPage"
                       v-model="accountForm.accountID"
                       ref="accountID"
                       :label="$t('accountID')"
                       :rules="[val => !!val || 'AccountID is required']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.description" ref="description" :label="$t('description')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.password"
                       ref="password"
                       :label="$t('password')"
                       :rules="[val => !!val || 'Password is required']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.contactName" ref="contactName" :label="$t('contactName')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.contactPhone" ref="contactPhone" :label="$t('contactPhone')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.contactEmail" ref="contactEmail" :label="$t('contactEmail')"/>
            </div>
            <div class="col-12 col-sm-6">
              <!--<q-input outlined v-model="vehicleForm.licenseExpire" ref="licenseExpire" label="License Expiration"/>-->
              <q-select outlined v-model="accountForm.timeZone"
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
              <q-input outlined v-model="accountForm.maximumDevices" ref="maximumDevices" :label="$t('maximumDevices')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.maxPingCount" ref="maxPingCount" :label="$t('maxPingCount')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.totalPingCount" ref="totalPingCount" :label="$t('totalPingCount')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.isAccountManager" ref="isAccountManager" :label="$t('isAccountManager')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.managerID" ref="managerID" :label="$t('managerID')"/>
            </div>
            <div class="col-12 col-sm-6">
              <!--<q-input outlined v-model="accountForm.privateLabelName" ref="privateLabelName" :label="$t('privateLabelName')"/>-->
              <q-select outlined v-model="accountForm.privateLabelName"
                        :options="privateLabelNameList"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="privateLabelName" :label="$t('privateLabelName')"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined v-model="accountForm.geocoderMode"
                        :options="geocoderModeList"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="geocoderMode" :label="$t('geocoderMode')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.dcsPropertiesID"
                       ref="dcsPropertiesID" :label="$t('dcsPropertiesID')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined v-model="accountForm.smsEnabled"
                        :options="allowOptions"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="smsEnabled" :label="$t('smsEnabled')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.smsProperties" ref="smsProperties" :label="$t('smsProperties')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined v-model="accountForm.allowWebService"
                        :options="allowOptions"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="allowWebService" :label="$t('allowWebService')"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="accountForm.notes"
                       ref="notes" :label="$t('notes')"/>
            </div>
          </div>

          <!--<div class="q-pa-md">-->
            <!--<q-btn :label="isNewPage ? 'Add New Account' : 'Update Account'" type="submit" color="primary" class="q-btn&#45;&#45;push" style="width:200px; height:50px;"/>-->
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

export default {
  name: 'Detail',
  data: function () {
    return {
      isNewPage: true,
      allowOptions: [
        {
          value: 0, desc: 'No'
        },
        {
          value: 1, desc: 'Yes'
        }
      ],
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
      privateLabelNameList: [
        { value: '*', desc: '*' },
        { value: 'mobile', desc: 'mobile' },
        { value: 'tablet', desc: 'tablet' },
        { value: 'default', desc: 'default' }
      ],
      geocoderModeList: [
        { value: '0', desc: 'none' },
        { value: '1', desc: 'geozone' },
        { value: '2', desc: 'partial' },
        { value: '3', desc: 'full' }
      ],
      accountForm: {
        accountID: '',
        description: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        timeZone: '',
        maximumDevices: '',
        maxPingCount: '',
        totalPingCount: '',
        isAccountManager: '',
        managerID: '',
        privateLabelName: '',
        geocoderMode: 0,
        dcsPropertiesID: '',
        smsEnabled: '',
        smsProperties: '',
        allowWebService: '',
        notes: '',
        password: ''
      },
      currentAccountID: ''
    }
  },
  created () {
    // check this is create page or update existing vehicle page
    this.isNew()
    if (!this.isNewPage) {
      this.getAccountByID()
    }
    // get initial vehicleList from server (1st page)
  },
  methods: {
    isNew () {
      if (this.$router.currentRoute.params.id !== null && this.$router.currentRoute.params.id !== undefined && this.$router.currentRoute.params.id !== '') {
        this.isNewPage = false
        this.currentAccountID = this.$router.currentRoute.params.id
      } else {
        this.isNewPage = true
        this.currentAccountID = ''
      }
    },
    async getAccountByID () {
      const params = {
        conditions: {
          accountID: this.currentAccountID
        }
      }

      try {
        let res = await api.getAccountByID(params)
        this.accountForm = res.data.account
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/accounts')
      }
    },
    async onSubmit () {
      if (this.currentAccountID !== '') {
        this.accountForm.accountID = this.currentAccountID
      }

      if (this.isNewPage) {
        const params = {
          data: this.accountForm
        }
        try {
          let res = await api.createAccount(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.accountForm.accountID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/accounts')
          // clear out existing vehicleGroupList and add new
        } catch (e) {
          this.$router.push('/accounts')
        }
      } else {
        const params = {
          conditions: {
            accountID: this.currentAccountID
          },
          data: this.accountForm
        }
        try {
          let res = await api.updateAccount(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.currentAccountID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/accounts')
          // clear out existing vehicleGroupList and add new
        } catch (e) {
          this.$router.push('/accounts')
        }
      }
    }
  }
}
</script>

<style>
</style>
