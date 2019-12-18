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
                @click="$router.push('/statuscodes')"
                :icon=" 'fas fa-arrow-left' "
              />
              <span>{{isNewPage ? 'New StatusCode' : 'StatusCode Detail'}}</span>
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
          ref="statuscodeForm"
          :model="statuscodeForm"
          style="width:100%; border-radius: 10px;"
        >
          <div class="row justify-between q-col-gutter-md" >
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="!(isNewPage && isAdmin)" v-model="statuscodeForm.accountID"
                        :options="accountIDList"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="accountID" :label="$t('accountID')"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input :rules="[val => !!val || 'StatusCode is required']" outlined :disable="!isNewPage" v-model="statuscodeForm.statusCode" ref="statusCode" label="Status Code" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="statuscodeForm.statusName" ref="statusName" label="Status Name"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="statuscodeForm.description" ref="description" label="Description"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="statuscodeForm.iconName" ref="iconName" label="Pushpin Name"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-input outlined v-model="statuscodeForm.iconSelector" ref="iconSelector" label="Icon Selector"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined v-model="statuscodeForm.foregroundColor"
                        :options="displayColorOptions"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="foregroundColor" label="Text Color"/>
            </div>
            <div class="col-12 col-sm-6">
              <q-select outlined v-model="statuscodeForm.backgroundColor"
                        :options="displayColorOptions"
                        :option-value="opt => opt === null ? null : opt.value"
                        :option-label="opt => opt === null ? '- Null -' : opt.desc"
                        emit-value
                        map-options
                        options-cover
                        transition-show="flip-up"
                        transition-hide="flip-down"
                        ref="backgroundColor" label="Background Color"/>
            </div>
          </div>
          <!--<div class="q-pa-md">-->
            <!--<q-btn :label="isNewPage ? 'Add New StatusCode' : 'Update StatusCode'" type="submit" color="primary" class="q-btn&#45;&#45;push" style="width:200px; height:50px;"/>-->
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

export default {
  name: 'Detail',
  data: function () {
    return {
      isNewPage: true,
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
      statuscodeForm: {
        accountID: '',
        deviceID: '*',
        statusCode: '',
        statusName: '',
        foregroundColor: '',
        backgroundColor: '',
        iconSelector: '',
        iconName: '',
        description: ''
      },
      currentAccountID: '',
      currentStatusCode: '',
      enableEdit: 2,
      accountIDList: [],
      userLevel: 'account'
    }
  },
  created () {
    this.userLevel = LocalStorage.getItem('userLevel')
    this.statuscodeForm.accountID = LocalStorage.getItem('accountID')
    // check this is create page or update existing vehicle page
    this.isNew()
    if (!this.isNewPage) {
      this.getStatuscodeByID()
    }

    this.getAccountIDList()
  },
  methods: {
    isNew () {
      if (this.$router.currentRoute.params.id !== null && this.$router.currentRoute.params.id !== undefined && this.$router.currentRoute.params.id !== '') {
        this.isNewPage = false
        this.currentAccountID = this.$router.currentRoute.params.accountID
        this.currentStatusCode = this.$router.currentRoute.params.id
      } else {
        this.isNewPage = true
        this.currentStatusCode = ''
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
    getStatuscodeByID: async function () {
      const params = {
        conditions: {
          accountID: this.currentAccountID,
          statusCode: this.currentStatusCode
        }
      }

      try {
        let res = await api.getStatuscodeByID(params)
        this.statuscodeForm = res.data.statuscode
        // ...and turn of loading indicator
        this.loading = false
      } catch (e) {
        this.$router.push('/statuscodes')
      }
    },
    async onSubmit () {
      if (this.isNewPage) {
        this.statuscodeForm.accountID = LocalStorage.getItem('accountID')
        const params = {
          data: this.statuscodeForm
        }
        try {
          let res = await api.createStatuscode(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.statuscodeForm.statusCode + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/statuscodes')
        } catch (e) {
          this.$router.push('/statuscodes')
        }
      } else {
        const params = {
          conditions: {
            accountID: this.currentAccountID,
            statusCode: this.currentStatusCode
          },
          data: this.statuscodeForm
        }
        try {
          let res = await api.updateStatuscode(params)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.currentStatusCode + ' ' + this.$t(res.data.success, { item: this.$t(res.data.item) })
          })
          this.$router.push('/statuscodes')
        } catch (e) {
          this.$router.push('/statuscodes')
        }
      }
    }
  }
}
</script>

<style>
</style>
