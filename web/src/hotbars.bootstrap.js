module.exports = async function (config) {
  // Add services to file watcher
  config.addToWatch("services");

  return {};
};