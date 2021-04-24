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
      RETURNING prompt_id, project_id",
      [req.params.promptId]
    );

    if (updatedPrompt === null) {
      res.status(400).json({ msg: "Invalid prompt ID." });
      return;
    }

    await db.none(
      "UPDATE project SET last_edited_at = NOW(), last_edited_by = $1 WHERE project_id = $2",
      [req.adminPanelAccount.account_id, updatedPrompt.project_id]
    );
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
      "SELECT prompt_id, project_id FROM prompt WHERE prompt_id = $1 AND deleted = FALSE",
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

    await db.none(
      "UPDATE project SET last_edited_at = NOW(), last_edited_by = $1 WHERE project_id = $2",
      [req.adminPanelAccount.account_id, currentPrompt.project_id]
    );
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

// ADMIN: Add prompt to specified project
router.post("/", async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  try {
    const addedPrompt = await db.one(
      "INSERT INTO prompt \
      (project_id, description, image, instructions, created_by, last_edited_by) \
      VALUES ($1, $2, $3, $4, $5, $6) \
      RETURNING prompt_id, project_id",
      [
        req.body.project_id,
        req.body.description,
        req.body.image_data ? true : false,
        req.body.instructions,
        req.adminPanelAccount.account_id,
        req.adminPanelAccount.account_id,
      ]
    );

    await db.none(
      "UPDATE project SET last_edited_at = NOW(), last_edited_by = $1 WHERE project_id = $2",
      [req.adminPanelAccount.account_id, addedPrompt.project_id]
    );

    try {
      await filestore.updatePromptImage(
        addedPrompt.prompt_id,
        req.body.image_data
      );
    } catch (fileError) {
      console.warn(`File upload unsuccessful: ${fileError.message}`);
      res
        .status(500)
        .json({ msg: `Unable to update image: ${fileError.message}` });
      return;
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

// ADMIN PANEL: Get a prompt with its full details and image
router.get("/:promptId", [param("promptId").isInt()], async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  if (!validationResult(req).isEmpty()) {
    res.status(400).json({ msg: "Invalid input value types." });
    return;
  }

  try {
    const prompt = await db.oneOrNone(
      "SELECT * \
      FROM prompt \
      WHERE prompt_id = $1 AND deleted = FALSE \
      ORDER BY prompt_id ASC",
      [req.params.promptId]
    );

    if (prompt === null) {
      res.status(400).json({ msg: "Invalid prompt ID." });
      return;
    }

    if (prompt.image) {
      prompt.image_data = await filestore.getPromptImage(
        prompt.prompt_id,
        false
      );
    }

    res.status(200).json(prompt);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
