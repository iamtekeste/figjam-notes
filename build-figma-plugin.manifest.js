module.exports = function (manifest) {
  return {
    ...manifest,
    containsWidget: true,
    permissions: ["currentuser", "activeusers"],
    widgetApi: "1.0.0"
  };
};
