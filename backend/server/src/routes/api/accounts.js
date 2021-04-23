const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../../db/db");
const router = express.Router();

// ADMIN PANEL: Get data about my account, such as whether administrator rights have been granted.
// Used to determine which pages should be accessible to the user.
router.get("/me", async (req, res) => {
  if (!req.adminPanelAccount) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  // we can just send back the data in the request that the authorization middleware provided
  res.status(200).json(req.adminPanelAccount);
});

// ADMIN PANEL: Get a list of all registered accounts. Only available to superusers.
// Used to get the list of accounts to grant privileges to.
router.get("/", async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.is_superuser) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  try {
    let accounts = await db.manyOrNone(
      "SELECT account_id, email, has_admin_access, is_superuser \
      FROM account \
      ORDER BY is_superuser DESC, has_admin_access DESC, email ASC"
    );

    // tell the client which rows can be modified
    accounts.forEach((item) => {
      if (req.adminPanelAccount.account_id === item.account_id) {
        item.modifiable = false; // can't remove rights from themselves
      } else {
        item.modifiable = true;
      }
    });

    res.status(200).json(accounts);
  } catch (error) {
    res.sendStatus(500);
  }
});

// ADMIN PANEL: Update an account's permissions. Only available to superusers.
// Used to grant or remove privileges from another user.
router.put(
  "/",
  [
    body("account_id").isInt(),
    body("is_superuser").isBoolean(),
    body("has_admin_access").isBoolean(),
  ],
  async (req, res) => {
    if (!req.adminPanelAccount || !req.adminPanelAccount.is_superuser) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    if (!validationResult(req).isEmpty()) {
      res.status(400).json({ msg: "Invalid input values." });
      return;
    }

    try {
      if (req.body.account_id === req.adminPanelAccount.account_id) {
        res
          .status(400)
          .json({ msg: "Updating your own account is not permitted." });
        return;
      }

      if (req.body.is_superuser && !req.body.has_admin_access) {
        res.status(400).json({
          msg: "Superuser account without admin privileges is not allowed.",
        });
        return;
      }

      // update in database
      const updatedAccount = await db.oneOrNone(
        "UPDATE account \
        SET has_admin_access = $1, is_superuser = $2 \
        WHERE account_id = $3 RETURNING account_id",
        [req.body.has_admin_access, req.body.is_superuser, req.body.account_id]
      );

      if (updatedAccount == null) {
        res.status(400).json({
          msg: "Invalid account ID.",
        });
        return;
      }
    } catch (error) {
      res.sendStatus(500);
      return;
    }

    res.sendStatus(200);
  }
);

module.exports = router;
