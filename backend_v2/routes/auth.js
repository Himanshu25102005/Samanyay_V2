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
      console.log("=== LOCAL STRATEGY AUTH ===");
      console.log("Email:", email);
      
      // Use passport-local-mongoose authenticate method
      const result = await userModel.authenticate()(email, password);
      console.log("Auth result:", result);
      
      if (result.user) {
        console.log("Authentication successful, user:", result.user);
        console.log("User._id:", result.user._id);
        return done(null, result.user);
      } else {
        console.log("Authentication failed");
        return done(null, false, { message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error("Local strategy error:", error);
      return done(error);
    }
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://backendv2-for-dep-production.up.railway.app/api/google/callback",
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
    console.log("=== SERIALIZE USER ===");
    console.log("User object:", user);
    console.log("User._id:", user._id);
    console.log("User.id:", user.id);
    console.log("User keys:", Object.keys(user));
    
    if (!user._id) {
        console.error("No _id found in user object!");
        return done(new Error("User object missing _id"), null);
    }
    
    done(null, user._id);
})

passport.deserializeUser(async (id, done) => {
    try{
        const user = await userModel.findById(id);
        done(null, user);
    }catch(error){
        done(error, null);
    }
});