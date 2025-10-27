const mongoose = require("mongoose");

// Debug: Log environment variables
console.log("MONGO_URL:", process.env.MONGO_URL);
console.log("DB_SAMANYAY:", process.env.DB_SAMANYAY);
console.log("Using connection string:", process.env.MONGO_URL || process.env.DB_SAMANYAY || "mongodb://127.0.0.1:27017/Samanyay_v2");

mongoose.connect(process.env.MONGO_URL || process.env.DB_SAMANYAY || "mongodb://127.0.0.1:27017/Samanyay_v2");
const plm = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  name: String,
  email: String,
  phone: String,

  // for oauth
  google_id: String,
  displayName: String,
  photo: String,

});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
