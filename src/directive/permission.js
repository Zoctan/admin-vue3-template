export default {
  // 当被绑定的元素挂载到 DOM 中时
  mounted(el, binding) {
    const { value } = binding
    const permissionList = store.getters && store.getters.member.permissionList
    if (value && value instanceof Array && value.length > 0) {
      const need = value
      const hasPermission = permissionList.some(permission => need.includes(permission))

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      throw new Error(`need permission! Like v-permission="['article:add','article:delete']"`);
    }
  }
}