const express = require("express");
const { body, param, validationResult } = require("express-validator");
const db = require("../../db/db");
const filestore = require("../../db/filestore");
const router = express.Router();

// ADMIN PANEL: Delete prompt with specified ID.
router.delete("/:promptId", [param("promptId").isInt()], async (req, res) => {
  if (!req.hasAdminAccess()) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    res.status(400).json(validationErrors);
    return;
  }

  try {
    const updatedPrompt = await db.oneOrNone(
      db.getQuery("prompts/delete-prompt"),
      {
        prompt_id: req.params.promptId,
      }
    );

    if (!updatedPrompt) {
      res.status(400).json({ msg: "Invalid prompt ID." });
      return;
    }

    await db.none(db.getQuery("prompts/update-project-editor"), {
      project_id: updatedPrompt.project_id,
      last_edited_by: req.adminPanelAccount.account_id,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// ADMIN PANEL: Update prompt with specified ID.
router.put(
  "/:promptId",
  [
    param("promptId").isInt(),
    body("description").isString(),
    body("instructions").isString(),
  ],
  async (req, res) => {
    if (!req.hasAdminAccess()) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
      return;
    }

    try {
      const currentPrompt = await db.one(db.getQuery("prompts/get-prompt"), {
        prompt_id: req.params.promptId,
      });

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

      await db.one(db.getQuery("prompts/update-prompt"), {
        description: req.body.description,
        image: req.body.image_data ? true : false,
        instructions: req.body.instructions,
        prompt_id: req.params.promptId,
      });

      await db.none(db.getQuery("prompts/update-project-editor"), {
        project_id: currentPrompt.project_id,
        last_edited_by: req.adminPanelAccount.account_id,
      });

      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

// ADMIN PANEL: Add prompt to specified project.
router.post(
  "/",
  [body("description").isString(), body("instructions").isString()],
  async (req, res) => {
    if (!req.hasAdminAccess()) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
      return;
    }

    try {
      const addedPrompt = await db.one(db.getQuery("prompts/create-prompt"), {
        project_id: req.body.project_id,
        instructions: req.body.instructions,
        description: req.body.description,
        image: req.body.image_data ? true : false,
        created_by: req.adminPanelAccount.account_id,
        last_edited_by: req.adminPanelAccount.account_id,
      });

      await db.none(db.getQuery("prompts/update-project-editor"), {
        project_id: addedPrompt.project_id,
        last_edited_by: req.adminPanelAccount.account_id,
      });

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

      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }
);

// ADMIN PANEL: Get a prompt with its full editable details and image.
router.get("/:promptId", [param("promptId").isInt()], async (req, res) => {
  if (!req.hasAdminAccess()) {
    res.status(401).json({ msg: "Insufficient privileges." });
    return;
  }

  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    res.status(400).json(validationErrors);
    return;
  }

  try {
    const prompt = await db.one(db.getQuery("prompts/get-prompt"), {
      prompt_id: req.params.promptId,
    });

    if (!prompt) {
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
