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
                @click="$router.push('/drivers')"
                :icon=" 'fas fa-arrow-left' "
              />
              <span>{{isNewPage ? 'New Driver' : 'Driver Detail'}}</span>
            </div>
            <!--<div class="items-center">-->
              <!--<q-btn  v-show="enableEdit>=2" class="bg-white text-primary shadow-3 q-btn&#45;&#45;push" @click="onSubmit()">-->
                <!--Save-->
              <!--</q-btn>-->
            <!--</div>-->
          </div>
        </template>
        <q-form
          @submit="onSubmit"
          rounded
          class="text-center q-gutter-y-md q-pa-md shadow-3 bg-white"
          ref="driverForm"
          :model="driverForm"
          style="width:100%; border-radius: 10px;"
        >
          <div class="row justify-between q-col-gutter-md" >
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="!(isNewPage && isAdmin)" v-model="driverForm.accountID"
                        :options="accountIDList"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="accountID" :label="$t('accountID')"
                        @input = "val => { getDriverDevices(val) }"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input :rules="[val => !!val || 'DriverID is required']" outlined :disable="!isNewPage" v-model="driverForm.driverID" ref="driverID" label="Driver ID" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="driverForm.displayName" ref="displayName" label="Driver Name"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="driverForm.description" ref="description" label="Nick Name"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="driverForm.contactPhone" ref="contactPhone" label="Contact Phone"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="driverForm.contactEmail" ref="contactEmail" label="Contact Email"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="driverForm.badgeID" ref="badgeID" label="Badge ID"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="driverForm.licenseType" ref="licenseType" label="License Type"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="driverForm.licenseNumber" ref="licenseNumber" label="License Number"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="licenseExpire" mask="date" label="License Expiration">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="licenseExpire" transition-show="scale" transition-hide="scale">
                      <q-date v-model="licenseExpire" @input="() => $refs.licenseExpire.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="driverForm.address" ref="address" label="Address"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit<2" v-model="driverForm.deviceID"
                        :options="filteredOptions1"
                        :option-value="opt => opt === null ? null : opt.deviceID"
                        :option-label="opt => opt === null ? '- Null -' : (opt.description ? opt.description : opt.deviceID) + '  [' + opt.deviceID + ']'"
                        emit-value
                        map-options
                        use-input
                        hide-selected
                        fill-input
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        input-debounce="0"
                        @filter="filterDeviceID1"
                        label="Vehicle ID"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!--<div class="q-pa-md">-->
            <!--<q-btn v-show="enableEdit>=2"  :label="isNewPage ? 'Add New Driver' : 'Update Driver'" type="submit" color="primary" class="q-btn&#45;&#45;push" style="width:200px; height:50px;"/>-->
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
import { LocalStorage } from 'quasar'
import { permissionChecker } from 'src/boot/checkPermission'

export default {
  name: 'Detail',
  data: function () {
    return {
      isNewPage: true,
      groupOptions: [''],
      filteredOptions1: [''],
      driverForm: {
        accountID: '',
        driverID: '',
        contactPhone: '',
        contactEmail: '',
        licenseType: '',
        licenseNumber: '',
        licenseExpire: 0,
        badgeID: '',
        address: '',
        birthdate: '',
        deviceID: null,
        displayName: '',
        description: '',
        notes: '',
        driverStatus: '',
        dutyStatus: ''
      },
      licenseExpire: '',
      birthdate: '',
      currentAccountID: '',
      currentDriverID: '',
      enableEdit: 2,
      accountIDList: [],
      permissions: [],
      userLevel: 'account'
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.driverForm.accountID = LocalStorage.getItem('accountID')
    this.permissions = LocalStorage.getItem('permissions')
    // check this is create page or update existing vehicle page
    this.isNew()
    if (!this.isNewPage) {
      this.getDriverByID()
    } else {
      this.licenseExpire = this.setCurDate(new Date())
      this.driverForm.licenseExpire = this.licenseExpire
      this.birthdate = this.setCurDate(new Date())
      this.driverForm.birthdate = this.birthdate
    }
    // get initial vehicleList from server (1st page)
    this.getAccountIDList()
    this.getDriverDevices(this.driverForm.accountID)
  },
  mounted () {
    if (this.userLevel === 'user') {
      this.enableEdit = permissionChecker.checkDriverAdmin(this.permissions)
    }
  },
  methods: {
    isNew () {
      if (this.$router.currentRoute.params.id !== null && this.$router.currentRoute.params.id !== undefined && this.$router.currentRoute.params.id !== '') {
        this.isNewPage = false
        this.currentAccountID = this.$router.currentRoute.params.accountID
        this.currentDriverID = this.$router.currentRoute.params.id
      } else {
        this.isNewPage = true
        this.currentDriverID = ''
      }
    },
    isAdmin () {
      return this.userLevel === 'admin'
    },
    setCurDate (curDate) {
      let curdate = curDate
      curdate = curdate.getFullYear() + '/' + (this.appendLeadingZeroes(curdate.getMonth() + 1)) + '/' + curdate.getDate()
      return curdate
    },
    appendLeadingZeroes (n) {
      if (n <= 9) {
        return '0' + n
      }
      return n
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
    getDriverByID: async function () {
      const params = {
        conditions: {
          accountID: this.currentAccountID,
          driverID: this.currentDriverID
        }
      }

      try {
        let res = await api.getDriverByID(params)
        this.driverForm = res.data.driver

        this.licenseExpire = this.driverForm.licenseExpire !== 0 ? this.setCurDate(new Date(1000 * this.driverForm.licenseExpire)) : this.setCurDate(new Date())
        this.birthdate = this.driverForm.birthdate !== 0 ? this.setCurDate(new Date(1000 * this.driverForm.birthdate)) : this.setCurDate(new Date())
        this.driverForm.licenseExpire = this.licenseExpire
        this.driverForm.birthdate = this.birthdate
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/drivers')
      }
    },

    async onSubmit () {
      this.driverForm.licenseExpire = Math.round(Number(new Date(this.licenseExpire)) / 1000)
      this.driverForm.birthdate = Math.round(Number(new Date(this.birthdate)) / 1000)

      if (this.isNewPage) {
        this.driverForm.accountID = LocalStorage.getItem('accountID')
        const params = {
          data: this.driverForm
        }
        try {
          let res = await api.createDriver(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.driverForm.driverID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/drivers')
        } catch (e) {
          this.$router.push('/drivers')
        }
      } else {
        const params = {
          conditions: {
            accountID: this.currentAccountID,
            driverID: this.currentDriverID
          },
          data: this.driverForm
        }
        try {
          let res = await api.updateDriver(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.currentDriverID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/drivers')
        } catch (e) {
          this.$router.push('/drivers')
        }
      }
    },
    // Filter group id
    filterDeviceID1 (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.filteredOptions1 = this.groupOptions.filter(function (el) {
          if (el.deviceID && ((el.description ? el.description : el.deviceID) + '  [' + el.deviceID + ']').toLowerCase().indexOf(needle) > -1) {
            return el
          }
        })
      })
    },
    async getDriverDevices (accountID) {
      const params = {
        conditions: {
          accountID: accountID
        }
      }

      // fetch vehicleList from "server"
      try {
        let res = await api.getDriverDevices(params)
        // clear out existing vehicleList and add new
        this.groupOptions = res.data.vehicles
        this.filteredOptions1 = res.data.vehicles
        this.driverForm.deviceID = null
      } catch (e) {
        this.filteredOptions1 = []
        this.groupOptions = []
      }
    }
  }
}
</script>

<style>
</style>
