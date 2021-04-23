const express = require("express");
const { param, validationResult } = require("express-validator");
const db = require("../../db/db");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// ADMIN PANEL: Delete prompt with specified ID.
router.delete("/:promptId", [param("promptId").isInt()], async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  if (!validationResult(req).isEmpty()) {
    res.sendStatus(400);
    return;
  }

  try {
    await db.none("UPDATE prompt SET deleted = TRUE WHERE prompt_id = $1", [
      req.params.promptId,
    ]);
  } catch (error) {
    res.sendStatus(500);
    return;
  }

  res.sendStatus(200);
});

// ADMIN PANEL: Update prompt with specified ID.
router.put("/:promptId", [param("promptId").isInt()], async (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  if (!validationResult(req).isEmpty()) {
    res.sendStatus(400);
    return;
  }

  try {
    const hasImage = req.body.image_data ? true : false;
    await db.none(
      "UPDATE prompt \
      SET description = $1, image = $2, instructions = $3, last_edited_at = NOW() \
      WHERE prompt_id = $4 AND deleted = FALSE",
      [
        req.body.description,
        hasImage,
        req.body.instructions,
        req.params.promptId,
      ]
    );

    if (hasImage) {
      savePromptImage(req.params.promptId, req.body.image_data);
    }
  } catch (error) {
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

const savePromptImage = (promptId, imageData) => {
  const fileDir = path.join(
    __dirname,
    "../../../files/prompt_images/",
    `${promptId}.jpg`
  );
  console.log(fileDir);

  try {
    const innerImageData = imageData.split(",")[1];

    fs.writeFileSync(fileDir, innerImageData, {
      encoding: "base64",
    });
  } catch (err) {
    console.error(err);
  }

  console.log("Has image");
  return;
};

module.exports = router;
