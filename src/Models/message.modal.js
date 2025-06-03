const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    fromName: { type: String, required: true },
    message: { type: String, required: true },
    to: { type: String, required: true },
    toName: { type: String, required: true },
    fromPic: { type: String, required: true }
}, { timestamps: true });

const messageModal = mongoose.model("message", messageSchema);

module.exports = messageModal;