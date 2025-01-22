const passport = require('passport');
const {Strategy:JwtStrategy,ExtractJwt} = require('passport-jwt');
const { Customer } = require('../models/customer/customer');

passport.use(new JwtStrategy(
    {
        jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey:process.env.SCRETKEY
    },
    async(payload,done)=>{
        console.log("payload:",payload,'done:',done);
        try{
            let user = await Customer.findOne({id:payload.id,isDeleted:false});
            console.log('user:',user);
            if(user){
                return done(null,user);
            }
            else{
                return done(null,false);
            }
        }catch(error){
            return done(null,false);
        }
    }
));