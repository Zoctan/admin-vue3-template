import store from '@/store'

export default (need) => {
  return store.getters && store.getters.member.permissionList.some(permission => need.includes(permission))
}
