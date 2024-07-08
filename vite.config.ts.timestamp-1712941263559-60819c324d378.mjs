// vite.config.ts
import path from "node:path";
import { defineConfig } from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/vite/dist/node/index.js";
import Vue from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import generateSitemap from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/vite-ssg-sitemap/dist/index.js";
import Components from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/unplugin-vue-components/dist/vite.js";
import AutoImport from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/unplugin-auto-import/dist/vite.js";
import Markdown from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/unplugin-vue-markdown/dist/vite.js";
import VueMacros from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/unplugin-vue-macros/dist/vite.mjs";
import { VitePWA } from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/vite-plugin-pwa/dist/index.js";
import LinkAttributes from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/markdown-it-link-attributes/index.js";
import Shiki from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/@shikijs/markdown-it/dist/index.mjs";
import WebfontDownload from "file:///C:/Users/Mauriel/Desktop/dsp/dspfront/node_modules/vite-plugin-webfont-dl/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\Mauriel\\Desktop\\dsp\\dspfront";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__vite_injected_original_dirname, "src")}/`
    }
  },
  // https://vitejs.dev/config/dep-optimization-options#optimizedeps-include
  optimizeDeps: {
    include: [
      "@cznethub/cznet-vue-core",
      "@fortawesome/fontawesome-free"
    ]
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.md$/]
        })
      }
    }),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "@vueuse/head",
        "@vueuse/core",
        {
          // add any other imports you were relying on
          "vue-router/auto": ["useLink"]
        }
      ],
      dts: "src/auto-imports.d.ts",
      dirs: [
        "src/composables",
        "src/stores"
      ],
      vueTemplate: true
    }),
    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: "src/components.d.ts"
    }),
    // https://github.com/unplugin/unplugin-vue-markdown
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: "prose prose-sm m-auto text-left",
      headEnabled: true,
      async markdownItSetup(md) {
        md.use(LinkAttributes, {
          matcher: (link) => /^https?:\/\//.test(link),
          attrs: {
            target: "_blank",
            rel: "noopener"
          }
        });
        md.use(await Shiki({
          defaultColor: false,
          themes: {
            light: "vitesse-light",
            dark: "vitesse-dark"
          }
        }));
      }
    }),
    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "safari-pinned-tab.svg"],
      manifest: {
        name: "Vitesse",
        short_name: "Vitesse",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    }),
    // https://github.com/feat-agency/vite-plugin-webfont-dl
    WebfontDownload()
  ],
  // https://github.com/vitest-dev/vitest
  test: {
    include: ["test/**/*.test.ts"],
    environment: "jsdom"
  },
  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: "async",
    formatting: "minify",
    onFinished() {
      generateSitemap();
    }
  },
  ssr: {
    // TODO: workaround until they support native ESM
    noExternal: ["workbox-window"]
  },
  server: {
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      host: "127.0.0.1",
      protocol: "ws"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXVyaWVsXFxcXERlc2t0b3BcXFxcZHNwXFxcXGRzcGZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXVyaWVsXFxcXERlc2t0b3BcXFxcZHNwXFxcXGRzcGZyb250XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9NYXVyaWVsL0Rlc2t0b3AvZHNwL2RzcGZyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgVnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IGdlbmVyYXRlU2l0ZW1hcCBmcm9tICd2aXRlLXNzZy1zaXRlbWFwJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5pbXBvcnQgTWFya2Rvd24gZnJvbSAndW5wbHVnaW4tdnVlLW1hcmtkb3duL3ZpdGUnXHJcbmltcG9ydCBWdWVNYWNyb3MgZnJvbSAndW5wbHVnaW4tdnVlLW1hY3Jvcy92aXRlJ1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xyXG5pbXBvcnQgTGlua0F0dHJpYnV0ZXMgZnJvbSAnbWFya2Rvd24taXQtbGluay1hdHRyaWJ1dGVzJ1xyXG5pbXBvcnQgU2hpa2kgZnJvbSAnQHNoaWtpanMvbWFya2Rvd24taXQnXHJcbmltcG9ydCBXZWJmb250RG93bmxvYWQgZnJvbSAndml0ZS1wbHVnaW4td2ViZm9udC1kbCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ34vJzogYCR7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpfS9gLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL2RlcC1vcHRpbWl6YXRpb24tb3B0aW9ucyNvcHRpbWl6ZWRlcHMtaW5jbHVkZVxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAnQGN6bmV0aHViL2N6bmV0LXZ1ZS1jb3JlJyxcclxuICAgICAgJ0Bmb3J0YXdlc29tZS9mb250YXdlc29tZS1mcmVlJyxcclxuICAgIF0sXHJcbiAgfSxcclxuXHJcbiAgcGx1Z2luczogW1xyXG4gICAgVnVlTWFjcm9zKHtcclxuICAgICAgcGx1Z2luczoge1xyXG4gICAgICAgIHZ1ZTogVnVlKHtcclxuICAgICAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC5tZCQvXSxcclxuICAgICAgICB9KSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bnBsdWdpbi1hdXRvLWltcG9ydFxyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFtcclxuICAgICAgICAndnVlJyxcclxuICAgICAgICAnQHZ1ZXVzZS9oZWFkJyxcclxuICAgICAgICAnQHZ1ZXVzZS9jb3JlJyxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAvLyBhZGQgYW55IG90aGVyIGltcG9ydHMgeW91IHdlcmUgcmVseWluZyBvblxyXG4gICAgICAgICAgJ3Z1ZS1yb3V0ZXIvYXV0byc6IFsndXNlTGluayddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIGR0czogJ3NyYy9hdXRvLWltcG9ydHMuZC50cycsXHJcbiAgICAgIGRpcnM6IFtcclxuICAgICAgICAnc3JjL2NvbXBvc2FibGVzJyxcclxuICAgICAgICAnc3JjL3N0b3JlcycsXHJcbiAgICAgIF0sXHJcbiAgICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzXHJcbiAgICBDb21wb25lbnRzKHtcclxuICAgICAgLy8gYWxsb3cgYXV0byBsb2FkIG1hcmtkb3duIGNvbXBvbmVudHMgdW5kZXIgYC4vc3JjL2NvbXBvbmVudHMvYFxyXG4gICAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICdtZCddLFxyXG4gICAgICAvLyBhbGxvdyBhdXRvIGltcG9ydCBhbmQgcmVnaXN0ZXIgY29tcG9uZW50cyB1c2VkIGluIG1hcmtkb3duXHJcbiAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvLCAvXFwubWQkL10sXHJcbiAgICAgIGR0czogJ3NyYy9jb21wb25lbnRzLmQudHMnLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VucGx1Z2luL3VucGx1Z2luLXZ1ZS1tYXJrZG93blxyXG4gICAgLy8gRG9uJ3QgbmVlZCB0aGlzPyBUcnkgdml0ZXNzZS1saXRlOiBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdml0ZXNzZS1saXRlXHJcbiAgICBNYXJrZG93bih7XHJcbiAgICAgIHdyYXBwZXJDbGFzc2VzOiAncHJvc2UgcHJvc2Utc20gbS1hdXRvIHRleHQtbGVmdCcsXHJcbiAgICAgIGhlYWRFbmFibGVkOiB0cnVlLFxyXG4gICAgICBhc3luYyBtYXJrZG93bkl0U2V0dXAobWQpIHtcclxuICAgICAgICBtZC51c2UoTGlua0F0dHJpYnV0ZXMsIHtcclxuICAgICAgICAgIG1hdGNoZXI6IChsaW5rOiBzdHJpbmcpID0+IC9eaHR0cHM/OlxcL1xcLy8udGVzdChsaW5rKSxcclxuICAgICAgICAgIGF0dHJzOiB7XHJcbiAgICAgICAgICAgIHRhcmdldDogJ19ibGFuaycsXHJcbiAgICAgICAgICAgIHJlbDogJ25vb3BlbmVyJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICBtZC51c2UoYXdhaXQgU2hpa2koe1xyXG4gICAgICAgICAgZGVmYXVsdENvbG9yOiBmYWxzZSxcclxuICAgICAgICAgIHRoZW1lczoge1xyXG4gICAgICAgICAgICBsaWdodDogJ3ZpdGVzc2UtbGlnaHQnLFxyXG4gICAgICAgICAgICBkYXJrOiAndml0ZXNzZS1kYXJrJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSkpXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdml0ZS1wbHVnaW4tcHdhXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5zdmcnLCAnc2FmYXJpLXBpbm5lZC10YWIuc3ZnJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ1ZpdGVzc2UnLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdWaXRlc3NlJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9wd2EtMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9wd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9wd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmVhdC1hZ2VuY3kvdml0ZS1wbHVnaW4td2ViZm9udC1kbFxyXG4gICAgV2ViZm9udERvd25sb2FkKCksXHJcbiAgXSxcclxuXHJcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVzdC1kZXYvdml0ZXN0XHJcbiAgdGVzdDoge1xyXG4gICAgaW5jbHVkZTogWyd0ZXN0LyoqLyoudGVzdC50cyddLFxyXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgfSxcclxuXHJcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3ZpdGUtc3NnXHJcbiAgc3NnT3B0aW9uczoge1xyXG4gICAgc2NyaXB0OiAnYXN5bmMnLFxyXG4gICAgZm9ybWF0dGluZzogJ21pbmlmeScsXHJcbiAgICBvbkZpbmlzaGVkKCkge1xyXG4gICAgICBnZW5lcmF0ZVNpdGVtYXAoKVxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICBzc3I6IHtcclxuICAgIC8vIFRPRE86IHdvcmthcm91bmQgdW50aWwgdGhleSBzdXBwb3J0IG5hdGl2ZSBFU01cclxuICAgIG5vRXh0ZXJuYWw6IFsnd29ya2JveC13aW5kb3cnXSxcclxuICB9LFxyXG5cclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIGhtcjoge1xyXG4gICAgICBob3N0OiAnMTI3LjAuMC4xJyxcclxuICAgICAgcHJvdG9jb2w6ICd3cycsXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlMsT0FBTyxVQUFVO0FBQzlULFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLHFCQUFxQjtBQUM1QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGNBQWM7QUFDckIsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsZUFBZTtBQUN4QixPQUFPLG9CQUFvQjtBQUMzQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxxQkFBcUI7QUFYNUIsSUFBTSxtQ0FBbUM7QUFhekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsTUFBTSxHQUFHLEtBQUssUUFBUSxrQ0FBVyxLQUFLLENBQUM7QUFBQSxJQUN6QztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLFVBQVU7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNQLEtBQUssSUFBSTtBQUFBLFVBQ1AsU0FBUyxDQUFDLFVBQVUsT0FBTztBQUFBLFFBQzdCLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUdELFdBQVc7QUFBQSxNQUNULFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUE7QUFBQSxVQUVFLG1CQUFtQixDQUFDLFNBQVM7QUFBQSxRQUMvQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxRQUNKO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLGFBQWE7QUFBQSxJQUNmLENBQUM7QUFBQTtBQUFBLElBR0QsV0FBVztBQUFBO0FBQUEsTUFFVCxZQUFZLENBQUMsT0FBTyxJQUFJO0FBQUE7QUFBQSxNQUV4QixTQUFTLENBQUMsVUFBVSxjQUFjLE9BQU87QUFBQSxNQUN6QyxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQTtBQUFBLElBSUQsU0FBUztBQUFBLE1BQ1AsZ0JBQWdCO0FBQUEsTUFDaEIsYUFBYTtBQUFBLE1BQ2IsTUFBTSxnQkFBZ0IsSUFBSTtBQUN4QixXQUFHLElBQUksZ0JBQWdCO0FBQUEsVUFDckIsU0FBUyxDQUFDLFNBQWlCLGVBQWUsS0FBSyxJQUFJO0FBQUEsVUFDbkQsT0FBTztBQUFBLFlBQ0wsUUFBUTtBQUFBLFlBQ1IsS0FBSztBQUFBLFVBQ1A7QUFBQSxRQUNGLENBQUM7QUFDRCxXQUFHLElBQUksTUFBTSxNQUFNO0FBQUEsVUFDakIsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFlBQ04sT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxRQUNGLENBQUMsQ0FBQztBQUFBLE1BQ0o7QUFBQSxJQUNGLENBQUM7QUFBQTtBQUFBLElBR0QsUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsdUJBQXVCO0FBQUEsTUFDdEQsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUdELGdCQUFnQjtBQUFBLEVBQ2xCO0FBQUE7QUFBQSxFQUdBLE1BQU07QUFBQSxJQUNKLFNBQVMsQ0FBQyxtQkFBbUI7QUFBQSxJQUM3QixhQUFhO0FBQUEsRUFDZjtBQUFBO0FBQUEsRUFHQSxZQUFZO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixZQUFZO0FBQUEsSUFDWixhQUFhO0FBQ1gsc0JBQWdCO0FBQUEsSUFDbEI7QUFBQSxFQUNGO0FBQUEsRUFFQSxLQUFLO0FBQUE7QUFBQSxJQUVILFlBQVksQ0FBQyxnQkFBZ0I7QUFBQSxFQUMvQjtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0gsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
