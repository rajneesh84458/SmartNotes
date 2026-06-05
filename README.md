📦 AppsAirPush Integration Guide (React Native)
🚀 Overview
OTA (Over-The-Air) update solution for React Native apps
Push JavaScript & assets updates without Play Store / App Store release
Helps in hotfixes, UI changes, feature toggles instantly

Setup Account & App
Create account on AppsAirPush dashboard
Create a new app
Copy:
APP_ID
LICENSE_KEY

npm install -g appsairpush-cli
npm install appsairpush-react-native react-native-fs react-native-restart

cd ios && pod install && cd ..

⚙️ Environment Configuration
.env

# Setup Instructions

1. Copy the example file:

```sh
cp android/app/src/main/res/values/strings.xml.example android/app/src/main/res/values/strings.xml
```
