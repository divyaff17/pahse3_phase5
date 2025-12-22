import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  // Correct for Vercel (root hosting)
  base: "/",

  server: {
    host: "::",
    port: 5173,
  },

  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/icon-192x192.png", "icons/icon-512x512.png", "icons/icon-maskable-192x192.png"],
      manifest: {
        name: "Pop Clozet - Rent the Trend",
        short_name: "Pop Clozet",
        description: "Rent designer fashion for every occasion. Delivered in 60 minutes.",
        theme_color: "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          {
            name: "New Arrivals",
            short_name: "New",
            description: "Browse the latest fashion arrivals",
            url: "/collections?filter=new",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }]
          },
          {
            name: "My Rentals",
            short_name: "Rentals",
            description: "View your current rentals",
            url: "/profile",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Search",
            short_name: "Search",
            description: "Search for outfits",
            url: "/?search=true",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }]
          }
        ],
        categories: ["shopping", "lifestyle", "fashion"]
      },
      workbox: {
        // Only precache essential files (JS, CSS, HTML, icons, fonts)
        // Images will be cached at runtime for better performance
        globPatterns: ["**/*.{js,css,html,ico,svg,woff,woff2}"],
        globIgnores: ["**/*.{png,jpg,jpeg,webp,gif}"], // Exclude all images from precache
        globDirectory: 'dist',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit for JS bundles
        runtimeCaching: [
          // Cache images at runtime instead of precaching
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|gif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // Cache CSS
          {
            urlPattern: /\.css$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "css-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          // Cache Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets"
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: "module"
      }
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    target: "es2020",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          animations: ["framer-motion"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
          ],
        },
      },
    },
  },
});

