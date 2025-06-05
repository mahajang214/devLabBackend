const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const protected = require("../Middlewares/protection.middleware");
const logger = require("../config/logger");
const projectModal = require("../Models/project.modal");
const fileModal = require("../Models/file.modal");
const folderModel = require("../Models/folder.modal");
// const fileForFolderModal = require("../Models/folderFile.modal");

// const temp=require("../../temp");



// Ensure temp directory exists
const tempDir = path.join(__dirname, "..", "..", "temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

router.post("/update", protected, async (req, res) => {
    const { code, language } = req.body;

    if (language !== "javascript") {
        return res.status(400).json({ error: "Only JavaScript is supported right now." });
    }

    const filename = `temp-${Date.now()}.js`;
    const filepath = path.join(tempDir, filename);

    try {
        // Save code to temp file
        fs.writeFileSync(filepath, code);

        // Execute the code
        exec(`node "${filepath}"`, { timeout: 5000 }, (err, stdout, stderr) => {
            // Cleanup temp file
            fs.unlink(filepath, () => { });
            let errorMsg = stderr || err?.message || "Execution failed";

            errorMsg = errorMsg.replace(new RegExp(filepath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), 'yourFile.js');
            if (err) {
                return res.status(200).json({
                    data: errorMsg
                });
            }

            return res.status(200).json({
                data: stdout.trim() || "No output"
            });
        });

    } catch (error) {
        // Clean up if error
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        console.error("Server error:", error.message);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

// rename file name

// rename folder name

// delete file
// delete folder
// move file
// move folder
// create new file
router.post('/create_file', protected, async (req, res) => {
    try {
        const userID = req.user.id;
        const { fileName, content, language, projectID, folderID } = req.body;

        if (!fileName || !language || !projectID) {
            return res.status(400).json({ error: 'fileName, language and projectID are required' });
        }

        // Optional: validate folderID exists in project

        const newFile = new fileModal({
            fileName,
            content,
            language,
            ownerID: userID,
            projectID,
            folderID: folderID || null, // Set folderID if provided, otherwise null
        });

        await newFile.save();
        res.status(201).json({ data: newFile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// router.post("/create_file", protected, async (req, res) => {
//     try {
//         const { fileName, content, language, projectID } = req.body;
//         const userID = req.user.id;

//         logger.info(
//             `Creating new file: ${fileName} in project: ${projectID} by user: ${userID}`
//         );

//         const newFile = await fileModal.create({
//             fileName,
//             content,
//             language,
//             ownerID: userID,
//             projectID,
//         });

//         // Update project's folder array with new file
//         await projectModal.findByIdAndUpdate(projectID, {
//             $push: {
//                 folder: {
//                     fileID: newFile._id,
//                     fileName: fileName,
//                 },
//             },
//         });

//         logger.info(`File created successfully with ID: ${newFile._id}`);
//         res.status(201).json({
//             message: "File created successfully",
//             data: newFile,
//         });
//     } catch (error) {
//         logger.error(`Error creating file: ${error.message}`);
//         res.status(500).json({
//             message: "Failed to create file",
//             error: error.message,
//         });
//     }
// });

// Create folder
router.post('/create_folder', protected, async (req, res) => {
    try {
        const { folderName, projectID, parentFolderID = null } = req.body;
        const ownerID = req.user.id;

        if (!folderName || !projectID || !ownerID) {
            return res.status(400).json({ error: 'folderName, projectID, and ownerID are required' });
        }

        const newFolder = new folderModel({
            folderName,
            projectID,
            ownerID,
            parentFolderID,
        });

        await newFolder.save();
        res.status(201).json({ data: newFolder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper recursive function to delete folder contents
async function deleteFolderAndContents(folderId) {
    // Delete all files in this folder
    await File.deleteMany({ folderID: folderId });

    // Find subfolders
    const subfolders = await Folder.find({ parentFolderID: folderId });

    // Recursively delete subfolders
    for (const subfolder of subfolders) {
        await deleteFolderAndContents(subfolder._id);
    }

    // Delete this folder
    await Folder.deleteOne({ _id: folderId });
}

// Delete folder route
router.delete('/folders/:folderId', async (req, res) => {
    try {
        const { folderId } = req.params;

        const folder = await folderModel.findById(folderId);
        if (!folder) return res.status(404).json({ error: 'Folder not found' });

        await deleteFolderAndContents(folderId);

        res.json({ message: 'Folder and all its contents deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





// get projects files 
router.get("/get_project_files", protected, async (req, res) => {
    try {
        const { projectID } = req.query;
        const userID = req.user.id;

        const project = await fileModal.find({ projectID: projectID, folderID: null });
        // const folders = await folderModel.find({ projectID: projectID, parentFolderID: null });
        if (!project) {
            logger.warn(`Project not found: ${projectID}`);
            return res.status(404).json({
                message: "Project not found",
            });
        }
        // const files = await fileModal.find({ projectID, ownerID: userID });
        // logger.info(`Files fetched successfully for project: ${projectID}`);
        res.status(200).json({
            message: "Files fetched successfully",
            data: project,
        });
    } catch (error) {
        logger.error(`Error fetching files: ${error.message}`);
        res.status(500).json({
            message: "Failed to fetch files",
            error: error.message,
        });
    }
});

// get projects folders
router.get("/get_project_folders", protected, async (req, res) => {
    try {
        const { projectID } = req.query;
        const userID = req.user.id;

        const folders = await folderModel.find({ projectID, parentFolderID: null });

        // Get array of folder IDs
        const folderIds = folders.map(folder => folder._id);

        // Fetch files that are in any of these folders
        const folderFiles = await fileModal.find({ projectID, folderID: { $in: folderIds } });

        if (!folders) {
            logger.warn(`Project not found: ${projectID}`);
            return res.status(404).json({
                message: "Project not found",
            });
        }
        // const files = await fileModal.find({ projectID, ownerID: userID });
        // logger.info(`Files fetched successfully for project: ${projectID}`);
        res.status(200).json({
            message: "Files fetched successfully",
            folderFiles: folderFiles,
            folders: folders
        });
    } catch (error) {
        logger.error(`Error fetching files: ${error.message}`);
        res.status(500).json({
            message: "Failed to fetch files",
            error: error.message,
        });
    }
});

// get file content
router.get("/get_file_content", protected, async (req, res) => {
    try {
        const { fileID } = req.query;
        const userID = req.user.id;

        logger.info(`Fetching content for file: ${fileID} by user: ${userID}`);

        const file = await fileModal.findOne({ _id: fileID });
        if (!file) {
            logger.warn(`File not found: ${fileID}`);
            return res.status(404).json({
                message: "File not found",
            });
        }

        logger.info(`File content fetched successfully for file: ${fileID}`);
        res.status(200).json({
            message: "File content fetched successfully",
            data: file,
        });
    } catch (error) {
        logger.error(`Error fetching file content: ${error.message}`);
        res.status(500).json({
            message: "Failed to fetch file content",
            error: error.message,
        });
    }
});

// update code or save code
router.post("/update_code", protected, async (req, res) => {
    try {
        const { fileID, content } = req.body;
        const userID = req.user.id;

        logger.info(`Updating code for file: ${fileID} by user: ${userID}`);

        const updatedFile = await fileModal.findOneAndUpdate(
            { _id: fileID },
            { content },
            { new: true }
        );

        if (!updatedFile) {
            logger.warn(`File not found or unauthorized access: ${fileID}`);
            return res.status(404).json({
                message: "File not found or unauthorized access",
            });
        }

        logger.info(`File updated successfully: ${fileID}`);
        res.status(200).json({
            message: "File updated successfully",
            data: updatedFile,
        });
    } catch (error) {
        logger.error(`Error updating file: ${error.message}`);
        res.status(500).json({
            message: "Failed to update file",
            error: error.message,
        });
    }
});

module.exports = router;