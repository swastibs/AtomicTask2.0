const bodyNormalizer = (req, _res, next) => {
  if (!req.body) {
    req.body = {};
  }
  next();
};

export default bodyNormalizer;
