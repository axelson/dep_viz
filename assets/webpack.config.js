const path = require('path');
const glob = require('glob');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function maybeAnalyzeBundle(plugins) {
  if (process.env.ANALYZE_WEBPACK === 'true') {
    plugins.push(new BundleAnalyzerPlugin());
  }
  return plugins;
}

module.exports = (env, options) => {
  const devMode = options.mode !== 'production';

  return {
    optimization: {
      minimizer: [
        new TerserPlugin({ cache: true, parallel: true, sourceMap: devMode }),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    entry: {
      'app': glob.sync('./vendor/**/*.js').concat(['./js/app.js']),
      'graphviz': glob.sync('./vendor/**/*.js').concat(['./js/graphviz.js']),
      'graph_worker': glob.sync('./vendor/**/*.js').concat(['./js/graph_worker.js'])
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../priv/static/js'),
      publicPath: '/js/'
    },
    devtool: devMode ? 'eval-cheap-module-source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.[s]?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        }
      ]
    },
    plugins: maybeAnalyzeBundle([
      new MiniCssExtractPlugin({ filename: '../css/app.css' }),
      new CopyWebpackPlugin([{ from: 'static/', to: '../' }]),
      new CopyWebpackPlugin([{ from: 'node_modules/@hpcc-js/wasm/dist/graphvizlib.wasm', to: '../js/' }])
    ])
    .concat(devMode ? [new HardSourceWebpackPlugin()] : [])
  }
};
