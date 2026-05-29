# Main User App

Expo app for the customer-facing Chatori Jeeb experience.

## Generate a Play Console AAB

This project is set up to produce an Android App Bundle (`.aab`) with EAS Build:

```bash
npm run android:aab
```

That command uses the `production` profile from `eas.json`, which is configured for:

- Android `app-bundle` output
- automatic version code incrementation
- production API configuration

For local Gradle release builds, add a `keystore.properties` file next to `package.json` by copying `keystore.properties.example` and filling in your real upload-key values.

## Before uploading to Play Console

1. Make sure the build completes successfully in EAS.
2. Download the generated `.aab` from the EAS dashboard.
3. Upload it to the Google Play Console under the correct app listing.

## Local development

```bash
npm install
npm run start
```
