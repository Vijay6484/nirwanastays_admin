import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["quill"],
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Listen on all network interfaces
    // or
    // host: '0.0.0.0', // Explicitly listen on all interfaces
    // port: 5173, // Optional: Specify a port (if you don't want the default)
  },
});