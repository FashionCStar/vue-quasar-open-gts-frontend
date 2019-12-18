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
                @click="$router.push('/rules')"
                :icon=" 'fas fa-arrow-left' "
              />
              <span>{{isNewPage ? 'New Rule' : 'Rule Detail'}}</span>
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
          :model="ruleForm"
          style="width:100%; border-radius: 10px;"
          :disable="!isNewPage"
        >
          <div class="row justify-between q-col-gutter-md" >
            <div class="col-12 col-sm-6">
              <q-select outlined :disable="!(isNewPage && isAdmin)" v-model="ruleForm.accountID"
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
              <q-input :rules="[val => !!val || 'RoleID is required']" outlined :disable="!isNewPage" v-model="ruleForm.ruleID" ref="ruleID" :label="$t('ruleID')" />
            </div>
            <div class="col-12 col-sm-6">
                <div class="col-12 col-sm-6">
                  <q-select outlined :disable="enableEdit<2" v-model="ruleForm.isCronRule"
                            :options="cronRuleOptions"
                            :option-value="opt => opt === null ? null : opt.value"
                            :option-label="opt => opt === null ? '- Null -' : opt.desc"
                            map-options
                            emit-value
                            transition-show="flip-up"
                            transition-hide="flip-down"
                            ref="isCronRule" label="Cron Rule"/>
              </div>
            </div>
              <div class="col-12 col-sm-6">
                  <q-input outlined :disable="enableEdit<2" v-model="ruleForm.description" ref="description" label="Description"/>
              </div>
              <div class="col-12 col-sm-6">
                  <q-input outlined :disable="enableEdit<2" v-model="ruleForm.selector" ref="selector" label="Rule Selector"/>
              </div>
              <div class="col-12 col-sm-6">
                <q-select outlined v-model="ruleForm.actions" multiple
                          :options="triggerActions"
                          :option-value="opt => opt === null ? null : opt.value"
                          :option-label="opt => opt === null ? '- Null -' : opt.desc"
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          label="Trigger Actions"
                          :disable="enableEdit < 2"
                          use-chips
                />
              </div>
              <div class="col-12 col-sm-6">
                  <q-input outlined :disable="enableEdit<2" v-model="ruleForm.minNotifyAge" ref="minNotifyAge" label="Minimum Interval"/>
              </div>
              <div class="col-12 col-sm-6">
                  <q-select outlined v-model="ruleForm.triggerReset"
                            :options="resetOptions"
                            :option-value="opt => opt === null ? null : opt.value"
                            :option-label="opt => opt === null ? '- Null -' : opt.desc"
                            emit-value
                            map-options
                            transition-show="flip-up"
                            transition-hide="flip-down"
                            label="Interval Reset"
                            :disable="enableEdit < 2"
                  />
              </div>
              <div class="col-12 col-sm-6">
                  <q-input outlined :disable="enableEdit < 2" v-model="ruleForm.cannedActions" ref="cannedActions" label="Predefined Actions"/>
              </div>
              <div class="col-12 col-sm-6">
                  <q-input outlined :disable="enableEdit < 2" v-model="ruleForm.emailSubject" ref="emailSubject" label="EMail Subject"/>
              </div>
              <div class="col-12 col-sm-6">
                  <q-input outlined
                           :disable="enableEdit < 2"
                           v-model="ruleForm.emailText"
                           ref="emailText"
                           label="EMail Message"
                           autogrow/>
              </div>
              <div class="col-12 col-sm-6">
                  <q-input outlined
                           :disable="enableEdit < 2"
                           v-model="ruleForm.smsText"
                           ref="smsText"
                           label="SMS Message"
                           autogrow/>
              </div>
