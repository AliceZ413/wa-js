const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const packageJSON = require('./package.json');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const isSlim = Boolean(env.slim);
  const srcPath = path.resolve(__dirname, 'src');

  return {
    entry: isSlim ? './src/index.slim.ts' : './src/index.ts',
    mode: isDevelopment ? 'development' : 'production',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        fs: false,
      },
      ...(isSlim
        ? {
            alias: {
              [path.join(srcPath, 'gtag/index.ts')]: path.join(
                srcPath,
                'gtag/stub.ts'
              ),
              [path.join(srcPath, 'eventEmitter/eventTypes.ts')]: path.join(
                srcPath,
                'eventEmitter/eventTypes.slim.ts'
              ),
              [path.join(srcPath, 'chat/index.ts')]: path.join(
                srcPath,
                'chat/index.slim.ts'
              ),
              [path.join(srcPath, 'chat/functions/index.ts')]: path.join(
                srcPath,
                'chat/functions/index.slim.ts'
              ),
              [path.join(srcPath, 'chat/events/index.ts')]: path.join(
                srcPath,
                'chat/events/index.slim.ts'
              ),
            },
          }
        : {}),
    },
    output: {
      filename: isSlim ? 'wppconnect-wa.slim.js' : 'wppconnect-wa.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        name: 'WPP',
        type: 'global',
      },
    },
    ...(!isDevelopment ? { optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments:(astNode, comment) => /wa-js v/.test(comment.value),
            },
          },
          extractComments: true,
        }),
      ],
    } } : {})
    ,
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.DefinePlugin({
        __VERSION__: `'${packageJSON.version}'`,
        __SUPPORTED_WHATSAPP_WEB__: `'${packageJSON.engines['whatsapp-web']}'`,
      }),
      new webpack.BannerPlugin({
        banner: `/*! wppconnect-team/wa-js v${packageJSON.version} */\n`,
        entryOnly: true,
        raw: true
      })
    ],
  };
};
