const express = require("express");
const db = require("../../db/db");
const passport = require("passport");
const router = express.Router();

// ADMIN PANEL: Get data about my administrator account, such as rights
router.get(
  "/me",
  passport.authenticate("google-id", { session: false }),
  (req, res) => {
    console.log("req.user: " + JSON.stringify(req.user));

    db.oneOrNone("SELECT * FROM administrator WHERE google_id = $1", ["123"])
      .then((data) => {
        if (data) {
          res.status(200).json(data);
        } else {
          res.sendStatus(204);
        }
      })
      .catch((error) => {
        console.log("ERROR: ", error);
        res.sendStatus(500);
      });
  }
);

module.exports = router;
