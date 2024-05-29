import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { ManifestV3Export, crx } from '@crxjs/vite-plugin'
import manifestJson from './manifest.json'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const manifest = manifestJson as ManifestV3Export;

// @note: following fix is needed - ignore linting errors. (it works)
const viteManifestHackIssue846: Plugin & { renderCrxManifest: (manifest: any, bundle: any) => void } = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHackIssue846',
  renderCrxManifest(_manifest, bundle) {
    bundle['manifest.json'] = bundle['.vite/manifest.json']
    bundle['manifest.json'].fileName = 'manifest.json'
    delete bundle['.vite/manifest.json']
  },
}


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000, // Set the desired port number here
  },
  base: "./",
  plugins: [nodePolyfills(), tsconfigPaths(), react(), viteManifestHackIssue846, crx({ manifest })],
  css: {
    postcss: {
      plugins: [],
    },
  },
})
