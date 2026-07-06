const { withAndroidManifest, withGradleProperties, withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');

function withExtractNativeLibs(config) {
  // Step 1: Set android:extractNativeLibs="true" in AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    const app = androidManifest.application[0];
    app.$['android:extractNativeLibs'] = "true";
    return config;
  });

  // Step 2: Set NDK version in gradle.properties
  config = withGradleProperties(config, (config) => {
    // Remove existing android.ndkVersion if present
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'android.ndkVersion')
    );
    // Add NDK 29
    config.modResults.push({
      type: 'property',
      key: 'android.ndkVersion',
      value: '29.0.13113456',
    });
    return config;
  });

  // Step 3: Patch root build.gradle to override hardcoded NDK version
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Replace hardcoded ndkVersion with property-based one
    contents = contents.replace(
      /ndkVersion\s*=\s*"26\.1\.10909125"/,
      'ndkVersion = findProperty(\'android.ndkVersion\') ?: "29.0.13113456"'
    );

    config.modResults.contents = contents;
    return config;
  });

  return config;
}

module.exports = withExtractNativeLibs;