<!--              <div class="col-12 col-sm-6">-->
<!--                  <q-select outlined :disable="enableEdit<2" v-model="vehicleForm.displayColor"-->
<!--                            :options="displayColorOptions"-->
<!--                            :option-value="opt => opt === null ? null : opt.value"-->
<!--                            :option-label="opt => opt === null ? '- Null -' : opt.desc"-->
<!--                            emit-value-->
<!--                            map-options-->
<!--                            options-cover-->
<!--                            transition-show="flip-up"-->
<!--                            transition-hide="flip-down"-->
<!--                            ref="displayColor" label="Map Route Color"/>-->
<!--              </div>-->
<!--              <div class="col-12 col-sm-6">-->
<!--                  <q-select outlined :disable="enableEdit<2" v-model="vehicleForm.ignitionIndex"-->
<!--                            :options="ignitionIndexOptions"-->
<!--                            :option-value="opt => opt === null ? null : opt.value"-->
<!--                            :option-label="opt => opt === null ? '- Null -' : opt.desc"-->
<!--                            emit-value-->
<!--                            map-options-->
<!--                            options-cover-->
<!--                            transition-show="flip-up"-->
<!--                            transition-hide="flip-down"-->
<!--                            ref="ignitionIndex" label="Ignition Input"/>-->
<!--              </div>-->
<!--              <div class="col-12 col-sm-6">-->
<!--                  <q-select outlined :disable="enableEdit<2" v-model="vehicleForm.groupID"-->
<!--                            :options="filteredOptions1"-->
<!--                            :option-value="opt => opt === null ? null : opt.groupID"-->
<!--                            :option-label="opt => opt === null ? '- Null -' : (opt.description ? opt.description : opt.groupID) + '  [' + opt.groupID + ']'"-->
<!--                            emit-value-->
<!--                            map-options-->
<!--                            use-input-->
<!--                            hide-selected-->
<!--                            fill-input-->
<!--                            transition-show="flip-up"-->
<!--                            transition-hide="flip-down"-->
<!--                            input-debounce="0"-->
<!--                            @filter="filterGroupID1"-->
<!--                            label="Preferred Group"-->
<!--                  >-->
          </div>
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
import { LocalStorage } from 'quasar'
import { permissionChecker } from 'src/boot/checkPermission'

export default {
  name: 'Detail',
  data: function () {
    return {
      isNewPage: true,
      cronRuleOptions: [
        { value: 0, desc: 'No' },
        { value: 1, desc: 'Yes' },
        { value: 2, desc: '30 Minute' },
        { value: 3, desc: 'Hourly' },
        { value: 4, desc: 'Daily' },
        { value: 5, desc: 'Weekly' }
      ],
      triggerActions: [
        { value: 0, desc: 'Email' },
        { value: 1, desc: 'Save/Alert' },
        { value: 2, desc: 'Queue' },
        { value: 3, desc: 'Listener' }
      ],
      resetOptions: [
        { value: 0, desc: 'No' },
        { value: 1, desc: 'Yes' }
      ],
      ruleForm: {
        accountID: '',
        ruleID: '',
        isCronRule: '',
        description: '',
        selector: '',
        actions: [],
        minNotifyAge: '',
        triggerReset: 0,
        cannedActions: '',
        emailSubject: '',
        emailText: '',
        smsText: ''
      },
      enableEdit: 3,
      currentAccountID: '',
      accountIDList: []
    }
  },
  created () {
    this.ruleForm.accountID = LocalStorage.getItem('accountID')

    this.isNew()

    if (!this.isNewPage) {
      this.getRuleByID()
    }
    this.getAccountIDList()
  },
  mounted () {
    if (this.userLevel === 'user') {
      this.enableEdit = permissionChecker.checkRuleAdmin(this.permissions)
    }
  },
  methods: {
    isNew () {
      if (this.$router.currentRoute.params.id !== null && this.$router.currentRoute.params.id !== undefined && this.$router.currentRoute.params.id !== '') {
        this.isNewPage = false
        this.currentRuleID = this.$router.currentRoute.params.id
        this.currentAccountID = this.$router.currentRoute.params.accountID
      } else {
        this.isNewPage = true
        this.currentRuleID = ''
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
        this.$router.push('/rules')
      }
    },

    getRuleByID: async function () {
      const params = {
        conditions: {
          accountID: this.currentAccountID,
          roleID: this.currentRoleID
        }
      }

      try {
        let res = await api.getRuleByID(params)
        this.ruleForm = res.data.rule
        console.log('#RULE', this.ruleForm)
        this.loading = false
      } catch (e) {
        // this.$router.push('/roles')
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
