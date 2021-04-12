const express = require("express");
const db = require("../../db/db");
const passport = require("passport");
const router = express.Router();

// ADMIN PANEL: Get data about my account, such as whether administrator rights have been granted
router.get("/me", async (req, res) => {
  if (!req.adminPanelAccount) {
    res.sendStatus(401);
    return;
  }

  res.status(200).json(req.adminPanelAccount);
});

module.exports = router;
