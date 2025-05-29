const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  googleId: String,
  email: { type: String, required: true, unique: true },
  picture: String,
  followers:[
    {
      name:String,  // combination of first + last 
      id:String
    },
  ],
  following:[
    {
      name:String,
      id:String
    },
  ],
  projects:[
    {
      projectID:String,
      projectName:String,
      ownerName:String
    }
  ]
});

const userModal=mongoose.model("User",userSchema);

module.exports=userModal;
