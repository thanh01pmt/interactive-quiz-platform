import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Optional: specify a port for the example app
  },
  // If using npm link and facing issues with duplicated React instances,
  // you might need to alias React to the example app's node_modules.
  // resolve: {
  //   alias: {
  //     react: path.resolve('./node_modules/react'),
  //     'react-dom': path.resolve('./node_modules/react-dom'),
  //   },
  // },
})
