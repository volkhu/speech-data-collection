const express = require("express");
const db = require("../../db/db");
const router = express.Router();

// ADMIN PANEL: Get global settings related to the app.
router.get("/", async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  try {
    const settings = await db.one("SELECT * FROM settings");
    res.status(200).json(settings);
  } catch (error) {
    res.sendStatus(500);
  }
});

// ADMIN PANEL: Update global settings related to the app.
router.put("/", async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  try {
    await db.one("UPDATE settings SET mobile_app_terms = $1 RETURNING *", [
      req.body.mobile_app_terms,
    ]);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;
