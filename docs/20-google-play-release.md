# Google Play Release

## Current State
- AAB files found in app directories (`ChatoriJeeb-UserApp-Release-v12-SDK35-16KB.aab`, etc.).
- Keystore templates exist.

## Recommended Architecture
During Flutter migration, ensure the same `applicationId` (package name) and keystore are used to update the existing Play Store apps seamlessly.

## Warnings
Do not expose actual keystore passwords or service account JSONs in logs or unencrypted files.
