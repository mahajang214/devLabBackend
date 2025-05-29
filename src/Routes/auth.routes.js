const express=require("express");
const userModal =require("../Models/user.modal.js")
const logger = require("../config/logger");
const verifyGoogleToken = require("../config/googleAuth");
const jwt=require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router=express.Router();




// google auth
router.post('/google', async (req, res) => {
  const resToken  = req.body.token;
  // console.log("token : ",resToken);

  try {
    const ticket = await client.verifyIdToken({
      idToken: resToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    // console.log("Expected audience:", process.env.GOOGLE_CLIENT_ID);
// console.log("ticket: ",ticket);
    const payload = ticket.getPayload();
    // console.log("Payload:", payload);
    // const payload=await verifyGoogleToken(resToken);
    // const { sub, email, name, picture } = payload;

    let user = await userModal.findOne({ googleId: payload.sub });

    if (!user) {
      user = await userModal.create({
        firstName:payload.given_name,
        lastName:payload.family_name,
        email:payload.email,
        googleId: payload.sub,
         picture : payload.picture,
      });
    }
    

    // const token =await createToken(user._id);
    // console.log("token :",token._id);
    const token=jwt.sign({id:user._id}, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: false }); // set secure: true in production
    res.status(200).json({ user: { name: user.name, email: user.email } });
    // sendToken(res, token, user);
    logger.info("google auth successfull");
  } catch (err) {
    // console.log("error:",err.message);
    logger.error(err.message);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

module.exports=router;