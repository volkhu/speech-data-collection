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
