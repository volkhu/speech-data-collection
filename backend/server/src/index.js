require("dotenv").config();
const express = require("express");

// create express app
const app = express();
app.use(express.json({ limit: 16e6 })); // for parsing json body content in requests, set request limit to 16 MB to allow prompt image uploads

app.use(require("./middleware/authentication").adminPanelAuthentication);
app.use(require("./middleware/authentication").mobileAppAuthentication);

app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/projects", require("./routes/api/projects"));
app.use("/api/prompts", require("./routes/api/prompts"));
app.use("/api/recordings", require("./routes/api/recordings"));
app.use("/api/sessions", require("./routes/api/sessions"));
app.use("/api/accounts", require("./routes/api/accounts"));
app.use("/api/settings", require("./routes/api/settings"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Express server running...");
});
