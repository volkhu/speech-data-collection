const express = require("express");
const db = require("../../db/db");
const router = express.Router();

// APP: Get the profile on my device
router.get("/", (req, res) => {
  db.oneOrNone("SELECT * FROM profile WHERE device_id = $1", [
    req.headers["x-deviceid"],
  ])
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
});

// APP: Create a profile on my device
router.post("/", (req, res) => {
  db.one(
    "INSERT INTO profile (device_id, year_of_birth, gender, native_language, dialect) VALUES ($1, $2, $3, $4, $5) RETURNING profile_id",
    [
      req.headers["x-deviceid"],
      req.body.year_of_birth,
      req.body.gender.charAt(0),
      req.body.native_language,
      req.body.dialect,
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

module.exports = router;
