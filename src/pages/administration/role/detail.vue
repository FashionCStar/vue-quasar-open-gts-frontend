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
                @click="$router.push('/roles')"
                :icon=" 'fas fa-arrow-left' "
              />
              <span>{{isNewPage ? 'New Role' : 'Role Detail'}}</span>
            </div>
            <!--<div class="items-center">-->
              <!--<q-btn class="bg-white text-primary shadow-3 q-btn&#45;&#45;push" @click="onSubmit()">-->
                <!--Save-->
              <!--</q-btn>-->
            <!--</div>-->
          </div>
        </template>
        <q-form
          @submit="onSubmit"
          rounded
          class="text-center q-gutter-y-md q-pa-md shadow-3 bg-white"
          ref="roleForm"
          :model="roleForm"
          style="width:100%; border-radius: 10px;"
          :disable="!isNewPage"
        >
          <div class="row justify-between q-col-gutter-md" >
            <div class="col-12 col-sm-6">
              <q-input :rules="[val => !!val || 'RoleID is required']" outlined :disable="!isNewPage" v-model="roleForm.roleID" ref="roleID" :label="$t('roleID')" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="roleForm.displayName" ref="displayName" :label="$t('description')"/>
            </div>
            <div class="col-12 col-sm-6 text-left" v-for="permission in permissions" :key="permission.permissionID">
