import type { Configuration } from 'webpack';

import { rendererRules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import path from 'path';

const rules = [
  ...rendererRules,
  {
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
  },
];

export const rendererConfig: Configuration = {
  target: 'web',
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      events: require.resolve('events/'),
    },
  },
};
