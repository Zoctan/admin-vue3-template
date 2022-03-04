import store from '@/store'

export default (needList = [], joint = 'and') => {
  if (store.getters && store.getters.member && store.getters.member.permissionList) {
    const needSet = new Set(needList)
    const permissionSet = new Set(store.getters.member.permissionList)
    const intersect = new Set([...needSet].filter(x => permissionSet.has(x)))
    if (joint === 'and') {
      return setsEqual(needSet, intersect)
    } else {
      intersect.size > 0
    }
  }
}

const setsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value))
