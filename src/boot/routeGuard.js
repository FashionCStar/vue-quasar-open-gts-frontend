// import something here
import { LocalStorage } from 'quasar'

function isAuthorized (roles) {
  // check session
  const userLevel = LocalStorage.getItem('userLevel')
  if (!userLevel) {
    // not logged in
    return false
  }
  if (Array.isArray(roles)) {
    return roles.includes(userLevel)
  } else {
    return roles === userLevel
  }
}

export default ({ router }) => {
  router.beforeEach((to, from, next) => {
    if (to.meta.roles && !isAuthorized(to.meta.roles)) {
      // not authorized
      next('/')
    } else {
      next()
    }
  })
}
