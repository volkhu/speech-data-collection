const express = require("express");
const db = require("../../db/db");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const JSZip = require("jszip");

// APP: Get all projects that can be participated in
// ADMIN: Get all projects and some associated stats
router.get("/", (req, res) => {
  db.any(
    "SELECT project.*, (SELECT COUNT(*) FROM prompt WHERE prompt.deleted = FALSE AND prompt.project_id = project.project_id) AS num_prompts, (SELECT COUNT(*) FROM recording, session WHERE recording.session_id = session.session_id AND session.project_id = project.project_id) AS num_recordings FROM project ORDER BY active DESC, project_id ASC;"
  ) // TODO: show only active projects to app users
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

// ADMIN: Update project details
router.put("/:projectId", (req, res) => {
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
      req.body.randomize_prompt_order,
      req.body.allow_concurrent_sessions,
      req.body.active,
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
    "SELECT project.*, (SELECT COUNT(*) FROM prompt WHERE prompt.deleted = FALSE AND prompt.project_id = project.project_id) AS num_prompts, (SELECT COUNT(*) FROM session WHERE session.project_id = project.project_id) AS num_sessions, (SELECT COUNT(DISTINCT session.profile_id) FROM session WHERE session.project_id = project.project_id) AS num_participants, (SELECT COUNT(*) FROM recording, session WHERE recording.session_id = session.session_id AND session.project_id = project.project_id) AS num_recordings, (SELECT SUM(duration_in_seconds) FROM recording, session WHERE recording.session_id = session.session_id AND session.project_id = project.project_id) AS total_recordings_duration FROM project WHERE project_id = $1;",
    [req.params.projectId]
  )
    .then((data) => {
      if (data === null) {
        res.sendStatus(204);
      } else {
        res.status(200).json(data);
      }
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

// ADMIN: Get project with specified ID
router.get("/:projectId/prompts", (req, res) => {
  db.any(
    "SELECT * FROM prompt WHERE deleted = FALSE AND project_id = $1 ORDER BY prompt_id ASC",
    [req.params.projectId]
  )
    .then((data) => {
      if (data === null) {
        res.sendStatus(204);
      } else {
        for (var i = 0; i < data.length; i++) {
          if (data[i].image) {
            const fileDir = path.join(
              __dirname,
              "../../../files/prompt_images/",
              `${data[i].prompt_id}.jpg`
            );
            console.log(fileDir);

            try {
              const imageData = fs.readFileSync(fileDir, {
                encoding: "base64",
              });
              data[i].image_data = "data:image/jpeg;base64," + imageData;
            } catch (err) {
              console.error(err);
            }

            //console.log(data[i]);
          }
        }

        res.status(200).json(data);
      }
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

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
