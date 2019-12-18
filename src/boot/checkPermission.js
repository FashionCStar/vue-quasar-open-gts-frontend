class PermissionChecker {
  checkProfileAuthorized (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-current-user')
  }
  checkUserShowContactEmail (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-field-contact-email')
  }
  checkUserShowContactName (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-field-contact-name')
  }
  checkUserShowContactPhone (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-field-contact-phone')
  }
  checkUserShowDescription (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-field-description')
  }
  checkUserShowLastLogin (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-field-last-login')
  }
  checkUserShowRole (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-field-role')
  }
  checkUserShowUserID (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-field-userId')
  }
  checkUserGroupEditable (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-group')
  }
  checkUserRoleEditable (permissions) {
    return this.getPermissionValue(permissions, 'user-administration-role')
  }
  checkVehicleAdmin (permissions) {
    return this.getPermissionValue(permissions, 'device-administration')
  }
  checkVehicleActive (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-active')
  }
  checkVehicleUniqueIDEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-uniqueId')
  }
  checkVehicleServerIDEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-serverId')
  }
  checkVehicleFirmwareEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-firmware')
  }
  checkVehicleNotificationEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-notification-rules')
  }
  checkVehicleCommandsEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-commands')
  }
  checkVehicleSMSCommandsEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-sms-commands')
  }
  checkVehicleEditSMSEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-edit-sms')
  }
  checkVehicleEditSimEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-edit-sim')
  }
  checkVehicleEditEquipStatusEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-edit-equip-status')
  }
  checkVehicleEditImeiEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-edit-imei')
  }
  checkVehicleEditSerialEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-edit-serial')
  }
  checkVehicleEditDatakeyEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-edit-datakey')
  }
  checkVehicleFuelEconomyEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-fuel-economy')
  }
  checkVehicleFuelProfileEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-fuel-profile')
  }
  checkVehicleFuelCapacityEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-fuel-capacity')
  }
  checkVehicleGroupMembershipEditable (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-group-membership')
  }
  checkVehicleShowDescription (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-field-description')
  }
  checkVehicleShowEquipmentType (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-field-equiptype')
  }
  checkVehicleShowIgnitionState (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-field-ignition-state')
  }
  checkVehicleShowServerID (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-field-serverId')
  }
  checkVehicleShowSimPhoneNumber (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-field-sim-phone')
  }
  checkVehicleShowUniqueID (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-field-uniqueId')
  }
  checkVehicleShowVehicleID (permissions) {
    return this.getPermissionValue(permissions, 'device-administration-field-vehicleId')
  }
  checkGroupAdmin (permissions) {
    return this.getPermissionValue(permissions, 'group-administration')
  }
  checkGroupShowCounts (permissions) {
    return this.getPermissionValue(permissions, 'group-administration-field-count')
  }
  checkGroupShowDescription (permissions) {
    return this.getPermissionValue(permissions, 'group-administration-field-description')
  }
  checkGroupShowGroupName (permissions) {
    return this.getPermissionValue(permissions, 'group-administration-field-group-name')
  }
  checkGroupShowGroupID (permissions) {
    return this.getPermissionValue(permissions, 'group-administration-field-groupId')
  }
  checkDriverAdmin (permissions) {
    return this.getPermissionValue(permissions, 'driver-administration')
  }
  checkDriverShowBadgeID (permissions) {
    return this.getPermissionValue(permissions, 'driver-administration-field-badgeId')
  }
  checkDriverShowContactPhone (permissions) {
    return this.getPermissionValue(permissions, 'driver-administration-field-contact-phone')
  }
  checkDriverShowDescription (permissions) {
    return this.getPermissionValue(permissions, 'driver-administration-field-description')
  }
  checkDriverShowDriverID (permissions) {
    return this.getPermissionValue(permissions, 'driver-administration-field-driverId')
  }
  checkDriverShowLicenseExpire (permissions) {
    return this.getPermissionValue(permissions, 'driver-administration-field-license-expire')
  }
  checkDriverShowLicenseNumber (permissions) {
    return this.getPermissionValue(permissions, 'driver-administration-field-license-number')
  }
  checkDriverShowLicenseType (permissions) {
    return this.getPermissionValue(permissions, 'driver-administration-license-type')
  }
  checkStatusCodeAdmin (permissions) {
    return this.getPermissionValue(permissions, 'statuscode-administration')
  }
  checkRoleAdmin (permissions) {
    return this.getPermissionValue(permissions, 'role-administration')
  }
  checkRuleAdmin (permissions) {
    return this.getPermissionValue(permissions, 'rule-administration')
  }
  checkGeoZoneAdmin (permissions) {
    return this.getPermissionValue(permissions, 'geozone-administration')
  }
  checkGeoCorridorAdmin (permissions) {
    return this.getPermissionValue(permissions, 'geocorridor-administration')
  }

  getPermissionValue (permissionList, permissionID) {
    for (let i = 0; i < permissionList.length; i++) {
      if (permissionList[i].permissionID === permissionID) {
        return parseInt(permissionList[i].value)
      }
    }
  }
}

const permissionChecker = new PermissionChecker()
export { permissionChecker }
