const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      required: true,
    },
    ownerID: {
      type: String,
      required: true,
    },
    projectID: {
      type: String,
      required: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
     folderID: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
  },
  { timestamps: true }
);

const fileModal = mongoose.model("File", fileSchema);

module.exports = fileModal;
