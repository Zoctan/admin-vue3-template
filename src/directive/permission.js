import Permission, { Joint } from 'utils/Permission'

const permission = new Permission()

// https://vuejs.org/guide/reusability/custom-directives.html#directive-hooks
export default {
  mounted(el, binding) {
    const { value = [], arg = Joint.AND } = binding

    if (value) {
      return permission.check({
        value: value,
        joint: arg,
        notAccessCallback: () => el.parentNode && el.parentNode.removeChild(el)
      })
    } else {
      throw new Error(`
        Usage:
        If need all permissions in array, use 'and': v-permission:and[optional]="['article:add','article:remove']".
        If only one permission, use: v-permission="'article:add'".
        If just need one of permission in array, use 'or': v-permission:or="['article:add','article:remove']".
        Use object value instead of above: v-permission="{ joint:'and', list:['article:add','article:remove'] }",
                                           v-permission="{ joint:'or', list:['article:add','article:remove'] }".
      `)
    }
  }
}