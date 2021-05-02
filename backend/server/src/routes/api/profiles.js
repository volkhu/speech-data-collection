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
  } else {
    res.status(204).json({ msg: "No profile exists with this device ID." });
  }
});

// APP: Create a profile on my device.
router.post(
  "/",
  [body("year_of_birth").isInt(), body("gender").isString()],
  async (req, res) => {
    if (!req.deviceId) {
      res.status(400).json({ msg: "Invalid device ID." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
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

      res.status(200).json(createdProfile);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

module.exports = router;
