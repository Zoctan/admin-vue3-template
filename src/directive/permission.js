import hasPermission from 'utils/hasPermission'

export default {
  // 当被绑定的元素挂载到 DOM 中时
  mounted(el, binding) {
    const { value } = binding
    const successCallback = () => el.parentNode && el.parentNode.removeChild(el)
    const errorCallback = () => {
      throw new Error(`
      usage:
      if need all permissions in array, use 'and': v-permission="['article:add','article:delete']" or v-permission="{joint:'and', list:['article:add','article:delete']}".
      if just need one of permission in array, use 'or': v-permission="{joint:'or', list:['article:add','article:delete']}".
    `)
    }
    if (value && value instanceof Array && value.length > 0) {
      if (!hasPermission(value)) {
        return successCallback()
      }
    } else {
      if (value && value instanceof Object) {
        const { joint, list } = value
        if (list.length > 0) {
          if (!hasPermission(list, joint)) {
            return successCallback()
          }
        } else {
          return errorCallback()
        }
      } else {
        return errorCallback()
      }
    }
  }
}