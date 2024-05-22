module.exports = (req) => {
  if (!process.env.HOTBARS_LOCAL) {
    return req;
  }

  return function requireFresh(module) {
    if (process.env.HOTBARS_LOCAL) {
      delete req.cache[req.resolve(module)];
    }

    return req(module);
  };
};
