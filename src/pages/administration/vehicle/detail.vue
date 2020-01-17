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
                @click="$router.push('/vehicles')"
                :icon=" 'fas fa-arrow-left' "
              />
              <span>{{isNewPage ? $t('newitem', { item: $t('vehicle') }) : $t('itemdetail', { item: $t('vehicle') }) }}</span>
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
          ref="vehicleForm"
          :model="vehicleForm"
          style="width:100%; border-radius: 10px;"
        >
          <div class="row justify-between q-col-gutter-md" >
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="!(isNewPage && isAdmin)" v-model="vehicleForm.accountID"
                        :options="accountIDList"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="accountID" :label="$t('accountID')"
                        @input = "val => {
                          getDevicegroups(val)
                         }"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="!isNewPage" v-model="vehicleForm.deviceID" ref="deviceID" label="Device ID"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2 || (enableEdit>=2 && uniqueIDEdit<2)" v-model="vehicleForm.uniqueID" ref="uniqueID" label="Unique ID"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.description" ref="description" label="Vehicle Description"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.displayName" ref="displayName" label="Short Name"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.vehicleID" ref="vehicleID" label="Vehicle ID"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.vehicleMake" ref="vehicleMake" label="Vehicle Make"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.vehicleModel" ref="vehicleModel" label="Vehicle Model"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.licensePlate" ref="licensePlate" label="License Plate"/>
            </div>
            <div class="col-12 col-sm-6">
              <!--<q-input outlined v-model="vehicleForm.licenseExpire" ref="licenseExpire" label="License Expiration"/>-->
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
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.equipmentType" ref="equipmentType" label="Equipment Type"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit<2 || (editEqipStatusEdit<2)" v-model="vehicleForm.equipmentStatus"
                        :options="equipmentStatusOptions"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="equipmentStatus" label="Equipment Status"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2 || (editImeiEdit<2)" v-model="vehicleForm.imeiNumber" ref="imeiNumber" label="IMEI/ESN Number"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2 || (editSerialEdit<2)" v-model="vehicleForm.serialNumber" ref="serialNumber" label="Serial Number"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2 || (editSimEdit<2)" v-model="vehicleForm.simPhoneNumber" ref="simPhoneNumber" label="Sim Phone#"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2 || (editSMSEdit<2)" v-model="vehicleForm.smsEmail" ref="smsEmail" label="SMS Email Address"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit<2" v-model="vehicleForm.pushpinID"
                        :options="pushPinList"
                        :option-value="opt => opt === null ? null : opt.name"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        options-dense
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="pushpinID" label="Group Pushpin ID">
                <template v-slot:option="scope">
                  <q-item
                          v-bind="scope.itemProps"
                          v-on="scope.itemEvents"
                  >
                    <q-item-section avatar>
                      <q-img style="height: 30px;"
                             :src="scope.opt.image"
                             contain
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.desc }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit<2" v-model="vehicleForm.displayColor"
                        :options="displayColorOptions"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="displayColor" label="Map Route Color"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit<2" v-model="vehicleForm.ignitionIndex"
                        :options="ignitionIndexOptions"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="ignitionIndex" label="Ignition Input"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.speedLimitKPH"
                       ref="speedLimitKPH" label="Maximum Speed"
                       mask="#.##" reverse-fill-mask input-class="text-right" suffix="KM/H"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.driverID" ref="driverID" label="Driver ID"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2 || (fuelCapacityEdit<2)" v-model="vehicleForm.fuelCapacity"
                       ref="fuelCapacity" label="Fuel Capacity per Liter"
                       mask="#.#" reverse-fill-mask input-class="text-right" suffix="Liter"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2 || (fuelProfileEdit<2)" v-model="vehicleForm.fuelTankProfile" ref="fuelTankProfile" label="Fuel Tank Profile"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2 || (fuelEconomyEdit<2)" v-model="vehicleForm.fuelEconomy"
                       ref="fuelEconomy" label="Fuel Economy"
                       mask="#.#" reverse-fill-mask input-class="text-right" suffix="KM/L"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.fuelCostPerLiter"
                       ref="fuelCostPerLiter" label="Fuel Cost"
                       mask="#.#" reverse-fill-mask input-class="text-right" suffix="USD/L"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.maintNotes" ref="maintNotes" label="Maintenance Notes" autogrow/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.maintIntervalKM0" ref="maintIntervalKM0" label="Last Maintenance #1"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.maintOdometerKM0" ref="maintOdometerKM0" label="Maintenance Interval #1"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.maintIntervalKM1" ref="maintIntervalKM1" label="Last Maintenance #2"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.maintOdometerKM1" ref="maintOdometerKM1" label="Maintenance Interval #2"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.maintIntervalHR0" ref="maintIntervalHR0" label="Last Eng Hours Maint"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.maintEngHoursHR0" ref="maintEngHoursHR0" label="Eng Hours Maint Interval"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.lastFaultCode" ref="lastFaultCode" label="Fault Codes"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit<2" v-model="vehicleForm.allowNotify"
                        :options="allowOptions"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="ignitionIndex" label="Notify Enable"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.notifyEmail"
                       ref="notifyEmail" label="Notify Email"
                       type="email"
              >
                <template v-slot:prepend>
                  <q-icon name="mail" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined :disable="enableEdit<2" v-model="vehicleForm.dcsPropertiesID" ref="dcsPropertiesID" label="DCS Properties ID"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="enableEdit<2" v-model="vehicleForm.groupID"
                        :options="filteredOptions1"
                        :option-value="opt => opt === null ? null : opt.groupID"
                        :option-label="opt => opt === null ? '- Null -' : (opt.description ? opt.description : opt.groupID) + '  [' + opt.groupID + ']'"
                        emit-value
                        map-options
                        use-input
                        hide-selected
                        fill-input
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        input-debounce="0"
                        @filter="filterGroupID1"
                        label="Preferred Group"
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
            <div class="col-12 col-sm-6">
              <q-select outlined v-model="groupList" multiple
                        :options="groupOptions"
                        :option-value="opt => opt === null ? null : opt.groupID"
                        :option-label="opt => opt === null ? '- Null -' : (opt.description ? opt.description : opt.groupID) + '  [' + opt.groupID + ']'"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        :label="$t('groupMembership')"
                        :disable="membershipEdit !== 1 || enableEdit < 2"
              />
            </div>
          </div>

          <!--<div class="q-pa-md">-->
            <!--<q-btn  v-show="enableEdit>=2" :label="isNewPage ? 'Add New Vehicle' : 'Update Vehicle'" type="submit" color="primary" class="q-btn&#45;&#45;push" style="width:200px; height:50px;"/>-->
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
import Util from 'src/boot/mapUtil'

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
      equipmentStatusOptions: [
        {
          value: '0', desc: '0'
        },
        {
          value: '', desc: 'Unspecified'
        },
        {
          value: 'inservice', desc: 'In Service'
        },
        {
          value: 'rented', desc: 'Rented'
        },
        {
          value: 'available', desc: 'Available'
        },
        {
          value: 'unavailable', desc: 'Unavailable'
        },
        {
          value: 'repair', desc: 'Repair'
        },
        {
          value: 'retired', desc: 'Retired'
        }
      ],
      displayColorOptions: [
        {
          value: '', desc: 'Default'
        },
        {
          value: '#000000', desc: 'Black'
        },
        {
          value: '#a52a2a', desc: 'Brown'
        },
        {
          value: '#dd0000', desc: 'Red'
        },
        {
          value: '#b37400', desc: 'Orange'
        },
        {
          value: '#008f00', desc: 'Green'
        },
        {
          value: '#0000ee', desc: 'Blue'
        },
        {
          value: '#9400d3', desc: 'Purple'
        },
        {
          value: '#505050', desc: 'Gray'
        },
        {
          value: '#00b3b3', desc: 'Cyan'
        },
        {
          value: '#ff1493', desc: 'Pink'
        }
      ],
      ignitionIndexOptions: [
        {
          value: 'n/a', desc: 'n/a'
        },
        {
          value: 'IgnitionOn/Off', desc: 'IgnitionOn/Off'
        },
        {
          value: 'Start/Stop', desc: 'Start/Stop'
        },
        {
          value: '0', desc: '0'
        },
        {
          value: '1', desc: '1'
        },
        {
          value: '2', desc: '2'
        },
        {
          value: '3', desc: '3'
        },
        {
          value: '4', desc: '4'
        },
        {
          value: '5', desc: '5'
        },
        {
          value: '6', desc: '6'
        },
        {
          value: '7', desc: '7'
        }
      ],
      pushPinList: Util.pushpinList,
      groupOptions: [''],
      filteredOptions1: [''],
      vehicleForm: {
        accountID: '',
        deviceID: '',
        creationDate: '',
        deviceCode: '',
        uniqueID: '',
        isActive: 0,
        description: '',
        displayName: '',
        vehicleID: '',
        vehicleMake: '',
        vehicleModel: '',
        licensePlate: '',
        licenseExpire: 0,
        equipmentType: '',
        equipmentStatus: '',
        imeiNumber: '',
        serialNumber: '',
        simPhoneNumber: '',
        smsEmail: '',
        pushpinID: '',
        displayColor: '',
        ignitionIndex: 0,
        speedLimitKPH: 0,
        driverID: '',
        fuelCapacity: 0.0,
        fuelTankProfile: '',
        fuelEconomy: 0.0,
        fuelCostPerLiter: 0.0,
        maintNotes: '',
        maintIntervalKM0: 0.0,
        maintOdometerKM0: 0.0,
        maintIntervalKM1: 0.0,
        maintOdometerKM1: 0.0,
        maintIntervalHR0: 0.0,
        maintEngHoursHR0: 0.0,
        lastFaultCode: '',
        allowNotify: 1,
        notifyEmail: '',
        dcsPropertiesID: 'default',
        groupID: null
      },
      groupList: [],
      licenseExpire: '',
      currentAccountID: '',
      currentVehicleID: '',
      enableEdit: 2,
      uniqueIDEdit: 2,
      serverIDEdit: 2,
      firmWareEdit: 2,
      notificationEdit: 2,
      commandsEdit: 2,
      smsCommandsEdit: 2,
      editSMSEdit: 2,
      editSimEdit: 2,
      editEqipStatusEdit: 2,
      editImeiEdit: 2,
      editSerialEdit: 2,
      editDatakeyEdit: 2,
      fuelEconomyEdit: 2,
      fuelProfileEdit: 2,
      fuelCapacityEdit: 2,
      membershipEdit: 1,
      accountIDList: [],
      permissions: [],
      userLevel: 'account'
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.vehicleForm.accountID = LocalStorage.getItem('accountID')
    this.permissions = LocalStorage.getItem('permissions')
    // check this is create page or update existing vehicle page
    this.isNew()
    if (!this.isNewPage) {
      this.getVehicleByID()
    } else {
      this.setLicenseExpireDate()
    }
    // get initial vehicleList from server (1st page)
    this.getAccountIDList()
    this.getDevicegroups(this.vehicleForm.accountID)
  },
  mounted () {
    if (this.userLevel === 'user') {
      this.enableEdit = permissionChecker.checkVehicleAdmin(this.permissions)
      this.uniqueIDEdit = permissionChecker.checkVehicleUniqueIDEditable(this.permissions)
      this.serverIDEdit = permissionChecker.checkVehicleServerIDEditable(this.permissions)
      this.firmWareEdit = permissionChecker.checkVehicleFirmwareEditable(this.permissions)
      this.notificationEdit = permissionChecker.checkVehicleNotificationEditable(this.permissions)
      this.commandsEdit = permissionChecker.checkVehicleCommandsEditable(this.permissions)
      this.smsCommandsEdit = permissionChecker.checkVehicleSMSCommandsEditable(this.permissions)
      this.editSMSEdit = permissionChecker.checkVehicleEditSMSEditable(this.permissions)
      this.editSimEdit = permissionChecker.checkVehicleEditSimEditable(this.permissions)
      this.editImeiEdit = permissionChecker.checkVehicleEditImeiEditable(this.permissions)
      this.editEqipStatusEdit = permissionChecker.checkVehicleEditEquipStatusEditable(this.permissions)
      this.editSerialEdit = permissionChecker.checkVehicleEditSerialEditable(this.permissions)
      this.editDatakeyEdit = permissionChecker.checkVehicleEditDatakeyEditable(this.permissions)
      this.fuelEconomyEdit = permissionChecker.checkVehicleFuelEconomyEditable(this.permissions)
      this.fuelProfileEdit = permissionChecker.checkVehicleFuelProfileEditable(this.permissions)
      this.fuelCapacityEdit = permissionChecker.checkVehicleFuelCapacityEditable(this.permissions)
      this.membershipEdit = permissionChecker.checkVehicleGroupMembershipEditable(this.permissions)
    }
  },
  methods: {
    isNew () {
      if (this.$router.currentRoute.params.id !== null && this.$router.currentRoute.params.id !== undefined && this.$router.currentRoute.params.id !== '') {
        this.isNewPage = false
        this.currentVehicleID = this.$router.currentRoute.params.id
        this.currentAccountID = this.$router.currentRoute.params.accountID
      } else {
        this.isNewPage = true
        this.currentVehicleID = ''
      }
    },
    isAdmin () {
      return this.userLevel === 'admin'
    },
    setLicenseExpireDate () {
      this.licenseExpire = new Date()
      this.licenseExpire = this.licenseExpire.getFullYear() + '/' + (this.appendLeadingZeroes(this.licenseExpire.getMonth() + 1)) + '/' + this.licenseExpire.getDate()
      this.vehicleForm.licenseExpire = this.licenseExpire
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
    async getVehicleByID () {
      const params = {
        conditions: {
          accountID: this.currentAccountID,
          deviceID: this.currentVehicleID
        }
      }

      try {
        let res = await api.getVehicleByID(params)
        this.vehicleForm = res.data.vehicle
        this.groupList = res.data.groupList
        this.licenseExpire = this.vehicleForm.licenseExpire !== 0 ? new Date(1000 * this.vehicleForm.licenseExpire) : new Date()
        this.licenseExpire = this.licenseExpire.getFullYear() + '/' + (this.appendLeadingZeroes(this.licenseExpire.getMonth() + 1)) + '/' + this.licenseExpire.getDate()

        this.vehicleForm.licenseExpire = this.licenseExpire
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/vehicles')
      }
    },
    async onSubmit () {
      var licenseExpire = new Date(this.licenseExpire)
      this.vehicleForm.licenseExpire = Math.round(Number(licenseExpire) / 1000)

      this.groupList = this.groupList.map(group => {
        group.deviceID = this.vehicleForm.deviceID
        group.creationTime = parseInt(Date.now() / 1000)
        group.lastUpdateTime = parseInt(Date.now() / 1000)
        return group
      })

      if (this.isNewPage) {
        const params = {
          data: {
            deviceData: this.vehicleForm,
            groupList: this.groupList
          }
        }

        api.createVehicle(params).then((res) => {
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.vehicleForm.deviceID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/vehicles')
        }).catch(() => {
          this.$router.push('/vehicles')
        })
      } else {
        const params = {
          conditions: {
            accountID: this.currentAccountID,
            deviceID: this.currentVehicleID
          },
          data: {
            deviceData: this.vehicleForm,
            groupList: this.groupList
          }
        }
        try {
          let res = await api.updateVehicle(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.currentVehicleID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/vehicles')
          // clear out existing vehicleGroupList and add new
        } catch (e) {
          this.$router.push('/vehicles')
        }
      }
    },
    // Filter group id
    filterGroupID1 (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.filteredOptions1 = this.groupOptions.filter(function (el) {
          if (el.groupID && ((el.description ? el.description : el.groupID) + '  [' + el.groupID + ']').toLowerCase().indexOf(needle) > -1) {
            return el
          }
        })
      })
    },
    async getDevicegroups (accountID) {
      const params = {
        conditions: {
          accountID: accountID
        }
      }

      // fetch vehicleGroupList from "server"
      try {
        let res = await api.getGroups(params)
        // clear out existing vehicleGroupList and add new
        this.groupOptions = res.data.devicegroups
        this.filteredOptions1 = res.data.devicegroups
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
