const express = require("express");
const { body, param, validationResult } = require("express-validator");
const db = require("../../config/db");
const filestore = require("../../config/filestore");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const JSZip = require("jszip");

// APP/ADMIN: Get a list of projects
router.get("/", async (req, res) => {
  if (req.adminPanelAccount && req.adminPanelAccount.has_admin_access) {
    // admin, show all projects plus some statistics
    try {
      const projects = await db.any(
        "SELECT project.*, \
        (SELECT COUNT(*) FROM prompt WHERE prompt.deleted = FALSE AND prompt.project_id = project.project_id) AS num_prompts, \
        (SELECT COUNT(*) FROM recording, session WHERE recording.session_id = session.session_id AND session.project_id = project.project_id) AS num_recordings \
        FROM project \
        ORDER BY active DESC, project_id ASC"
      );
      res.status(200).json(projects);
    } catch (error) {
      res.sendStatus(500);
    }
  } else if (req.mobileAppProfile) {
    // mobile app user, show only active projects
    try {
      const projects = await db.any(
        "SELECT * FROM project \
        WHERE active = TRUE \
        ORDER BY name ASC"
      );
      res.status(200).json(projects);
    } catch (error) {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(401);
  }
});

// ADMIN: Update project details
router.put("/:projectId", (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  db.none(
    "UPDATE project SET name = $1, description = $2, randomize_prompt_order = $3, allow_concurrent_sessions = $4, active = $5 WHERE project_id = $6",
    [
      req.body.name,
      req.body.description,
      req.body.randomize_prompt_order,
      req.body.allow_concurrent_sessions,
      req.body.active,
      req.params.projectId,
    ]
  )
    .then((data) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

// ADMIN: Create new project
router.post("/", (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  console.log(req.body);

  if (!req.body.name) {
    res.sendStatus(400);
    return;
  }

  db.one(
    "INSERT INTO project (name, description, randomize_prompt_order, allow_concurrent_sessions, active) VALUES ($1, $2, $3, $4, $5) RETURNING project_id",
    [
      req.body.name,
      req.body.description,
      req.body.randomize_prompt_order ? req.body.randomize_prompt_order : false,
      req.body.allow_concurrent_sessions
        ? req.body.allow_concurrent_sessions
        : false,
      req.body.active ? req.body.active : false,
    ]
  )
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

// APP/ADMIN: Get project with specified ID
router.get("/:projectId", (req, res) => {
  db.oneOrNone(
    "SELECT project.*, \
    (SELECT COUNT(*) FROM prompt WHERE prompt.deleted = FALSE AND prompt.project_id = project.project_id) AS num_prompts, \
    (SELECT COUNT(*) FROM session WHERE session.project_id = project.project_id) AS num_sessions, \
    (SELECT COUNT(DISTINCT session.profile_id) FROM session WHERE session.project_id = project.project_id) AS num_participants, \
    (SELECT COUNT(*) FROM recording, session WHERE recording.session_id = session.session_id AND session.project_id = project.project_id) AS num_recordings, \
    (SELECT SUM(duration_in_seconds) FROM recording, session WHERE recording.session_id = session.session_id AND session.project_id = project.project_id) AS total_recordings_duration \
    FROM project WHERE project_id = $1;",
    [req.params.projectId]
  )
    .then((data) => {
      if (data === null) {
        res.sendStatus(204);
      } else {
        if (data.total_recordings_duration == null) {
          data.total_recordings_duration = 0.0;
        }

        res.status(200).json(data);
      }
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

// ADMIN PANEL: Get prompts associated with a specific project.
router.get(
  "/:projectId/prompts",
  [param("projectId").isInt()],
  async (req, res) => {
    if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    if (!validationResult(req).isEmpty()) {
      res.status(400).json({ msg: "Invalid input value types." });
      return;
    }

    try {
      const prompts = await db.any(
        "SELECT * FROM prompt \
        WHERE project_id = $1 AND deleted = FALSE \
        ORDER BY prompt_id ASC",
        [req.params.projectId]
      );

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

router.get("/:projectId/downloadRecordings", (req, res) => {
  const zip = new JSZip();
  const zipFileName = `project_${req.params.projectId}_recordings.zip`;

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

    zip.generateAsync({ type: "nodebuffer" }).then((zipFileContent) => {
      res.set("Content-Type", "application/zip");
      res.set("Content-Disposition", `filename="${zipFileName}"`);
      res.set("Content-Length", zipFileContent.length);
      res.end(zipFileContent);
    });
  });
});

module.exports = router;
