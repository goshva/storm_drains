import { createApp } from 'vue'
import App from './App.vue'
import { resetMockStore } from './store/mockStore'
import { initPwa } from './store/pwa'
import './store/theme' // applies the persisted theme before first paint
import './styles/main.css'

// Dev convenience: `resetMockStore()` in the browser console wipes the
// persisted mock state; reload afterwards to re-seed from public/mocks/*.json.
window.resetMockStore = resetMockStore

initPwa()
createApp(App).mount('#app')
