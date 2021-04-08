require("dotenv").config();
const express = require("express");
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "286927702746-a7t53zmiqkk4e4xmewumxfzgkbdpb6ad.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const app = express();

app.use(express.json({ limit: 16e6 })); // for parsing json body content in requests, set request limit to 16 MB to allow prompt image uploads

/*passport.serializeUser((user, done) => {
  done(null, 1);
});

passport.deserializeUser((id, done) => { });
*/

app.get("/test22", (req, res) => {
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: "",
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    console.log(payload);
    console.log(userid);
    res.sendStatus(200);
  }
  verify().catch(console.error);
});

app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/projects", require("./routes/api/projects"));
app.use("/api/prompts", require("./routes/api/prompts"));
app.use("/api/recordings", require("./routes/api/recordings"));
app.use("/api/sessions", require("./routes/api/sessions"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Express server running...");
});
