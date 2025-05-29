const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendToken = (res, token, user) => {
  res.cookie("token", token, { httpOnly: true, secure: false }); // set secure: true in production
  res.status(200).json({ user: { name: user.name, email: user.email } });
};

module.exports = {
  createToken,
  sendToken,
};
