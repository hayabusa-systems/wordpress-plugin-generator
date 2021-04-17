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
    if (plugin.version === undefined) {
      console.error('undefined version in plugin object');
      return false;
    } else if (!plugin.version) {
      console.error('version in plugin object is required.');
      return false;
    }
    if (plugin.author === undefined) {
      console.error('undefined author in plugin object');
      return false;
    } else if (!plugin.author) {
      console.error('author in plugin object is required.');
      return false;
    }
    if (plugin.requires_php === undefined) {
      console.error('undefined requires_php in plugin object');
      return false;
    } else if (!plugin.requires_php) {
      console.error('requires_php in plugin object is required.');
      return false;
    }
    if (plugin.license === undefined) {
      console.error('undefined license in plugin object');
      return false;
    } else if (!plugin.license) {
      console.error('license in plugin object is required.');
      return false;
    }
  }
  return true;
};
