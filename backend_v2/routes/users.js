const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Samanyay_v2");
const plm = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  name: String,
  email: String,

  // for oauth
  google_id: Number,
  displayName: String,
  photo: String,

});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
