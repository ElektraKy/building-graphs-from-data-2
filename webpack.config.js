/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.0.2.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require("copy-webpack-plugin")
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizerPlugin = require('@yworks/optimizer/webpack-plugin')

const baseConfig = {
  entry: {
    app: ['./src/SampleApplication.ts']
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        yfiles: {
          test: /[\/]yfiles[\/]/,
          name: 'yfiles',
          chunks: 'all',
          priority: 10
        },
        vendors: {
          test: /[\/]node_modules[\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [  
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader,'css-loader'],
        sideEffects: true
      },
      {
        test: /\.(png|svg|jpg|gif|graphml)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: '**',
          to: '',
          globOptions: { 
            ignore: ['**/*.{html,js,ts}'] 
          },
          context: path.join(__dirname, 'src')
        }
      ],
    }),
    // Inject the bundle script tags into the html page
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      inject: 'body'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  output: {
    filename: '[name].js'
  },
  target: ['web']
}

const devConfig = {
  mode: 'development',
  // default devtool needs to be disabled for the SourceMapDevToolPlugin below to be used
  devtool: false,
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      // add source maps for non-library code to enable convenient debugging
      exclude: ['yfiles.js']
    })
  ]
}

const prodConfig = {
  mode: 'production',
  plugins: [
    new OptimizerPlugin({
      logLevel: 'info'
    })
  ],
  optimization: {
    minimizer: [
      // don't minimize the yfiles chunk to save some time
      // (yfiles is already minimized)
      new TerserPlugin({
        exclude: /^yfiles\./
      })
    ]
  },
  output: {
    filename: '[name].[contenthash].js'
  }
}

module.exports = function (env, options) {
  if (options.mode === 'development') {
    console.log('Running webpack in development mode...')
    return merge(baseConfig, devConfig)
  } else {
    console.log('Running webpack in production mode...')
    return merge(baseConfig, prodConfig)
  }
}