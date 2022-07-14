const webpack = require('webpack');

function configureFallbacks(webpackConfig) {
  const fallback = webpackConfig.resolve.fallback || {};
  Object.assign(fallback, {
    "assert": require.resolve("assert/"),
    "buffer": require.resolve("buffer"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "path": require.resolve("path-browserify"),
    "stream": require.resolve("stream-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "url": require.resolve("url/"),
    "util": require.resolve("util/"),
  });
  webpackConfig.resolve.fallback = fallback;
  webpackConfig.plugins = (webpackConfig.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]);
}

module.exports = {
  babel: {
    plugins: [
      // for emit and read metadata from typescript decorators
      'babel-plugin-transform-typescript-metadata'
    ],
  },
  webpack: {
    configure: (webpackConfig) => { 
      configureFallbacks(webpackConfig);
      return webpackConfig;
    }
  }
};
