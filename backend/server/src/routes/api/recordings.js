const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../../config/db");
const fs = require("fs");

// APP: Upload a new recording associated with a given session
router.post("/", (req, res) => {
  if (!req.body.recorded_file) {
    res.status(400).json({ msg: "No recorded file provided." });
    return;
  }

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
  });
});

module.exports = router;
