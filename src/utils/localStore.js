export default () => {
  const storage = localStorage.getItem('vuex')
  return storage ? JSON.parse(storage) : null
}
