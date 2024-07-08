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
    include: ["@cznethub/cznet-vue-core", "@fortawesome/fontawesome-free"]
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
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXVyaWVsXFxcXERlc2t0b3BcXFxcZHNwXFxcXGRzcGZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXVyaWVsXFxcXERlc2t0b3BcXFxcZHNwXFxcXGRzcGZyb250XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9NYXVyaWVsL0Rlc2t0b3AvZHNwL2RzcGZyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgVnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IGdlbmVyYXRlU2l0ZW1hcCBmcm9tICd2aXRlLXNzZy1zaXRlbWFwJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5pbXBvcnQgTWFya2Rvd24gZnJvbSAndW5wbHVnaW4tdnVlLW1hcmtkb3duL3ZpdGUnXHJcbmltcG9ydCBWdWVNYWNyb3MgZnJvbSAndW5wbHVnaW4tdnVlLW1hY3Jvcy92aXRlJ1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xyXG5pbXBvcnQgTGlua0F0dHJpYnV0ZXMgZnJvbSAnbWFya2Rvd24taXQtbGluay1hdHRyaWJ1dGVzJ1xyXG5pbXBvcnQgU2hpa2kgZnJvbSAnQHNoaWtpanMvbWFya2Rvd24taXQnXHJcbmltcG9ydCBXZWJmb250RG93bmxvYWQgZnJvbSAndml0ZS1wbHVnaW4td2ViZm9udC1kbCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ34vJzogYCR7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpfS9gLFxyXG4gICAgfSxcclxuICB9LFxyXG5cclxuICAvLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL2RlcC1vcHRpbWl6YXRpb24tb3B0aW9ucyNvcHRpbWl6ZWRlcHMtaW5jbHVkZVxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogWydAY3puZXRodWIvY3puZXQtdnVlLWNvcmUnLCAnQGZvcnRhd2Vzb21lL2ZvbnRhd2Vzb21lLWZyZWUnXSxcclxuICB9LFxyXG5cclxuICBwbHVnaW5zOiBbXHJcbiAgICBWdWVNYWNyb3Moe1xyXG4gICAgICBwbHVnaW5zOiB7XHJcbiAgICAgICAgdnVlOiBWdWUoe1xyXG4gICAgICAgICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLm1kJC9dLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3VucGx1Z2luLWF1dG8taW1wb3J0XHJcbiAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgaW1wb3J0czogW1xyXG4gICAgICAgICd2dWUnLFxyXG4gICAgICAgICdAdnVldXNlL2hlYWQnLFxyXG4gICAgICAgICdAdnVldXNlL2NvcmUnLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIC8vIGFkZCBhbnkgb3RoZXIgaW1wb3J0cyB5b3Ugd2VyZSByZWx5aW5nIG9uXHJcbiAgICAgICAgICAndnVlLXJvdXRlci9hdXRvJzogWyd1c2VMaW5rJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcclxuICAgICAgZGlyczogW1xyXG4gICAgICAgICdzcmMvY29tcG9zYWJsZXMnLFxyXG4gICAgICAgICdzcmMvc3RvcmVzJyxcclxuICAgICAgXSxcclxuICAgICAgdnVlVGVtcGxhdGU6IHRydWUsXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tdnVlLWNvbXBvbmVudHNcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAvLyBhbGxvdyBhdXRvIGxvYWQgbWFya2Rvd24gY29tcG9uZW50cyB1bmRlciBgLi9zcmMvY29tcG9uZW50cy9gXHJcbiAgICAgIGV4dGVuc2lvbnM6IFsndnVlJywgJ21kJ10sXHJcbiAgICAgIC8vIGFsbG93IGF1dG8gaW1wb3J0IGFuZCByZWdpc3RlciBjb21wb25lbnRzIHVzZWQgaW4gbWFya2Rvd25cclxuICAgICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLnZ1ZVxcP3Z1ZS8sIC9cXC5tZCQvXSxcclxuICAgICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW5wbHVnaW4vdW5wbHVnaW4tdnVlLW1hcmtkb3duXHJcbiAgICAvLyBEb24ndCBuZWVkIHRoaXM/IFRyeSB2aXRlc3NlLWxpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS92aXRlc3NlLWxpdGVcclxuICAgIE1hcmtkb3duKHtcclxuICAgICAgd3JhcHBlckNsYXNzZXM6ICdwcm9zZSBwcm9zZS1zbSBtLWF1dG8gdGV4dC1sZWZ0JyxcclxuICAgICAgaGVhZEVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIGFzeW5jIG1hcmtkb3duSXRTZXR1cChtZCkge1xyXG4gICAgICAgIG1kLnVzZShMaW5rQXR0cmlidXRlcywge1xyXG4gICAgICAgICAgbWF0Y2hlcjogKGxpbms6IHN0cmluZykgPT4gL15odHRwcz86XFwvXFwvLy50ZXN0KGxpbmspLFxyXG4gICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJyxcclxuICAgICAgICAgICAgcmVsOiAnbm9vcGVuZXInLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIG1kLnVzZShhd2FpdCBTaGlraSh7XHJcbiAgICAgICAgICBkZWZhdWx0Q29sb3I6IGZhbHNlLFxyXG4gICAgICAgICAgdGhlbWVzOiB7XHJcbiAgICAgICAgICAgIGxpZ2h0OiAndml0ZXNzZS1saWdodCcsXHJcbiAgICAgICAgICAgIGRhcms6ICd2aXRlc3NlLWRhcmsnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KSlcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS92aXRlLXBsdWdpbi1wd2FcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLnN2ZycsICdzYWZhcmktcGlubmVkLXRhYi5zdmcnXSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiAnVml0ZXNzZScsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ1ZpdGVzc2UnLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL3B3YS0xOTJ4MTkyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL3B3YS01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL3B3YS01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZWF0LWFnZW5jeS92aXRlLXBsdWdpbi13ZWJmb250LWRsXHJcbiAgICBXZWJmb250RG93bmxvYWQoKSxcclxuICBdLFxyXG5cclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdml0ZXN0LWRldi92aXRlc3RcclxuICB0ZXN0OiB7XHJcbiAgICBpbmNsdWRlOiBbJ3Rlc3QvKiovKi50ZXN0LnRzJ10sXHJcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcclxuICB9LFxyXG5cclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdml0ZS1zc2dcclxuICBzc2dPcHRpb25zOiB7XHJcbiAgICBzY3JpcHQ6ICdhc3luYycsXHJcbiAgICBmb3JtYXR0aW5nOiAnbWluaWZ5JyxcclxuICAgIG9uRmluaXNoZWQoKSB7XHJcbiAgICAgIGdlbmVyYXRlU2l0ZW1hcCgpXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIHNzcjoge1xyXG4gICAgLy8gVE9ETzogd29ya2Fyb3VuZCB1bnRpbCB0aGV5IHN1cHBvcnQgbmF0aXZlIEVTTVxyXG4gICAgbm9FeHRlcm5hbDogWyd3b3JrYm94LXdpbmRvdyddLFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlMsT0FBTyxVQUFVO0FBQzlULFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLHFCQUFxQjtB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
