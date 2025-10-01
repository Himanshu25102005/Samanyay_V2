require('dotenv').config();

var GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const userModel = require("./users");
const passport = require('passport');

// Local Strategy for username/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Use email as username
    passwordField: 'password'
  },
  async function(email, password, done) {
    try {
      // Use passport-local-mongoose authenticate method
      const user = await userModel.authenticate()(email, password);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password' });
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/google/callback",
    scope: ['profile', 'email']
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      console.log('Google Profile:', profile);
      
      const user = await userModel.findOne({ google_id: profile.id});
      
      if (user) {
        return cb(null, user);
        console.log('User found:', user);
      } else {
        const newUser = await userModel.create({
          google_id: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
        });
        
        return cb(null, newUser);
      }
    } catch (error) {
      return cb(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    try{
        const user = await userModel.findById(id);
        done(null, user);
    }catch(error){
        done(error, null);
    }
});