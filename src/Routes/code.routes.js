const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const protected = require("../Middlewares/protection.middleware");
const logger = require("../config/logger");
const projectModal = require("../Models/project.modal");
const fileModal = require("../Models/file.modal");

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
router.post("/create_file", protected, async (req, res) => {
    try {
        const { fileName, content, language, projectID } = req.body;
        const userID = req.user.id;

        logger.info(
            `Creating new file: ${fileName} in project: ${projectID} by user: ${userID}`
        );

        const newFile = await fileModal.create({
            fileName,
            content,
            language,
            ownerID: userID,
            projectID,
        });

        // Update project's folder array with new file
        await projectModal.findByIdAndUpdate(projectID, {
            $push: {
                folder: {
                    fileID: newFile._id,
                    fileName: fileName,
                },
            },
        });

        logger.info(`File created successfully with ID: ${newFile._id}`);
        res.status(201).json({
            message: "File created successfully",
            data: newFile,
        });
    } catch (error) {
        logger.error(`Error creating file: ${error.message}`);
        res.status(500).json({
            message: "Failed to create file",
            error: error.message,
        });
    }
});
// create folder

// get projects folders and files 
router.get("/get_project_ff", protected, async (req, res) => {
    try {
        const {projectID} = req.query;
        const userID = req.user.id;

        logger.info(`Fetching files for project: ${projectID} by user: ${userID}`);

        const project = await projectModal.findById(projectID);
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

module.exports = router;