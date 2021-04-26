const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../../db/db");
const router = express.Router();

// APP: Get the profile on my device.
router.get("/", async (req, res) => {
  if (req.mobileAppProfile) {
    res.status(200).json({
      profile_id: req.mobileAppProfile.profile_id,
      year_of_birth: req.mobileAppProfile.year_of_birth,
      gender: req.mobileAppProfile.gender,
      native_language: req.mobileAppProfile.native_language,
      dialect: req.mobileAppProfile.dialect,
    });

    return;
  }

  res.status(404).json({ msg: "No profile exists with this device ID." });
});

// APP: Create a profile on my device.
router.post(
  "/",
  [body("year_of_birth").isNumeric(), body("gender").isString()],
  async (req, res) => {
    if (!req.deviceId) {
      res.status(400).json({ msg: "Unsuitable device ID." });
      return;
    }

    if (!validationResult(req).isEmpty()) {
      res.status(400).json({ msg: "Invalid or missing input values." });
      return;
    }

    try {
      const createdProfile = await db.oneOrNone(
        db.getQuery("profiles/create-profile"),
        {
          device_id: req.deviceId,
          year_of_birth: req.body.year_of_birth,
          gender: req.body.gender,
          native_language: req.body.native_language,
          dialect: req.body.dialect,
        }
      );

      if (!createdProfile) {
        res
          .status(400)
          .json({ msg: "Profile already exists on this device ID." });
        return;
      }

      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

module.exports = router;
