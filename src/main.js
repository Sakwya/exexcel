import {
	createApp
} from 'vue'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import {
	createVuetify
} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
	components: components,
	directives: directives,
})


createApp(App).use(router).use(vuetify).mount('#app')