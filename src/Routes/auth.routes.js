const express = require("express");
const userModal = require("../Models/user.modal.js");
const logger = require("../config/logger");
const verifyGoogleToken = require("../config/googleAuth");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const protected = require("../Middlewares/protection.middleware.js");
const projectModal = require("../Models/project.modal.js");
const fileModal = require("../Models/file.modal.js");

const router = express.Router();

// google auth
router.post("/google", async (req, res) => {
  const resToken = req.body.token;
  console.log("token : ", resToken);

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
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture,
      });
    }

    // const token =await createToken(user._id);
    // console.log("token :",token._id);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, { httpOnly: true, secure: false }); // set secure: true in production
    res.status(200).json({ user: { name: user.name, email: user.email } });
    // sendToken(res, token, user);
    logger.info("google auth successfull");
  } catch (err) {
    // console.log("error:",err.message);
    logger.error(err.message);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

// logout 
router.post("/logout", protected, async (req, res) => {
  try {
    // Clear the JWT token from client-side storage
    // Note: The actual token clearing should be handled on the client side
    // This endpoint just confirms the logout was successful
    
    logger.info(`User ${req.user.id} logged out successfully`);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error(`Error during logout: ${error.message}`);
    return res.status(500).json({
      message: "Failed to logout",
      error: error.message
    });
  }
});




// check protected route
// router.get("/protected", protected, async (req, res) => {
//   try {
//     // Get user from the request (set by the protected middleware)
//     const user = req.user;

//     // Return user data as a demo response
//     res.status(200).json({
//       message: "Protected route accessed successfully",
//       user: {
//         id: user.id,
//         // Add any other user data you want to return
//       }
//     });

//     logger.info(`Protected route accessed by user: ${user.id}`);
//   } catch (error) {
//     logger.error("Error accessing protected route:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

module.exports = router;
