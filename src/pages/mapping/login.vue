<template>
    <div style="min-height: 600px;">
        <!--<q-img :src="url" class="fullscreen" style="z-index:-1;"/>-->
        <q-form
            @submit="onSubmit"
            rounded
            class="fixed-center text-center q-gutter-y-md q-pa-md shadow-3"
            ref="loginForm"
            :model="loginForm"
            style="width:90%; max-width: 400px; border-radius: 10px;"
        >
            <q-input outlined v-model="loginForm.account_name" ref="account_name" label="Account"/>
            <q-input outlined v-model="loginForm.user_name" ref="user_name" label="User"/>
            <q-input outlined v-model="loginForm.password" ref="password" type="password" label="Password"/>
            <div>
                <q-btn label="Login" type="submit" color="secondary" style="width:200px;"/>
            </div>
        </q-form>
    </div>
</template>

<script>
import { api } from 'src/boot/api'
import { LocalStorage } from 'quasar'
// import { i18n } from 'src/boot/i18n'

export default {
  name: 'login',
  data: function () {
    return {
      loginForm: {
        account_name: '',
        user_name: '',
        password: ''
      },
      url: '/assets/images/background.jpg'
    }
  },
  methods: {
    initLoginForm () {
      this.loginForm.account_name = ''
      this.loginForm.user_name = ''
      this.loginForm.password = ''
    },

    validateForm () {
      if (this.loginForm.account_name === '' || this.loginForm.account_name === null) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          position: 'top',
          icon: 'fas fa-exclamation-triangle',
          message: this.$t('needAccountName')
        })
        return false
      }
      if (this.loginForm.password === '' || this.loginForm.password === null) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          position: 'top',
          icon: 'fas fa-exclamation-triangle',
          message: this.$t('needPassword')
        })
        return false
      }
      return true
    },
    async onSubmit () {
      if (this.validateForm()) {
        var loginParams =
          {
            accountID: this.loginForm.account_name,
            userID: this.loginForm.user_name,
            password: this.loginForm.password
          }

        if (this.loginForm.user_name === '' || this.loginForm.user_name === null) {
          try {
            let res = await api.accountLogin(loginParams)

            this.$q.notify({
              color: 'green-5',
              textColor: 'white',
              position: 'top',
              message: this.$t('loginSuccess')
            })
            LocalStorage.set('token', res.data.token)
            LocalStorage.set('accountInfo', res.data.account)
            LocalStorage.set('accountID', res.data.account.accountID)
            if (res.data.account.isAccountManager === 1) {
              LocalStorage.set('userLevel', 'admin')
            } else {
              LocalStorage.set('userLevel', 'account')
            }
            this.$router.push('/')
          } catch (e) {
            this.initLoginForm()
          }
        } else {
          try {
            let res = await api.userLogin(loginParams)

            this.$q.notify({
              color: 'green-5',
              textColor: 'white',
              position: 'top',
              message: this.$t('loginSuccess')
            })
            LocalStorage.set('token', res.data.token)
            LocalStorage.set('userInfo', res.data.user)
            LocalStorage.set('accountID', res.data.user.accountID)
            LocalStorage.set('permissions', res.data.permissions)
            LocalStorage.set('userLevel', 'user')
            this.$router.push('/')
          } catch (e) {
            this.initLoginForm()
          }
        }
      }
    }
  }
}
</script>

<style>
</style>
