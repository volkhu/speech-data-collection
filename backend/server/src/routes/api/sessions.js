const express = require("express");
const router = express.Router();
const db = require("../../db/db");

// APP: Get sessions associated with this project and my device
router.get("/", (req, res) => {
  db.any(
    "SELECT session.* FROM session INNER JOIN profile USING(profile_id) WHERE profile.device_id = $1 AND session.project_id = $2",
    [req.headers["x-deviceid"], req.query.projectId]
  )
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      console.log("ERROR: ", error);
      res.sendStatus(500);
    });
});

// APP: Register a new session for the specified device id and project id
router.post("/", (req, res) => {
  db.task(async (t) => {
    // check if the profile exists for the given device id
    const profile = await t.oneOrNone(
      "SELECT profile_id FROM profile WHERE device_id = $1",
      [req.headers["x-deviceid"]]
    );
    if (!profile) {
      res.status(400).json({
        msg: "Invalid device ID.",
      });
      return;
    }

    // check if project with given id exists
    const project = await t.oneOrNone(
      "SELECT project_id FROM project WHERE project_id = $1",
      [req.body.project_id]
    );
    if (!project) {
      res.status(400).json({ msg: "Invalid project ID." });
      return;
    }

    // create a new session
    const session = await t.oneOrNone(
      "INSERT INTO session (profile_id, project_id) VALUES ($1, $2) RETURNING session_id",
      [profile.profile_id, req.body.project_id]
    );
    if (!session) {
      res.status(500).json({ msg: "Failed to create session." });
      return;
    }

    res.status(200).json(session);
  }).catch((error) => {
    console.log("ERROR: ", error);
    res.sendStatus(500);
  });
});

// APP: Give user a new prompt to record in this session
router.get("/:sessionId/prompt", (req, res) => {
  db.task(async (t) => {
    // check that a valid session exists and the user has access to it with their device
    const session = await t.oneOrNone(
      "SELECT session.* FROM session INNER JOIN profile USING(profile_id) WHERE profile.device_id = $1 AND session.session_id = $2",
      [req.headers["x-deviceid"], req.params.sessionId]
    );
    if (!session) {
      res
        .status(400)
        .json({ msg: "Invalid session ID and device ID combination." });
      return;
    }

    // get a list of prompts in the project that is associated with that session
    const allPromptIds = (
      await t.any("SELECT prompt_id FROM prompt WHERE project_id = $1", [
        session.project_id,
      ])
    ).map((elem) => elem.prompt_id);
    //console.log("All project's prompt IDs: ", allPromptIds);

    // get a list of prompts that the user has already completed
    const completedPromptIds = (
      await t.any("SELECT prompt_id FROM recording WHERE session_id = $1", [
        req.params.sessionId,
      ])
    ).map((elem) => elem.prompt_id);
    //console.log("Completed prompt IDs: ", completedPromptIds);

    // compute the list of prompts still to be completed
    const availablePromptIds = allPromptIds.filter(
      (elem) => !completedPromptIds.includes(elem)
    );
    //console.log("Available prompt IDs: ", availablePromptIds);

    // choose the prompt
    const randomizeOrder = true; // TODO: get from database
    let chosenPromptId = null;
    if (randomizeOrder) {
      // choose a random uncompleted prompt
      chosenPromptId =
        availablePromptIds[
          Math.floor(Math.random() * availablePromptIds.length)
        ];
    } else {
      // choose the first uncompleted prompt
      if (availablePromptIds.length) {
        chosenPromptId = availablePromptIds[0];
      }
    }
    //console.log("Chosen prompt ID: ", chosenPromptId);

    if (!chosenPromptId) {
      // no new prompts available
      res.sendStatus(204);
      return;
    }

    // get the prompt and send to user
    const prompt = await t.one("SELECT * FROM prompt WHERE prompt_id = $1", [
      chosenPromptId,
    ]);
    res.status(200).json(prompt);
  }).catch((error) => {
    console.log("ERROR: ", error);
    res.sendStatus(500);
  });
});

module.exports = router;
