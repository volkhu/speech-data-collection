const express = require("express");
const db = require("../../db/db");
const router = express.Router();

// APP: Get all projects that can be participated in
router.get("/", (req, res) => {
  db.any("SELECT * FROM project ORDER BY active DESC, project_id ASC") // TODO: show only active projects to app users
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

// APP: Get project with specified ID
router.get("/:projectId", (req, res) => {
  db.oneOrNone(
    "SELECT * FROM project WHERE active = TRUE AND project_id = $1",
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

module.exports = router;
