import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://34.213.232.59:3000', // Backend server
        changeOrigin: true,
        secure: false
      }
    }
  }
});
