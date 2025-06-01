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
  googleId: {
    type:String,
    select: false,
  },
  email: { type: String, required: true, unique: true, select:false },
  picture: String,
  followers:[
    {
      name:String,  // combination of first + last 
      id:String,
      picture:String
    },
  ],
  following:[
    {
      name:String,
      id:String,
      picture:String
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
