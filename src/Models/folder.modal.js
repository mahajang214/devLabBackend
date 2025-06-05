const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
    {
        folderName: { type: String, required: true },
        projectID: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        parentFolderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null }, // null means root folder
    },
    { timestamps: true }
);

const folderModel = mongoose.model("Folder", folderSchema);
module.exports = folderModel;
