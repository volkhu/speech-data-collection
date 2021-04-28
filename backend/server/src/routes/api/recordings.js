const express = require("express");
const { body, validationResult } = require("express-validator");
const path = require("path");
const router = express.Router();
const db = require("../../db/db");
const fs = require("fs");

// APP: Upload a new recording associated with a given project.
router.post(
  "/",
  [
    body("project_id").isInt(),
    body("prompt_id").isInt(),
    body("recorded_file").isBase64(),
    body("duration_in_seconds").isFloat(),
  ],
  async (req, res) => {
    if (!req.mobileAppProfile) {
      res.status(401).json({ msg: "Insufficient privileges." });
      return;
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
      return;
    }

    try {
      const session = await db.oneOrNone(
        db.getQuery("sessions/get-active-session"),
        {
          profile_id: req.mobileAppProfile.profile_id,
          project_id: req.body.project_id,
        }
      );

      if (!session) {
        res.status(403).json({
          msg: "Invalid session ID.",
        });
        return;
      }

      const createdRecording = await db.oneOrNone(
        db.getQuery("recordings/create-recording"),
        {
          session_id: session.session_id,
          prompt_id: req.body.prompt_id,
          duration_in_seconds: req.body.duration_in_seconds,
        }
      );

      if (!createdRecording) {
        res.status(400).json({ msg: "Recording already exists." });
        return;
      }

      // build paths for the audio file
      const fileDir = path.join(
        __dirname,
        "../../../files/audio/",
        `project_${session.project_id}/profile_${session.profile_id}/session_${session.session_id}/`
      );
      const fileName = `project_${session.project_id}_profile_${session.profile_id}_session_${session.session_id}_prompt_${req.body.prompt_id}.m4a`;
      const filePath = path.join(fileDir, fileName);

      // create directory if needed, decode base64, save file
      try {
        await fs.promises.mkdir(fileDir, { recursive: true });
        await fs.promises.writeFile(filePath, req.body.recorded_file, "base64");
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Failed to save audio file." });
        return;
      }

      res.status(200).json({
        recording_id: createdRecording.recording_id,
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
    /*
    db.task(async (t) => {
      // check that a valid session exists and the user has access to it with their device
      const session = await t.oneOrNone(
        "SELECT session.* FROM session INNER JOIN profile USING(profile_id) WHERE profile.device_id = $1 AND session.session_id = $2",
        [req.headers["x-deviceid"], req.body.session_id]
      );
      if (!session) {
        res
          .status(400)
          .json({ msg: "Invalid session ID and device ID combination." });
        return;
      }

      // check that a valid prompt exists
      const prompt = await t.oneOrNone(
        "SELECT * FROM prompt WHERE prompt_id = $1 AND project_id = $2",
        [req.body.prompt_id, session.project_id]
      );
      if (!prompt) {
        res
          .status(400)
          .json({ msg: "Invalid prompt ID and session ID combination." });
        return;
      }

      // insert recording into the database
      const recording = await t.oneOrNone(
        "INSERT INTO recording (session_id, prompt_id, duration_in_seconds) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING recording_id",
        [session.session_id, req.body.prompt_id, req.body.duration_in_seconds]
      );
      console.log(recording);
      if (!recording) {
        res.status(400).json({ msg: "Recording already exists." });
        return;
      }

      // build paths for the audio file
      const fileDir = path.join(
        __dirname,
        "../../../files/audio/",
        `project_${session.project_id}/profile_${session.profile_id}/session_${session.session_id}/`
      );
      const fileName = `project_${session.project_id}_prompt_${prompt.prompt_id}_rec_${recording.recording_id}.wav`;
      const filePath = path.join(fileDir, fileName);
      //console.log(filePath);

      // create directory if needed, decode base64, save file
      try {
        await fs.promises.mkdir(fileDir, { recursive: true });
        await fs.promises.writeFile(filePath, req.body.recorded_file, "base64");
      } catch (error) {
        console.log("ERROR: ", error);
        res.status(500).json({ msg: "Failed to save audio file." });
        return;
      }

      res.status(200).json(recording);
    }).catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });*/
  }
);

module.exports = router;
