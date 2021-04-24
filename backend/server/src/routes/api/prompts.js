const express = require("express");
const { body, param, validationResult } = require("express-validator");
const db = require("../../config/db");
const filestore = require("../../config/filestore");
const router = express.Router();

// ADMIN PANEL: Delete prompt with specified ID.
router.delete("/:promptId", [param("promptId").isInt()], async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ msg: "Invalid input value types." });
    return;
  }

  try {
    const updatedPrompt = await db.oneOrNone(
      "UPDATE prompt \
      SET deleted = TRUE \
      WHERE prompt_id = $1 \
      RETURNING prompt_id",
      [req.params.promptId]
    );

    if (updatedPrompt === null) {
      res.status(400).json({ msg: "Invalid prompt ID." });
      return;
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

// ADMIN PANEL: Update prompt with specified ID.
router.put("/:promptId", [param("promptId").isInt()], async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ msg: "Invalid input value types." });
    return;
  }

  try {
    const currentPrompt = await db.one(
      "SELECT prompt_id FROM prompt WHERE prompt_id = $1 AND deleted = FALSE",
      [req.params.promptId]
    );

    if (currentPrompt === null) {
      res.status(400).json({ msg: "Invalid prompt ID." });
      return;
    }

    try {
      await filestore.updatePromptImage(
        req.params.promptId,
        req.body.image_data
      );
    } catch (fileError) {
      console.warn(`File upload unsuccessful: ${fileError.message}`);
      res
        .status(500)
        .json({ msg: `Unable to update image: ${fileError.message}` });
      return;
    }

    await db.one(
      "UPDATE prompt \
      SET description = $1, image = $2, instructions = $3, last_edited_at = NOW() \
      WHERE prompt_id = $4 AND deleted = FALSE \
      RETURNING prompt_id",
      [
        req.body.description,
        req.body.image_data ? true : false,
        req.body.instructions,
        req.params.promptId,
      ]
    );
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

// ADMIN: Add prompt to specified project
router.post("/", (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  db.one(
    "INSERT INTO prompt (project_id, description, image, instructions) VALUES ($1, $2, $3, $4) RETURNING prompt_id",
    [
      req.body.project_id,
      req.body.description,
      req.body.image_data ? true : false,
      req.body.instructions,
    ]
  )
    .then((data) => {
      if (req.body.image_data) {
        savePromptImage(data.prompt_id, req.body.image_data);
      }

      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

module.exports = router;
