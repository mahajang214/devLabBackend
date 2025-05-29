const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      required: true,
      type: String,
    },
    ownerName: {
      required: true,
      type: String,
    },
    ownerID: String,
    collabs: [{ name: String, id: String }],
    folder: [
      {
        fileID: String,
        fileName: String,
      },
    ],
    folderName: String,
  },
  { timestamps: true }
);

const projectModal = mongoose.model("Project", projectSchema);

module.exports = projectModal;
