const JWT = require('jsonwebtoken');
const JWT_SECRECT = require('../cipher').JWT_SECRECT;

module.exports = function(options) {
  return function(req, res, next) {
    try {
      const auth = req.get('Authorization');
      if (!auth) throw new Error('No Auth');
      let authList = auth.split(' ');
      const token = authList[1];
      if (!auth || auth.length < 2) {
        next(new Error('No auth'));
        return;
      }
        const obj = JWT.verify(token, JWT_SECRECT);
        if (!obj || !obj._id || !obj.expire) throw new Error('No auth');
        if (Date.now() - obj.expire > 0) throw new Error('Token has expired');
        next();
    } catch (e) {
      res.statusCode = 401;
      next(e);
    }
  }
}