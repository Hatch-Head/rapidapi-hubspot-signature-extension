import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    
    rollupOptions: {
        // options to bundle everything into one file
        output: {
          // Ensures all chunks are in a single file
          inlineDynamicImports: true
        }
      },
    
    // Configure your build requirements here
    outDir: './',  // Directory to place build files into
    minify: false,
    //target: 'es2016',
    lib: {
      entry: './src/index.js',
      name: 'HubspotSignature',
      formats: ['iife'],  // Build as an Immediately Invoked Function Expression
      fileName: (format) => `HubspotSignature.js`
    
    }
  }
});