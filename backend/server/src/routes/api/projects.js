const express = require("express");
const { body, param, validationResult } = require("express-validator");
const db = require("../../db/db");
const filestore = require("../../db/filestore");
const router = express.Router();
const JSZip = require("jszip");

// APP/ADMIN PANEL: Get a list of projects.
router.get("/", async (req, res) => {
  if (req.hasAdminAccess()) {
    // admin, show all projects plus some statistics
    try {
      const projects = await db.any(
        db.getQuery("projects/list-projects-admin")
      );

      res.status(200).json(projects);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  } else if (req.mobileAppProfile) {
    // mobile app user, show only active projects
    try {
      const projects = await db.any(db.getQuery("projects/list-projects-app"));
      res.status(200).json(projects);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  } else {
    res.status(401).json({ msg: "Insufficient privileges." });
  }
});

// ADMIN PANEL: Update project details.
router.put(
  "/:projectId",
  [
    param("projectId").isInt(),
    body("name").isString(),
    body("description").isString(),
    body("randomize_prompt_order").isBoolean(),
    body("allow_repeated_sessions").isBoolean(),
    body("active").isBoolean(),
  ],
  async (req, res) => {
    if (!req.hasAdminAccess()) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
      return;
    }

    try {
      const updatedProject = await db.oneOrNone(
        db.getQuery("projects/update-project"),
        {
          name: req.body.name,
          description: req.body.description,
          randomize_prompt_order: req.body.randomize_prompt_order,
          allow_repeated_sessions: req.body.allow_repeated_sessions,
          active: req.body.active,
          last_edited_by: req.adminPanelAccount.account_id,
          project_id: req.params.projectId,
        }
      );

      if (!updatedProject) {
        res.status(400).json({ msg: "Invalid project ID." });
        return;
      }

      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

// ADMIN PANEL: Create new project.
router.post(
  "/",
  [
    body("name").isString(),
    body("description").isString(),
    body("randomize_prompt_order").isBoolean(),
    body("allow_repeated_sessions").isBoolean(),
    body("active").isBoolean(),
  ],
  async (req, res) => {
    if (!req.hasAdminAccess()) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
      return;
    }

    try {
      const createdProject = await db.one(
        db.getQuery("projects/create-project"),
        {
          name: req.body.name,
          description: req.body.description,
          randomize_prompt_order: req.body.randomize_prompt_order,
          allow_repeated_sessions: req.body.allow_repeated_sessions,
          active: req.body.active,
          created_by: req.adminPanelAccount.account_id,
          last_edited_by: req.adminPanelAccount.account_id,
        }
      );

      res.status(200).json(createdProject);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

// APP/ADMIN PANEL: Get project details with specified ID
router.get("/:projectId", [param("projectId").isInt()], async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    res.status(400).json(validationErrors);
    return;
  }

  if (req.hasAdminAccess()) {
    // admin, show more details plus some statistics
    const project = await db.oneOrNone(
      db.getQuery("projects/get-project-admin"),
      {
        project_id: req.params.projectId,
      }
    );

    if (!project) {
      res.status(400).json({ msg: "Invalid project ID." });
      return;
    }

    res.status(200).json(project);
  } else if (req.mobileAppProfile) {
    // mobile app user, show only a few details about the project
    try {
      const project = await db.oneOrNone(
        db.getQuery("projects/get-project-app"),
        {
          project_id: req.params.projectId,
        }
      );

      if (!project) {
        res.status(400).json({ msg: "Invalid project ID." });
        return;
      }

      res.status(200).json(project);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  } else {
    res.status(401).json({ msg: "Insufficient privileges." });
  }
});

// ADMIN PANEL: Get prompts list associated with a specific project.
router.get(
  "/:projectId/prompts",
  [param("projectId").isInt()],
  async (req, res) => {
    if (!req.hasAdminAccess()) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
      return;
    }

    try {
      const prompts = await db.any(
        db.getQuery("projects/list-project-prompts"),
        {
          project_id: req.params.projectId,
        }
      );

      // load image thumbnails for every prompt that has them
      for (let prompt of prompts) {
        if (prompt.image) {
          prompt.thumbnail_data = await filestore.getPromptImage(
            prompt.prompt_id,
            true
          );
        }
      }

      res.status(200).json(prompts);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

// file download is handled via a POST request to pass auth token, since
// setting headers is not practical
router.post(
  "/:projectId/downloadRecordings",
  [param("projectId").isInt()],
  async (req, res) => {
    if (!req.hasAdminAccess()) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
      return;
    }

    try {
      const zip = new JSZip();
      const zipFileName = `project_${req.params.projectId}_recordings.zip`;

      // add project details to zip
      const projectDetails = await db.oneOrNone(
        db.getQuery("projects/get-project-admin"),
        {
          project_id: req.params.projectId,
        }
      );

      if (!projectDetails) {
        res.status(400).json({ msg: "Invalid project ID." });
        return;
      }

      const projectDetailsFilePath = `project_${req.params.projectId}_details.json`;
      zip.file(projectDetailsFilePath, JSON.stringify(projectDetails, null, 2));

      // TODO: add recording file, profile data etc.

      // pack and send zip file
      zipFileContent = await zip.generateAsync({ type: "nodebuffer" });
      res.set("Content-Type", "application/zip");
      res.set("Content-Disposition", `filename="${zipFileName}"`);
      res.set("Content-Length", zipFileContent.length);
      res.end(zipFileContent);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
    /*
    db.any(
      "SELECT * FROM recording INNER JOIN session USING (session_id) WHERE session.project_id = $1",
      [req.params.projectId]
    ).then((data) => {
      data.forEach((item) => {
        const audioFilename = `project_${item.project_id}_profile_${item.profile_id}_session_${item.session_id}_prompt_${item.prompt_id}.wav`;
        const sourceAudioFilePath = path.join(
          __dirname,
          "../../../files/audio/",
          `project_${item.project_id}/profile_${item.profile_id}/session_${item.session_id}/`,
          audioFilename
        );
        const zippedAudioFilePath = path.join(
          `profile_${item.profile_id}/session_${item.session_id}/`,
          audioFilename
        );

        // TODO: swap out for file reading code after other things are fixed
        zip.file(zippedAudioFilePath, require("crypto").randomBytes(4096));

        console.log(audioFilename);
        console.log(sourceAudioFilePath);
        console.log(zippedAudioFilePath);
        console.log(item);
      });
    });*/
  }
);

// APP: Get a new prompt to record for a specified project.
router.get(
  "/:projectId/prompt",
  [param("projectId").isInt()],
  async (req, res) => {
    if (!req.mobileAppProfile) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
      return;
    }

    try {
      // get project's prompt related settings such as whether to randomize the order
      const projectSettings = await db.oneOrNone(
        db.getQuery("projects/get-project-settings"),
        {
          project_id: req.params.projectId,
        }
      );

      if (!projectSettings || !projectSettings.active) {
        res.status(400).json({ msg: "Invalid project ID." });
        return;
      }

      // see if we have an active session for this project
      let session = await db.oneOrNone(
        db.getQuery("sessions/get-active-session"),
        {
          profile_id: req.mobileAppProfile.profile_id,
          project_id: req.params.projectId,
        }
      );

      if (!session) {
        // no active session, check if we have completed one(s)
        const completedSessions = await db.any(
          db.getQuery("sessions/get-completed-sessions"),
          {
            profile_id: req.mobileAppProfile.profile_id,
            project_id: req.params.projectId,
          }
        );

        if (
          completedSessions.length &&
          !projectSettings.allow_repeated_sessions
        ) {
          res.status(403).json({
            msg:
              "You have already completed this project. Further sessions are not allowed.",
          });
          return;
        }

        // otherwise we can create our first session
        session = await db.one(db.getQuery("sessions/create-session"), {
          profile_id: req.mobileAppProfile.profile_id,
          project_id: req.params.projectId,
        });

        console.log(
          `Registered a new session for profile ${req.mobileAppProfile.profile_id} on project ${req.params.projectId}.`
        );
      }

      // now we have an incomplete session that we need to complete
      // first get a list of prompts available in this project
      const projectPrompts = await db.any(
        db.getQuery("projects/list-project-prompts"),
        {
          project_id: req.params.projectId,
        }
      );

      // next get a list of prompts that we have completed in this session
      const completedPromptIds = (
        await db.any(db.getQuery("sessions/get-completed-prompts"), {
          session_id: session.session_id,
        })
      ).map((prompt) => prompt.prompt_id);

      // filter out already completed prompts from the list
      const availablePrompts = projectPrompts.filter(
        (prompt) => !completedPromptIds.includes(prompt.prompt_id)
      );

      if (!availablePrompts.length) {
        // session is actually completed as no more prompts remain, but hasn't been marked so
        // (due to for example administrator deleting the last prompt that wasn't recorded)
        await db.none(db.getQuery("sessions/mark-session-completed"), {
          session_id: session.session_id,
        });

        res.status(204).json({ msg: "Session completed." });
        return;
      }

      // choose the prompt
      let chosenPrompt = null;
      if (projectSettings.randomize_prompt_order) {
        chosenPrompt =
          availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
      } else {
        chosenPrompt = availablePrompts[0];
      }

      // provide image if needed
      let imageData = null;
      if (chosenPrompt.image) {
        imageData = await filestore.getPromptImage(
          chosenPrompt.prompt_id,
          false
        );
      }

      res.status(200).json({
        prompt_id: chosenPrompt.prompt_id,
        description: chosenPrompt.description,
        instructions: chosenPrompt.instructions,
        image_data: imageData,
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

module.exports = router;
