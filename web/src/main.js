import { createApp } from 'vue'
import App from './App.vue'
import { resetMockStore } from './store/mockStore'
import './styles/main.css'

// Dev convenience: `resetMockStore()` in the browser console wipes the
// persisted mock state; reload afterwards to re-seed from public/mocks/*.json.
window.resetMockStore = resetMockStore

createApp(App).mount('#app')
