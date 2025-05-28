const express=require("express");
const userModal = require("../Models/user.modal");
const logger = require("../config/logger");
const verifyGoogleToken = require("../config/googleAuth");

const router=express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      let user = await userModal.findOne({ email });
      if (user) return res.status(400).json({ error: 'User already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await userModal.create({ name, email, password: hashedPassword });
  
      const token = createToken(user._id);
      sendToken(res, token, user);
    } catch (err) {
      res.status(500).json({ error: 'Signup failed' });
    }
  });

// google auth
router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    // const ticket = await client.verifyIdToken({
    //   idToken: token,
    //   audience: process.env.GOOGLE_CLIENT_ID,
    // });

    // const payload = ticket.getPayload();
    const payload=await verifyGoogleToken(token);
    const { sub, email, name, picture } = payload;

    let user = await userModal.findOne({ googleId: sub });

    if (!user) {
      user = await userModal.create({
        name,
        email,
        googleId: sub,
         picture,
      });
    }

    const token = createToken(user._id);
    sendToken(res, token, user);
    logger.info("google auth successfull");
  } catch (err) {
    console.log("error:",err.message);
    logger.error(err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

module.exports=router;