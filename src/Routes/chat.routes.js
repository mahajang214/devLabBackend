const router = require("express").Router();
const logger = require("../config/logger");
const protected = require("../Middlewares/protection.middleware");
const messageModal = require("../Models/message.modal");

// get all messages between from and to
router.get("/messages", protected, async (req, res) => {
  try {
    const { from, to } = req.query;
    const messages = await messageModal.find({
      $or: [
        { to },
      ],
    }).sort({ createdAt: 1 });

    logger.info(`all messages between from:${from} to:${to} are founded.`);
    res.status(200).json({
      message: "All messages are founded",
      data: messages,
    });
  } catch (error) {
    logger.error("error:", error.message);
    res.status(500).json({
      message: "Failed to find all messages ",
      error: error.message,
    });
  }
});

// send message
router.post("/send", protected, async (req, res) => {
  try {
    // const fromID=req.user.id;
    const { from, fromName, message, to, toName, fromPic } = req.body;
    // to = projectID toName:projectName
    const newMsg = await messageModal.create({
      from,
      fromName,
      message,
      to,
      toName,
      fromPic
    });

    logger.info(
      `message is successfully created from:${fromName} to:global message`
    );
    res.status(201).json({
      message: "message is successfully created",
      data: newMsg,
    });
  } catch (error) {
    logger.error("error:", error.message);
    res.status(500).json({
      message: "Failed to create messages ",
      error: error.message,
    });
  }
});

// delete message
router.delete("/delete/:id", protected, async (req, res) => {
  try {
    // const fromID=req.user.id;
    const deleteID = req.params.id;
    const deleteMsg = await messageModal.findByIdAndDelete(deleteID);

    logger.info(`message is successfully deleted id:${deleteID}`);
    res.status(200).json({
      message: "message is successfully deleted",
      data: deleteMsg,
    });
  } catch (error) {
    logger.error("error:", error.message);
    res.status(500).json({
      message: "Failed to delete messages ",
      error: error.message,
    });
  }
});

module.exports = router;
