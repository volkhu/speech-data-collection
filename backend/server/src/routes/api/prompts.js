const express = require("express");
const db = require("../../db/db");
const router = express.Router();

// ADMIN: Delete prompt with specified ID
router.delete("/:promptId", (req, res) => {
  db.none("UPDATE prompt SET deleted = TRUE WHERE prompt_id = $1", [
    req.params.promptId,
  ])
    .then((data) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

// ADMIN: Update prompt with specified ID
router.put("/:promptId", (req, res) => {
  db.none(
    "UPDATE prompt SET description = $1, image = $2, instructions = $3, last_edited_at = NOW() WHERE prompt_id = $4 AND deleted = FALSE",
    [
      req.body.description,
      req.body.image ? true : false,
      req.body.instructions,
      req.params.promptId,
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

// ADMIN: Add prompt to specified project
router.post("/", (req, res) => {
  console.log(req.body);

  db.one(
    "INSERT INTO prompt (project_id, description, image, instructions) VALUES ($1, $2, $3, $4) RETURNING prompt_id",
    [
      req.body.project_id,
      req.body.description,
      req.body.image ? true : false,
      req.body.instructions,
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

module.exports = router;
