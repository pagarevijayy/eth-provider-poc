import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills(), react(), crx({ manifest }),],
})
