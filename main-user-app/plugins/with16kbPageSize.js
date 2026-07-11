const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function with16kbPageSize(config) {
  return withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'android.experimental.pageAlignment',
      value: '16k',
    });
    return config;
  });
};
