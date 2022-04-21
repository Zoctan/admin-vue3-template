import store from '@/store'

export const Joint = {
  AND: 'and',
  OR: 'or',
}

export default class Permission {
  constructor(joint = Joint.AND) {
    this.joint = joint
  }

  setJoint(joint) {
    this.joint = joint
    return this
  }

  exist() {
    return store.getters && store.getters.member && store.getters.member.permissionList && store.getters.member.permissionList.length > 0
  }

  check(data) {
    const { value = [], joint = this.joint, accessCallback = null, notAccessCallback = null } = data
    const _check = (list, joint) => {
      if (this.setJoint(joint).checkList(list)) {
        return accessCallback && accessCallback()
      } else {
        return notAccessCallback && notAccessCallback()
      }
    }
    
    if (value instanceof Array) {
      if (value.length === 0) {
        return this.exist()
      }

      if (value.length > 0) {
        return _check(value, joint)
      }
    }

    if (value instanceof Object) {
      const { joint, list } = value
      if (list.length > 0) {
        return _check(list, joint)
      }
    }

    if ((typeof value) === 'string') {
      return _check([value], joint)
    }
  }

  checkList(needList = []) {
    if (this.exist()) {
      const needSet = new Set(needList)
      const permissionSet = new Set(store.getters.member.permissionList)
      const intersect = new Set([...needSet].filter(x => permissionSet.has(x)))
      // console.debug(`joint: ${joint}, needList: ${needList}`)
      // console.debug('intersect', intersect)
      // console.debug('setsEqual', setsEqual(needSet, intersect))
      if (this.joint === Joint.AND) {
        return intersect.size === needSet.size
      } else if (this.joint === Joint.OR) {
        return intersect.size > 0
      }
    }
    return false
  }
} 
