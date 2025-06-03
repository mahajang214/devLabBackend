const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const protected = require("../Middlewares/protection.middleware");
// const temp=require("../../temp");



// Ensure temp directory exists
const tempDir = path.join(__dirname, "..", "..", "temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

router.post("/update",protected, async (req, res) => {
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

module.exports = router;