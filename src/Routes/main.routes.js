const express = require("express");
const logger = require("../config/logger");
const userModal = require("../Models/user.modal");
const protected = require("../Middlewares/protection.middleware");
const projectModal = require("../Models/project.modal");
const fileModal = require("../Models/file.modal");
const jwt = require("jsonwebtoken");

const router = express.Router();

// create new project
router.post("/create", protected, async (req, res) => {
  try {
    const { projectName, collabs, folder, folderName } = req.body;
    const userID = req.user.id;

    logger.info(`Creating new project: ${projectName} by user: ${userID}`);
    logger.info(`Collaborators: ${JSON.stringify(collabs)}`);
    logger.info(`Initial folder structure: ${JSON.stringify(folder)}`);

    const owner = await userModal.findById(userID);

    // Create new project
    const newProject = await projectModal.create({
      projectName,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      ownerID: userID,
      collabs: collabs || [],
      folder: folder || [],
      folderName,
    });

    // Update user's projects array
    await userModal.findByIdAndUpdate(userID, {
      $push: {
        projects: {
          projectID: newProject._id,
          projectName: projectName,
          ownerName: `${owner.firstName} ${owner.lastName}`,
        },
      },
    });

    logger.info(`Project created successfully with ID: ${newProject._id}`);
    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    logger.error(`Error creating project: ${error.message}`);
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
});

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
      file: newFile,
    });
  } catch (error) {
    logger.error(`Error creating file: ${error.message}`);
    res.status(500).json({
      message: "Failed to create file",
      error: error.message,
    });
  }
});

// list all projects for that user
router.get("/projects", protected, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await userModal.findById(userID);

    console.log("projects", user.projects);

    logger.info(
      `Retrieved projects for user ${userID}: ${JSON.stringify(user.projects)}`
    );
    res.status(200).json({ msg: "list all users", data: user.projects });
  } catch (error) {
    logger.error(`Error listing projects: ${error.message}`);
    res.status(500).json({
      message: "Failed to list projects",
      error: error.message,
    });
  }
});

// only owner of project can add collaborators
router.put("/collab", protected, async (req, res) => {
  try {
    const { projectID, name, id } = req.body;
    const ownerID = req.user.id;

    logger.info(
      `Attempting to add collaborator ${name} to project ${projectID} by owner ${ownerID}`
    );

    // Find project and verify ownership
    const project = await projectModal.findById(projectID);
    if (!project) {
      logger.warn(`Project not found with ID: ${projectID}`);
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.ownerID !== ownerID) {
      logger.warn(
        `Unauthorized attempt to add collaborator. Project owner: ${project.ownerID}, Attempting user: ${ownerID}`
      );
      return res
        .status(403)
        .json({ message: "Only project owner can add collaborators" });
    }

    const hasCollab = await userModal.findOne({ _id: id });
    if (!hasCollab) {
      logger.warn(`Collaborator not found with ID: ${ownerID}`);
      return res.status(404).json({ message: "Collaborator not found" });
    }
    // Check if user is already a collaborator
    const isCollab = project.collabs.some((collab) => collab.id === id);
    if (isCollab) {
      logger.warn(
        `User ${id} is already a collaborator on project ${projectID}`
      );
      return res
        .status(403)
        .json({ message: "User is already a collaborator" });
    }

    project.collabs.push({ name, id });
    await project.save();

    res.status(200).json({ message: "Collaborator added successfully" });
  } catch (error) {
    logger.error(`Error adding collaborator: ${error.message}`);
    res.status(500).json({
      message: "Failed to add collaborator",
      error: error.message,
    });
  }
});

// only owner can remove anyone from collab
router.put("/rm/collab", protected, async (req, res) => {
  try {
    const { projectID, id } = req.body;
    const ownerID = req.user.id;

    logger.info(
      `Attempting to remove collaborator ${id} from project ${projectID} by owner ${ownerID}`
    );

    // Find project and verify ownership
    const project = await projectModal.findById(projectID);
    if (!project) {
      logger.warn(`Project not found with ID: ${projectID}`);
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.ownerID !== ownerID) {
      logger.warn(
        `Unauthorized attempt to remove collaborator. Project owner: ${project.ownerID}, Attempting user: ${ownerID}`
      );
      return res
        .status(403)
        .json({ message: "Only project owner can remove collaborators" });
    }

    // Check if user is a collaborator
    const isCollab = project.collabs.some((collab) => collab.id === id);
    if (!isCollab) {
      logger.warn(`User ${id} is not a collaborator on project ${projectID}`);
      return res.status(404).json({ message: "User is not a collaborator" });
    }

    // Remove collaborator
    project.collabs = project.collabs.filter((collab) => collab.id !== id);
    await project.save();

    res.status(200).json({ message: "Collaborator removed successfully" });
  } catch (error) {
    logger.error(`Error removing collaborator: ${error.message}`);
    res.status(500).json({
      message: "Failed to remove collaborator",
      error: error.message,
    });
  }
});

