'use script';

module.exports.validate = function validate(config) {
  if (config.plugin === undefined) {
    console.error('undefined plugin in top-level');
    return false;
  } else {
    const plugin = config.plugin;
    if (plugin.name === undefined) {
      console.error('undefined name in plugin object');
      return false;
    } else if (!plugin.name) {
      console.error('name in plugin object is required.');
      return false;
    }
  }
  return true;
};
