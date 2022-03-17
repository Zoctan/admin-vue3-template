export default (name = 'vuex') => {
  const storage = localStorage.getItem(name)
  return storage ? JSON.parse(storage) : null
}
