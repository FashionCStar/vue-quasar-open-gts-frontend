import VueI18n from 'vue-i18n'
import Vue from 'vue'
import messages from 'src/i18n-localization' // move current index.js to messages or some other location

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'en-us',
  fallbackLocale: 'en-us',
  messages
})

export default i18n