// follow another user
router.put("/follow/:followingID", protected, async (req, res) => {
  try {
    const followingID = req.params.followingID;
    const userID = req.user.id;

    const user = await userModal.findById(userID);
    const followingUser = await userModal.findById(followingID);
    if (!user || !followingUser) {
      logger.warn(
        `User not found. UserID: ${userID}, FollowingID: ${followingID}`
      );
      return res.status(404).json({ message: "User not found" });
    }
    const isFollowing = user.following.some(
      (follow) => follow.id === followingID
    );
    if (isFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }
    user.following.push({
      name: `${followingUser.firstName} ${followingUser.lastName}`,
      id: followingID,
    });
    await user.save();

    followingUser.followers.push({
      name: `${user.firstName} ${user.lastName}`,
      id: user.id,
    });
    await followingUser.save();

    logger.info(`User ${userID} followed user ${followingID}`);
    return res.status(200).json({ message: "Successfully followed user" });
  } catch (error) {
    logger.error(`Error following user: ${error.message}`);
    res.status(500).json({
      message: "Failed to follow user",
      error: error.message,
    });
  }
});

// unfollow another user
router.put("/unfollow/:unfollowingID", protected, async (req, res) => {
  try {
    const unfollowingID = req.params.unfollowingID;
    const userID = req.user.id;

    const user = await userModal.findById(userID);
    const followingUser = await userModal.findById(unfollowingID);
    if (!user || !followingUser) {
      logger.warn(
        `User not found. UserID: ${userID}, unfollowingID: ${unfollowingID}`
      );
      return res.status(404).json({ message: "User not found" });
    }
    const isFollowing = user.following.some(
      (follow) => follow.id === unfollowingID
    );
    if (!isFollowing) {
      return res.status(400).json({ message: "Not following this user" });
    }
    user.following.pull({
      id: unfollowingID,
    });
    await user.save();

    followingUser.followers.pull({
      id: user.id,
    });
    await followingUser.save();

    logger.info(`User ${userID} unfollowed user ${unfollowingID}`);
    return res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    logger.error(`Error unfollowing user: ${error.message}`);
    res.status(500).json({
      message: "Failed to unfollow user",
      error: error.message,
    });
  }
});

// search user by first name or last name
router.get("/search/:searchName",protected,async (req,res) => {
    try {
        const searchName=req.params.searchName;
        const findUser = await userModal.find({
            $or: [
                { firstName: { $regex: searchName, $options: 'i' } },
                { lastName: { $regex: searchName, $options: 'i' } }
            ]
        });
        if (findUser.length === 0) {
            logger.warn(`No users found matching search term: ${searchName}`);
            return res.status(404).json({ message: "No users found" });
        }

        logger.info(`Found ${findUser.length} users matching search term: ${searchName}`);
        return res.status(200).json({ users: findUser });
    } catch (error) {
        logger.error(`Error searching users: ${error.message}`);
        return res.status(500).json({
            message: "Failed to search users",
            error: error.message
        });
    }
});

// search by project name
router.get("/search/project/:projectName", protected, async (req, res) => {
    try {
        const projectName = req.params.projectName;
        const findProject = await projectModal.find({
            projectName: { $regex: projectName, $options: 'i' }
        });

        if (findProject.length === 0) {
            logger.warn(`No projects found matching search term: ${projectName}`);
            return res.status(404).json({ message: "No projects found" });
        }

        logger.info(`Found ${findProject.length} projects matching search term: ${projectName}`);
        return res.status(200).json({ projects: findProject });
    } catch (error) {
        logger.error(`Error searching projects: ${error.message}`);
        return res.status(500).json({
            message: "Failed to search projects",
            error: error.message
        });
    }
});

// update file

module.exports = router;
