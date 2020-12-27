const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: [
    './src/index.ts',
    './src/styles.css'
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        "use": {
          "loader": "babel-loader",
          "options": {
            "presets": [
              ["@babel/preset-env", {
                targets: {
                  esmodules: true
                }
              }],
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              sourceMap: true,
            }
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      },
      {
        test: /\.png|webp$/,
        exclude: /node_modules/,
        use: {
          loader: "file-loader"
        }
      },
      {
          test: /\.(jpg|png)$/,
          use: {
            loader: 'url-loader',
          },
        },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './src/index.html',
      filename: './index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './assets/models', to: './assets/models' }
      ]
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    open: true,
    watchOptions: {
      poll: true,
      ignored: ['assets/**', 'node_modules/**']
    },
    disableHostCheck: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        parallel: true,
        cache: false,
      }),
    ],
  },
};