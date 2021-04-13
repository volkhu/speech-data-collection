const express = require("express");
const db = require("../../db/db");
const router = express.Router();

// ADMIN PANEL: get global settings
router.get("/", async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  try {
    const settings = await db.one("SELECT * FROM settings");
    res.status(200).json(settings);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// ADMIN PANEL: update global settings
router.put("/", async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  try {
    await db.none("UPDATE settings SET mobile_app_terms = $1", [
      req.body.mobile_app_terms,
    ]);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;
