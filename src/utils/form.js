export const resetForm = (formEl) => {
  if (!formEl) return
  // Reset back to the initial state, if the form initializes the data, it is the original data, not empty
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
        // console.debug('allEmpty', `flag => ${false}, key => ${key}, value => ${obj[key]}`)
        return false
      }
    }
  }
  return flag
}
