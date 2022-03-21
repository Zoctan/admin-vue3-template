import store from '@/store'

export default (needList = [], joint = 'and') => {
  if (store.getters && store.getters.member && store.getters.member.permissionList) {
    const needSet = new Set(needList)
    const permissionSet = new Set(store.getters.member.permissionList)
    const intersect = new Set([...needSet].filter(x => permissionSet.has(x)))
    // console.debug(`joint: ${joint}, needList: ${needList}`)
    // console.debug('intersect', intersect)
    // console.debug('setsEqual', setsEqual(needSet, intersect))
    if (joint === 'and') {
      const setsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value))
      return setsEqual(needSet, intersect)
    } else if (joint === 'or') {
      return intersect.size > 0
    }
  }
  return false
}
