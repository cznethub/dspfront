// const ImageminPlugin = require('imagemin-webpack-plugin').default
// const defaultFileLoaderOptionsGenerator = require("webpack-image-resize-loader/dist/index").defaultFileLoaderOptionsGenerator
process.env.VUE_APP_VERSION = process.env.npm_package_version;

const configureWebpack = (config) => {
  if (process.env.NODE_ENV !== "development") {
    // prevent class name mangling
    config.optimization.minimizer[0].options.terserOptions.keep_classnames = true;
    // config.plugins.push(new ImageminPlugin())
  }
};

const chainWebpack = (config) => {
  // Used in img tags.
  // config.module
  //   .rule("images-srcset")
  //   .before("images")
  //   .test(/\.(png|jpe?g|webp|tiff?)$/i)
  //   // if the import url looks like "some.png?srcset..."
  //   .oneOf("srcset")
  //   .resourceQuery(/srcset.*native/)
  //   .use("srcset")
  //   .loader("webpack-image-srcset-loader")
  //   .options({
  //     sizes: ["480w", "1024w", "1920w", "original"],
  //     esModule: false,
  //   })

  // // Used with background-image: -webkit-image-set...
  // config.module
  //   .rule("images-srcset-webkit")
  //   .before("images")
  //   .test(/\.(png|jpe?g|webp|tiff?)$/i)
  //   // if the import url looks like "some.png?srcset..."
  //   .oneOf("srcset")
  //   .resourceQuery(/srcset.*webkit/)
  //   .use("srcset")
  //   .loader("webpack-image-srcset-loader")
  //   .options({
  //     sizes: ["1x", "2x"],
  //     esModule: false,
  //   })

  // config.module
  //   .rule("images-resize")
  //   .after("images")
  //   .test(/\.(png|jpe?g|webp|tiff?)$/i)
  //   // if the import url looks like "some.png?srcset..."
  //   .oneOf("srcset")
  //   .resourceQuery(/srcset/)
  //   .use("resize")
  //   .loader("webpack-image-resize-loader")
  //   .options({
  //     fileLoader: "url-loader",
  //     fileLoaderOptionsGenerator: (options, existingOptions) => ({
  //       ...existingOptions,
  //       fallback: {
  //         ...existingOptions.fallback,
  //         options: {
  //           ...defaultFileLoaderOptionsGenerator(
  //             options,
  //             existingOptions.fallback.options
  //           ),
  //         },
  //       },
  //     }),
  //   })

  // config.module
  //   .rule('babel')
  //   .test(/\.(js|jsx|tsx)$/i)
  //     .exclude
  //       .add('/node_modules/**')
  //       .end()
  //   .use('babel-loader')
  //   .loader('babel-loader')
  // .query(['es2015', 'stage-3', 'env', 'vue'])

  config.module
    .rule("vuetify")
    .test("/.s(c|a)ss$/")
    .use(["vue-style-loader", "css-loader"])
    .loader("sass-loader")
    .options({
      implementation: require("sass"),
      indentedSyntax: true, // optional
    })
    .options({
      implementation: require("sass"),
      sassOptions: {
        indentedSyntax: true, // optional
      },
    });
};

module.exports = {
  chainWebpack,
  configureWebpack,
  devServer: {
    disableHostCheck: true,
  },
  transpileDependencies: ["@cznethub/cznet-vue-core"],
};
