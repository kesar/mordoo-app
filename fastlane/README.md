fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios download_metadata

```sh
[bundle exec] fastlane ios download_metadata
```

Download existing metadata from App Store Connect

### ios upload_metadata

```sh
[bundle exec] fastlane ios upload_metadata
```

Upload metadata to App Store Connect

### ios upload_screenshots

```sh
[bundle exec] fastlane ios upload_screenshots
```

Upload screenshots to App Store Connect

### ios deliver_all

```sh
[bundle exec] fastlane ios deliver_all
```

Upload everything (metadata + screenshots) to App Store Connect

### ios sync

```sh
[bundle exec] fastlane ios sync
```

Download all metadata from App Store Connect

### ios assign_build

```sh
[bundle exec] fastlane ios assign_build
```

Assign latest build to the app store version

### ios set_age_rating

```sh
[bundle exec] fastlane ios set_age_rating
```

Set age rating for the app

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
