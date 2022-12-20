module.exports = (req) => {
  if (!process.env.HOTBARS_DEV) {
    return req;
  }

  return function requireFresh(module) {
    if (process.env.HOTBARS_DEV) {
      delete req.cache[req.resolve(module)];
    }

    return req(module);
  };
};
