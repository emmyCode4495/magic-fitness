module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 54) auto-adds the react-native-worklets plugin
    // required by Reanimated 4. It must stay last if you ever add plugins manually.
    presets: ['babel-preset-expo'],
  };
};
