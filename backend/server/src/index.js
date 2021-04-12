require("dotenv").config();
const express = require("express");
const passport = require("passport");
const passportCustom = require("passport-custom");
const { OAuth2Client } = require("google-auth-library");
const db = require("./db/db");

// create express app
const app = express();
app.use(express.json({ limit: 16e6 })); // for parsing json body content in requests, set request limit to 16 MB to allow prompt image uploads

// google ID token authentication strategy for admin panel administrators
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const CustomStrategy = passportCustom.Strategy;
passport.use(
  "google-id",
  new CustomStrategy(async (req, callback) => {
    try {
      // verify client's Google account using the ID token in HTTP Authorization header
      const loginTicket = await client.verifyIdToken({
        idToken: req.headers.authorization,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("loginTicket: " + loginTicket);
      const parsedToken = loginTicket.getPayload();
      const googleId = parsedToken.sub;
      const email = parsedToken.email;

      // check user privileges in database
      let user = await db.oneOrNone(
        "SELECT * FROM administrator WHERE google_id = $1",
        [googleId]
      );

      if (!user) {
        // give rights if this is the first account
        const numAccounts = await db.one(
          "SELECT COUNT(*) AS count FROM administrator"
        );
        const isFirstAccount = numAccounts.count == 0;

        // create a new account without access if one does not exist with this Google ID
        await db.none(
          "INSERT INTO administrator (google_id, email, access_granted, superuser) VALUES ($1, $2, $3, $4)",
          [googleId, email, isFirstAccount, isFirstAccount]
        );
        user = await db.one(
          "SELECT * FROM administrator WHERE google_id = $1",
          [googleId]
        );
      }

      callback(null, user);
    } catch (error) {
      console.log(error);
      callback(null, false);
    }
  })
);

app.use(passport.initialize());
app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/projects", require("./routes/api/projects"));
app.use("/api/prompts", require("./routes/api/prompts"));
app.use("/api/recordings", require("./routes/api/recordings"));
app.use("/api/sessions", require("./routes/api/sessions"));
app.use("/api/administrators", require("./routes/api/administrators"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Express server running...");
});
