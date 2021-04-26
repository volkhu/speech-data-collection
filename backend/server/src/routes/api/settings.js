const express = require("express");
const db = require("../../db/db");
const router = express.Router();

// ADMIN PANEL: Get global settings related to the app.
router.get("/", async (req, res) => {
  if (!req.hasAdminAccess()) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  try {
    const settings = await db.one(db.getQuery("settings/get-settings"));
    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// ADMIN PANEL: Update global settings related to the app.
router.put("/", async (req, res) => {
  if (!req.hasAdminAccess()) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  try {
    await db.one(db.getQuery("settings/update-settings"), {
      mobile_app_terms: req.body.mobile_app_terms,
    });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
