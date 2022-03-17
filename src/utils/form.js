export const resetForm = (formEl) => {
  if (!formEl) return
  // 重置回初始状态，如果表单初始化了数据，就是那个原始数据，而不是清空
  formEl.resetFields()
}

export const allEmpty = (obj, excludeKey = []) => {
  let flag = true
  for (const key in obj) {
    if (excludeKey.includes(key)) {
      continue
    }
    if (obj[key] instanceof Object) {
      flag = flag && allEmpty(obj[key], excludeKey)
    } else {
      if (obj[key] !== null && obj[key] !== '') {
        console.debug(`flag => ${false}, key => ${key}, value => ${obj[key]}`)
        return false
      }
    }
  }
  return flag
}
