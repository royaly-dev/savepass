import type { Configuration } from 'webpack';

import { mainRules as rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const mainConfig: Configuration = {
  entry: { index: './src/index.ts', SideWorker: './src/SideWorker.ts' },
  output: {
    filename: '[name].js'
  },
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
