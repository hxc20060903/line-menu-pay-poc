import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import glob from 'glob';
import { fromPairs } from 'lodash';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const LAMBDA_SRC = path.resolve('src', 'lambda');
const LAMBDA_DEST = path.resolve('iac', 'dist');

const analyzeBundle = process.env.ANALYZE_BUNDLE === 'true';

/** @returns {import('webpack').Configuration} */
module.exports = () => {
  const lambdas = glob.sync(path.resolve(LAMBDA_SRC, '*'));
  return {
    target: 'node',
    mode: 'production',
    devtool: 'source-map',
    entry: fromPairs(
      lambdas.map((folder) => {
        const name = path.basename(folder);
        return [`${name}/index`, path.resolve(folder, 'index.ts')];
      })
    ),
    output: {
      path: path.join(LAMBDA_DEST),
      filename: '[name].js',
      libraryTarget: 'commonjs',
      // our code: `exports const handler = ....`;
      libraryExport: ['handler'],
      // AWS uses `exports.handler`
      library: 'handler',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.json', '.js', '.jsx'],
      plugins: [new TsconfigPathsPlugin()],
      alias: {
        'bignumber.js': path.resolve(__dirname, 'node_modules/bignumber.js/bignumber.js'),
      },
    },
    optimization: {
      emitOnErrors: false,
      usedExports: true,
    },
    externals: [/^aws-cdk/],
    plugins: [new CaseSensitivePathsPlugin(), analyzeBundle && new BundleAnalyzerPlugin()].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'ts-loader'],
        },
        // https://stackoverflow.com/questions/50978032/cant-import-aws-sdk-using-webpack-and-npm-installed-aws-sdk
        {
          type: 'javascript/auto',
          test: /\.json$/,
          use: 'json-loader',
        },
      ],
    },
  };
};
