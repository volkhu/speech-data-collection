const express = require("express");
const db = require("../../db/db");
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
      "SELECT account_id, email, has_admin_access, is_superuser FROM account ORDER BY is_superuser DESC, has_admin_access DESC, email ASC"
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
    console.log(error);
    res.sendStatus(500);
  }
});

// ADMIN PANEL: Update an account's permissions. Only available to superusers.
router.put("/", async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.is_superuser) {
    res.sendStatus(401);
    return;
  }

  try {
    // can't update their own account
    const updatedAccountId = parseInt(req.body.account_id);
    const myAccountId = parseInt(req.adminPanelAccount.account_id);
    if (updatedAccountId === myAccountId) {
      res.sendStatus(400);
      return;
    }

    // can't have a superuser without admin access
    if (req.body.is_superuser && !req.body.has_admin_access) {
      res.sendStatus(400);
      return;
    }

    // update in database
    await db.none(
      "UPDATE account SET has_admin_access = $1, is_superuser = $2 WHERE account_id = $3",
      [req.body.has_admin_access, req.body.is_superuser, updatedAccountId]
    );
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

module.exports = router;
