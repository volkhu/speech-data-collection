const express = require("express");
const db = require("../../db/db");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// ADMIN: Delete prompt with specified ID
router.delete("/:promptId", (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  db.none("UPDATE prompt SET deleted = TRUE WHERE prompt_id = $1", [
    req.params.promptId,
  ])
    .then((data) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

// ADMIN: Update prompt with specified ID
router.put("/:promptId", (req, res) => {
  if (!req.adminPanelAccount || !req.adminPanelAccount.has_admin_access) {
    res.sendStatus(401);
    return;
  }

  db.none(
    "UPDATE prompt SET description = $1, image = $2, instructions = $3, last_edited_at = NOW() WHERE prompt_id = $4 AND deleted = FALSE",
    [
      req.body.description,
      req.body.image_data ? true : false,
      req.body.instructions,
      req.params.promptId,
    ]
  )
    .then((data) => {
      if (req.body.image_data) {
        savePromptImage(req.params.promptId, req.body.image_data);
      }

      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
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
