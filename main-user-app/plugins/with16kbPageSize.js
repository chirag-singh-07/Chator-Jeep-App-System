const { withGradleProperties, withAppBuildGradle } = require('@expo/config-plugins');

/**
 * This plugin enables 16 KB memory page size support required by Google Play
 * for apps targeting Android API 35+ (mandatory from Nov 2025).
 *
 * Two changes are needed:
 * 1. gradle.properties: android.experimental.pageAlignment=16k (tells the build system)
 * 2. app/build.gradle: Add the linker flag -Wl,-z,max-page-size=16384 so NDK-compiled
 *    native .so libraries are aligned to 16 KB pages at link time.
 */
module.exports = function with16kbPageSize(config) {
  // Step 1: Set the gradle.properties flag
  config = withGradleProperties(config, (config) => {
    // Remove any existing pageAlignment entry to avoid duplicates
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'android.experimental.pageAlignment')
    );
    config.modResults.push({
      type: 'property',
      key: 'android.experimental.pageAlignment',
      value: '16k',
    });
    return config;
  });

  // Step 2: Inject the NDK linker flag into app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Only inject if not already present
    if (buildGradle.includes('-Wl,-z,max-page-size=16384')) {
      return config;
    }

    // Inject packaging options for 16KB page size after the `android {` block opens
    // We add an externalNativeBuild / packagingOptions section inside defaultConfig
    const defaultConfigBlock = `defaultConfig {`;
    const linkerFlagBlock = `defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags "-Wl,-z,max-page-size=16384"
                abiFilters "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
                arguments "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"
            }
        }`;

    if (buildGradle.includes(defaultConfigBlock)) {
      config.modResults.contents = buildGradle.replace(
        defaultConfigBlock,
        linkerFlagBlock
      );
    }

    return config;
  });

  return config;
};
