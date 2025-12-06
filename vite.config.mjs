import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_APP_VERSION': JSON.stringify(process.env.VITE_APP_VERSION || '0.1.0'),
    'process.env.PUBLIC_URL': JSON.stringify(''),
    'process.env': {} // Fallback
  },
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 1000, // Reduced from 2000 for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          forms: ['react-hook-form'],
          // Marketing page chunk (most critical for LCP)
          marketing: ['./src/pages/aes-crm-marketing-landing-page/index.jsx'],
          // Dashboard chunks (lazy loaded)
          dashboard: ['./src/pages/dental-crm-dashboard/index.jsx'],
          // Utils and services
          utils: ['./src/utils/logger.js', './src/utils/performance.js', './src/utils/constants.js']
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    // Enable source maps for debugging (disable in production)
    sourcemap: process.env.NODE_ENV === 'development'
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'react-hook-form'
    ],
    exclude: [
      // Exclude heavy components that should be lazy loaded
      './src/pages/dental-crm-dashboard',
      './src/pages/lead-generation-conversion-analytics-dashboard',
      './src/pages/practice-performance-overview-dashboard'
    ]
  }
});