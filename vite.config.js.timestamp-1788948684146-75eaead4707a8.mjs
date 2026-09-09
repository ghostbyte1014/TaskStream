// vite.config.js
import { defineConfig } from "file:///C:/Users/JC%20Gabriel/Downloads/New%20folder%20(5)/Dd.%20Frontend%20(Standalone)/TaskStream/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/JC%20Gabriel/Downloads/New%20folder%20(5)/Dd.%20Frontend%20(Standalone)/TaskStream/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///C:/Users/JC%20Gabriel/Downloads/New%20folder%20(5)/Dd.%20Frontend%20(Standalone)/TaskStream/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 3e3,
    open: true
  },
  esbuild: {
    sourcemap: false
  },
  build: {
    sourcemap: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKQyBHYWJyaWVsXFxcXERvd25sb2Fkc1xcXFxOZXcgZm9sZGVyICg1KVxcXFxEZC4gRnJvbnRlbmQgKFN0YW5kYWxvbmUpXFxcXFRhc2tTdHJlYW1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEpDIEdhYnJpZWxcXFxcRG93bmxvYWRzXFxcXE5ldyBmb2xkZXIgKDUpXFxcXERkLiBGcm9udGVuZCAoU3RhbmRhbG9uZSlcXFxcVGFza1N0cmVhbVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvSkMlMjBHYWJyaWVsL0Rvd25sb2Fkcy9OZXclMjBmb2xkZXIlMjAoNSkvRGQuJTIwRnJvbnRlbmQlMjAoU3RhbmRhbG9uZSkvVGFza1N0cmVhbS92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgaW5qZWN0UmVnaXN0ZXI6ICdhdXRvJyxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLGpzb259J11cbiAgICAgIH0sXG4gICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIG9wZW46IHRydWVcbiAgfSxcbiAgZXNidWlsZDoge1xuICAgIHNvdXJjZW1hcDogZmFsc2VcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IGZhbHNlXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2YixTQUFTLG9CQUFvQjtBQUMxZCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLGdCQUFnQjtBQUFBLE1BQ2hCLFNBQVM7QUFBQSxRQUNQLGNBQWMsQ0FBQyxxQ0FBcUM7QUFBQSxNQUN0RDtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxFQUNiO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
