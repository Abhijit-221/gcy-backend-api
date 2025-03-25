const passport = require("passport");
const { CustomResponse, ResponseCode } = require("../config/constants");
const { Customer } = require("../models/customer/customer");
const {Strategy:JwtStrategy,ExtractJwt} = require('passport-jwt');

const response = new CustomResponse();
const CustomerAuth = (req, res, next) => {
  passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SCRETKEY
    },
    async (payload, done) => {
      // console.log("payload:", payload, 'done:', done);
      try {
        let user = await Customer.findOne({ _id: payload.id, isDeleted: false }).select({ "password": 0 });
        // console.log('user:', user);
        if (user) {
          return done(null, user);
        }
        else {
          return done(null, false);
        }
      } catch (error) {
        return done(null, false);
      }
    }
  ));
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    // console.log('err:', err);
    // console.log('user:', user);
    // console.log('info:', info);
    if (err) {
      return res.status(ResponseCode.UNAUTHORIZED).json(
        response.setUnauthorized(err, "Invalid token.")
      )
    }
    if (!user) {
      if (info?.name === "TokenExpiredError") {
        return res.status(ResponseCode.UNAUTHORIZED).json(
          response.setUnauthorized("TokenExpiredError", "Token has expired.")
        )
      }
      if (info?.name === "JsonWebTokenError") {
        return res.status(ResponseCode.UNAUTHORIZED).json(
          response.setUnauthorized("JsonWebTokenError", info.message || "Invalid JWT token")
        )
      }
      return res.status(ResponseCode.UNAUTHORIZED).json(
        response.setUnauthorized("Unauthorized", info.message || "Authentication failed")
      )

    }
    req.user = user;
    next();
  })(req, res, next);

};
module.exports = CustomerAuth;