<!--              <q-checkbox v-model="roleForm.permissions" :val="permission.permissionID" :label="permission.displayName" color="cyan" />-->
              <q-select outlined
                        emit-value
                        v-model="roleForm.permissions[permission.permissionID]"
                        :label="permission.displayName"
                        :options="getPermissionValues(permission.values)"
                        :option-label="opt => getOptionLabel(opt)" />
            </div>
          </div>
          <!--<div class="q-pa-md">-->
            <!--<q-btn :label="isNewPage ? 'Add New Role' : 'Update Role'" type="submit" color="primary" class="q-btn&#45;&#45;push" style="width:200px; height:50px;"/>-->
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
      roleForm: {
        roleID: '',
        displayName: '',
        permissions: {
          'account-administration': '',
          'alert-panel': '',
          'calamp-commands': '',
          'calamp-door-unlock': '',
          'calamp-locatenow': '',
          'calamp-locatesms': '',
          'calamp-starter-disable': '',
          'calamp-starter-enable': '',
          'change-password': '',
          'device-administration': '',
          'device-administration-active': '',
          'device-administration-commands': '',
          'device-administration-edit-datakey': '',
          'device-administration-edit-equip-status': '',
          'device-administration-edit-imei': '',
          'device-administration-edit-serial': '',
          'device-administration-edit-sim': '',
          'device-administration-edit-sms': '',
          'device-administration-field-description': '',
          'device-administration-field-equiptype': '',
          'device-administration-field-ignition-state': '',
          'device-administration-field-serverId': '',
          'device-administration-field-sim-phone': '',
          'device-administration-field-uniqueId': '',
          'device-administration-field-vehicleId': '',
          'device-administration-firmware': '',
          'device-administration-fuel-capacity': '',
          'device-administration-fuel-economy': '',
          'device-administration-fuel-profile': '',
          'device-administration-group-membership': '',
          'device-administration-notification-rules': '',
          'device-administration-serverId': '',
          'device-administration-sms-commands': '',
          'device-administration-uniqueId': '',
          'device-alerts': '',
          'device-last-location-map-auto-update': '',
          'device-last-location-map-display': '',
          'device-map-auto-update': '',
          'device-map-display': '',
          'driver-administration': '',
          'driver-administration-field-badgeId': '',
          'driver-administration-field-contact-phone': '',
          'driver-administration-field-description': '',
          'driver-administration-field-driverId': '',
          'driver-administration-field-license-expire': '',
          'driver-administration-field-license-number': '',
          'driver-administration-field-license-type': '',
          'enfora-atcommand-sms': '',
          'enfora-atcommand-udp': '',
          'enfora-canned-message-1': '',
          'enfora-canned-message-2': '',
          'enfora-canned-message-3': '',
          'enfora-canned-messages': '',
          'enfora-commands': '',
          'enfora-driver-message-sms': '',
          'enfora-driver-message-udp': '',
          'enfora-geozones': '',
          'enfora-locatenow': '',
          'enfora-locatesms': '',
          'enfora-output-1-off': '',
          'enfora-output-1-on': '',
          'enfora-output-2-off': '',
          'enfora-output-2-on': '',
          'enfora-output-3-off': '',
          'enfora-output-3-on': '',
          'enfora-output-off': '',
          'enfora-output-on': '',
          'enfora-set-driver-id': '',
          'entity-administration': '',
          'entity-administration-package': '',
          'entity-administration-person': '',
          'entity-administration-rfid': '',
          'entity-administration-trailer': '',
          'fleet-group-map-auto-update': '',
          'fleet-group-map-display': '',
          'generic-html-wrapper': '',
          'geocorridor-administration': '',
          'geozone-administration': '',
          'group-administration': '',
          'group-administration-field-count': '',
          'group-administration-field-group-description': '',
          'group-administration-field-group-name': '',
          'group-administration-field-groupId': '',
          'report-account-last-login': '',
          'report-antx-detail': '',
          'report-antx-summary': '',
          'report-border-crossing-detail': '',
          'report-border-crossing-summary': '',
          'report-digital-input-detail': '',
          'report-distance-traveled': '',
          'report-driver-report': '',
          'report-driving-idle-time-device-summary': '',
          'report-driving-idle-time-fleet-summary': '',
          'report-entity-summary': '',
          'report-error-diagnostic-value': '',
          'report-event-count': '',
          'report-event-detail': '',
          'report-excess-speed-status-code': '',
          'report-excessive-idle-detail': '',
          'report-fleet-fuel-summary': '',
          'report-fleet-group-summary': '',
          'report-fuel-register': '',
          'report-geozone': '',
          'report-group-detail': '',
          'report-group-ifta': '',
          'report-group-performance': '',
          'report-group-summary': '',
          'report-group-system-admin': '',
          'report-ignition-detail': '',
          'report-j1708-fault': '',
          'report-job-administration': '',
          'report-nearby-devices': '',
          'report-notify-queue': '',
          'report-periodic-maintenance': '',
          'report-property-value': '',
          'report-speeds-over-posted-limit': '',
          'report-speeds-over-selected-value': '',
          'report-status-count-summary': '',
          'report-temperature': '',
          'report-trip-report-detail': '',
          'report-unassigned-devices': '',
          'report-user-login': '',
          'report-vehicle-driver-behavior': '',
          'role-administration': '',
          'rule-administration': '',
          'service-command-commands': '',
          'service-command-dbcreate': '',
          'service-command-dbdel': '',
          'service-command-dbget': '',
          'service-command-dbput': '',
          'service-command-dbschema': '',
          'service-command-devcmd': '',
          'service-command-eventdata': '',
          'service-command-mapdata': '',
          'service-command-messages': '',
          'service-command-propget': '',
          'service-command-pushpins': '',
          'service-command-report': '',
          'service-command-reportlist': '',
          'service-command-statuscodes': '',
          'service-command-version': '',
          'statuscode-administration': '',
          'system-administration': '',
          'user-administration-acl-access': '',
          'user-administration-all-users': '',
          'user-administration-current-user': '',
          'user-administration-field-contact-email': '',
          'user-administration-field-contact-name': '',
          'user-administration-field-contact-phone': '',
          'user-administration-field-description': '',
          'user-administration-field-last-login': '',
          'user-administration-field-role': '',
          'user-administration-field-userId': '',
          'user-administration-group': '',
          'user-administration-role': ''
        }
      },
      permissions: [],
      currentRoleID: ''
    }
  },
  created () {
    // check this is create page or update existing vehicle page
    this.isNew()
    this.getAllPermissions()

    if (!this.isNewPage) {
      this.getRoleByID()
    }
  },
  methods: {
    isNew () {
      if (this.$router.currentRoute.params.id !== null && this.$router.currentRoute.params.id !== undefined && this.$router.currentRoute.params.id !== '') {
        this.isNewPage = false
        this.currentRoleID = this.$router.currentRoute.params.id
      } else {
        this.isNewPage = true
        this.currentRoleID = ''
      }
    },

    getPermissionValues (values) {
      return values.split(',')
    },
    getOptionLabel (val) {
      let label = ''
      switch (val) {
        case '0':
          label = this.$t('none')
          break
        case '1':
          label = this.$t('read')
          break
        case '2':
          label = this.$t('write')
          break
        default:
          label = this.$t('add')
      }
      return label
    },
    getAllPermissions: async function () {
      let res = await api.getAllPermissions()
      this.permissions = res.data.permissions
      if (this.isNewPage) {
        this.permissions.forEach(item => {
          this.roleForm.permissions[item.permissionID] = item.defaultValue
        })
      }
    },
    getRoleByID: async function () {
      const params = {
        conditions: {
          roleID: this.currentRoleID
        }
      }

      try {
        let res = await api.getRoleByID(params)
        this.roleForm.roleID = res.data.role.roleID
        this.roleForm.displayName = res.data.role.displayName
        res.data.role.permissions.forEach(item => {
          this.roleForm.permissions[item.permissionID] = item.RoleHasPermission.value
        })
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/roles')
      }
    },

    async onSubmit () {
      if (this.isNewPage) {
        const params = {
          data: this.roleForm
        }
        try {
          let res = await api.createRole(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.roleForm.roleID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/roles')
        } catch (e) {
          this.$router.push('/roles')
        }
      } else {
        const params = {
          conditions: {
            roleID: this.currentRoleID
          },
          data: this.roleForm
        }
        try {
          let res = await api.updateRole(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.currentRoleID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/roles')
        } catch (e) {
          this.$router.push('/roles')
        }
      }
    }
  }
}
</script>

<style>
</style>
