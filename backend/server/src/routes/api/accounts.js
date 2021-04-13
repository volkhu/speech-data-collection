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

// ADMIN PANEL: Get a list of all registered accounts. Only available to superusers.
router.get("/", async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.is_superuser) {
    res.sendStatus(401);
    return;
  }

  try {
    let accounts = await db.manyOrNone(
      "SELECT account_id, email, has_admin_access, is_superuser FROM account ORDER BY is_superuser DESC, has_admin_access DESC"
    );

    // tell the client which rows can be modified
    accounts.forEach((item) => {
      // can't remove rights from themselves
      if (req.adminPanelAccount.account_id === item.account_id) {
        item.modifiable = false;
      } else {
        item.modifiable = true;
      }
    });

    res.status(200).json(accounts);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;
