const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  googleId: String,
  email: { type: String, required: true, unique: true },
  picture: String,
});

const userModal=mongoose.Model("User",userSchema);

module.exports=userModal;
