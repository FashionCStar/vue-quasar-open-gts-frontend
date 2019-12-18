// import axios from 'axios'
//
// const API_URL = 'http://localhost:3000/api'
//
// const apiServer = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//     'Access-Control-Allow-Origin': 'allow'
//   }
// })
//
// export function setAxiosHeaders (token) {
//   axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
// }
//
// export function accountLogin (params) {
//   return apiServer.post('/account/authenticate', params)
// }
//
// export function getAccounts (params) {
//   return apiServer.post('/account/accounts', params)
// }
//
// export function activeAccount (params) {
//   return apiServer.post('/account/activeAccount', params)
// }
//
// export function userLogin (params) {
//   return apiServer.post('/user/authenticate', params)
// }
//
// export function getUsers (params) {
//   return apiServer.post('/user/users', params)
// }
//
// export function activeUser (parmas) {
//   return apiServer.post('/user/activeUser', parmas)
// }
