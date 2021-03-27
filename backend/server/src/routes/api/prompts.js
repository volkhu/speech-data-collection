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

module.exports = router;
