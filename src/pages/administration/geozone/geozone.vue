<template>
  <q-page padding>
    <template>
      <div class="q-pa-md">
        <q-table
          :title="$t('geozone')"
          :data="geozoneList"
          :columns="columns"
          row-key="name"
          :pagination.sync="pagination"
          :loading="loading"
          :filter="filter"
          @request="getGeoZoneList"
          binary-state-sort
        >
          <template v-slot:top-right>
            <q-input dense debounce="300" v-model="filter" :placeholder="$t('search')">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <div class="items-center q-ml-xl">
              <q-btn class="bg-white text-primary shadow-3 q-btn--push" @click="showNewDialog = true">
                {{$t('createnew', { item: $t('geozone') })}}
              </q-btn>
            </div>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th :props="col.props" v-for="(col, index) in props.cols" :key="index" :align="col.align" @click.native="handleSort(col)">{{$t(col.label)}}</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" @click.native="goToDetail(props.row.accountID, props.row.geozoneID)">
              <q-td key="accountID" :props="props" v-show="isAdmin">{{ props.row.accountID }}</q-td>
              <q-td key="geozoneID" :props="props">{{ props.row.geozoneID }}</q-td>
              <q-td key="description" :props="props">{{ props.row.description }}</q-td>
              <q-td key="priority" :props="props">{{ props.row.priority }}</q-td>
              <q-td key="zoneType" :props="props">{{ getZoneType(props.row) }}</q-td>
              <q-td key="reverseGeocode" :props="props">{{ checkOption[props.row.reverseGeocode] }}</q-td>
              <q-td key="arrivalZone" :props="props">{{ checkOption[props.row.arrivalZone] }}</q-td>
              <q-td key="departureZone" :props="props">{{ checkOption[props.row.departureZone] }}</q-td>
              <q-td key="radius" :props="props">{{ getRadius(props.row) }}</q-td>
              <q-td key="latitude1" :props="props">{{ convertLatitude(props.row) }}</q-td>
              <q-td key="buttons" :props="props">
                <q-btn  :icon="props.row.isActive ? 'fas fa-check-circle' : 'fas fa-ban' "
                        :color="props.row.isActive ? 'teal' : 'red' "
                        size="sm"
                        round glossy
                        v-show="editable >= 3"
                        @click.native.stop
                        @click="setActive(props.row)"
                />
                <q-btn
                        class="q-ml-sm"
                        icon="fas fa-trash-alt"
                        round glossy
                        size="sm"
                        color="black"
                        v-show="editable >= 3"
                        @click.native.stop
                        @click="removeZone(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <q-dialog v-model="showNewDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">New Geozone</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="createZone" class="q-gutter-sm" :model="zoneForm">
              <q-select v-model="zoneForm.accountID"
                        :options="accountIDList"
                        options-dense
                        :label="$t('accountID')"
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        :readonly="userLevel !== 'admin'"
              />
              <q-input v-model="zoneForm.geozoneID"
                       :label="$t('geozoneID')"
                       :rules="[val => !!val || 'Field is required']"
              />
              <q-input v-model="zoneForm.description"
                       :label="$t('description')"
                       :rules="[val => !!val || 'Field is required']"
              />
              <q-select v-model="zoneForm.zoneType"
                        :options="zoneTypes"
                        :option-value="opt => opt.value"
                        :option-label="opt => opt.label"
                        options-dense
                        :label="$t('zoneType')"
                        map-options
                        emit-value
                        transition-show="flip-up"
                        transition-hide="flip-down"
              />

              <div class="text-right q-mt-md">
                <q-btn label="Cancel" color="primary" @click="resetForm" v-close-popup />
                <q-btn label="Create" type="submit" color="primary" class="q-ml-sm"/>
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
  name: 'Users',
  data () {
    return {
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'geozoneID',
        descending: false,
        page: 0,
        rowsPerPage: 10,
        rowsNumber: 20
      },
      visibleColumns: [],
      columns: [
        { name: 'accountID', required: true, label: 'accountID', align: 'center', field: 'accountID', sortable: true },
        { name: 'geozoneID', align: 'center', label: 'geozoneID', field: 'geozoneID', sortable: true, style: 'width: 10px' },
        { name: 'description', align: 'center', label: 'description', field: 'description', sortable: true },
        { name: 'priority', align: 'center', label: 'priority', field: 'priority', sortable: true },
        { name: 'zoneType', align: 'center', label: 'zoneType', field: 'zoneType', sortable: true },
        { name: 'reverseGeocode', align: 'center', label: 'reverseGeocode', field: 'reverseGeocode', sortable: true },
        { name: 'arrivalZone', align: 'center', label: 'arrivalZone', field: 'arrivalZone', sortable: true },
        { name: 'departureZone', align: 'center', label: 'departureZone', field: 'departureZone', sortable: true },
        { name: 'radius', align: 'center', label: 'radius', field: 'radius', sortable: true },
        { name: 'latitude1', align: 'center', label: 'centerLatLng', field: 'latitude1', sortable: true },
        { name: 'buttons', required: true, label: '', field: 'buttons' }
      ],
      zoneTypes: [
        { value: 0, label: 'PointRadius' },
        { value: 2, label: 'SweptPointRadius' },
        { value: 3, label: 'Polygon' }
      ],
      checkOption: [ 'No', 'Yes' ],
      geozoneList: [],
      userLevel: 'account',
      permissions: [],
      editable: 3,
      showNewDialog: false,
      accountID: '',
      accountIDList: [],

      zoneForm: {
        accountID: '',
        geozoneID: '',
        sortID: 0,
        minLatitude: 0,
        maxLatitude: 0,
        minLongitude: 0,
        maxLongitude: 0,
        zonePurposeID: '',
        reverseGeocode: 1,
        arrivalZone: 1,
        departureZone: 1,
        autoNotify: 0,
        zoomRegion: 0,
        shapeColor: '',
        zoneType: 0,
        radius: 50,
        latitude1: 0,
        longitude1: 0,
        latitude2: 0,
        longitude2: 0,
        latitude3: 0,
        longitude3: 0,
        latitude4: 0,
        longitude4: 0,
        latitude5: 0,
        longitude5: 0,
        latitude6: 0,
        longitude6: 0,
        latitude7: 0,
        longitude7: 0,
        latitude8: 0,
        longitude8: 0,
        latitude9: 0,
        longitude9: 0,
        latitude10: 0,
        longitude10: 0,
        clientUpload: 0,
        clientID: 0,
        groupID: '',
        streetAddress: '',
        city: '',
        stateProvince: '',
        postalCode: '',
        country: '',
        subdivision: '',
        displayName: '',
        description: '',
        priority: 0,
        speedLimitKPH: 0,
        arrivalStatusCode: 0,
        departureStatusCode: 0,
        iconName: '',
        vertices: '',
        contactPhone: '',
        isActive: 1
      }
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.permissions = LocalStorage.getItem('permissions')
    this.accountID = LocalStorage.getItem('accountID')
  },
  mounted () {
    if (this.userLevel === 'user') {
      this.editable = permissionChecker.checkGeoZoneAdmin(this.permissions)
    }
    // get initial userList from server (1st page)
    this.getGeoZoneList({
      pagination: this.pagination,
      filter: undefined
    })
    this.getAccountIDList()
  },
  methods: {
    async getAccountIDList () {
      try {
        let res = await api.getAllAccountIDs()
        this.accountIDList = res.data.accountList.map(item => item.accountID)
        this.loading = false
      } catch (error) {
        console.log('ERROR', error)
      }
    },
    goToDetail (accountID, geozoneID) {
      this.$router.push({ name: 'Update Geozone', params: { accountID: accountID, id: geozoneID } })
    },

    isAdmin () {
      return LocalStorage.getItem('userLevel') === 'admin'
    },
    convertLatitude (location) {
      return location.latitude1.toFixed(5) + ' / ' + location.longitude1.toFixed(5)
    },
    getZoneType (data) {
      return this.zoneTypes.find(zone => zone.value === data.zoneType).label
    },
    getRadius (data) {
      return data.zoneType === 3 ? '--' : data.radius
    },

    handleSort (col) {
      if (col.sortable) {
        if (this.pagination.sortBy === col.name) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = col.name
          this.pagination.descending = false
        }
        this.getGeoZoneList({
          pagination: this.pagination,
          filter: undefined
        })
      }
    },
    createZone: async function () {
      switch (this.zoneForm.zoneType) {
        case 0:
          this.zoneForm.radius = 3000
          break
        case 2:
          this.zoneForm.radius = 1000
          break
        default:
          this.zoneForm.radius = 50
      }
      const params = {
        data: this.zoneForm
      }
      try {
        let res = await api.createZone(params)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.zoneForm.geozoneID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
        this.getGeoZoneList({
          pagination: this.pagination,
          filter: this.filter
        })
        this.goToDetail(this.zoneForm.accountID, this.zoneForm.geozoneID)
        this.showNewDialog = false
        this.resetForm()
      } catch (e) {
        this.showNewDialog = false
        this.resetForm()
      }
    },
    getGeoZoneList: async function (props) {
      let { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination
      let filter = props.filter

      this.loading = true

      // get all rows if "All" (0) is selected
      let fetchCount = rowsPerPage === 0 ? rowsNumber : rowsPerPage

      // calculate starting row of userList
      let startRow = (page - 1) * rowsPerPage

      const params = {
        conditions: {},
        start: startRow,
        numPerPage: fetchCount,
        sortBy: sortBy,
        descending: descending
      }
      if (LocalStorage.getItem('userLevel') !== 'admin') {
        params.conditions.accountID = LocalStorage.getItem('accountID')
      }
      if (filter) {
        params.conditions.filter = filter
      }

      // fetch userList from "server"
      try {
        let res = await api.getZones(params)

        // clear out existing userList and add new
        this.geozoneList = res.data.zones
        this.zoneForm.accountID = this.accountID

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

    async setActive (zoneInfo) {
      zoneInfo.isActive = !zoneInfo.isActive
      const params = {
        conditions: {
          accountID: zoneInfo.accountID,
          geozoneID: zoneInfo.geozoneID
        },
        isActive: zoneInfo.isActive
      }
      try {
        let res = await api.activateZone(params)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: zoneInfo.geozoneID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
        })
      } catch (e) {
        zoneInfo.isActive = !zoneInfo.isActive
      }
    },

    resetForm () {
      this.zoneForm.accountID = this.accountID
      this.zoneForm.geozoneID = ''
      this.zoneForm.description = ''
      this.zoneForm.zoneType = ''
    },
    removeZone (zoneInfo) {
      // Confirm Remove User
      this.$q.dialog({
        title: this.$t('confirm'),
        message: this.$t('confirmDelete', { item: this.$t('zone'), id: zoneInfo.geozoneID }),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        const params = {
          conditions: {
            accountID: zoneInfo.accountID,
            geozoneID: zoneInfo.geozoneID
          }
        }
        try {
          let res = await api.removeZone(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: zoneInfo.geozoneID + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.getGeoZoneList({
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

<style lang="stylus">
  .my-sticky-header-table
    /* max height is important */

    .q-table__top,
    .q-table__bottom,
      thead tr:first-child th /* bg color is important for th; just specify one */
      background-color #c1f4cd

    thead tr:first-child th
      position sticky
      top 0
      opacity 1
      z-index 1
</style>
