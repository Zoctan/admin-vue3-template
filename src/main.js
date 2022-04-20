import { createApp } from 'vue'
import store from '@/store'
import router from '@/router'
import '@/router/guard'
import App from '@/App.vue'
import permission from '@/directive/permission'
import * as ElIcons from '@element-plus/icons-vue'

const app = createApp(App)

app.use(store)
    .use(router)

// element-plus icons
for (const name in ElIcons) {
    app.component(name, ElIcons[name])
}

// v-permission
app.directive('permission', permission)

app.mount('#app')
