require("dotenv").config();
const express = require("express");
const path = require("path");

// create express app
const app = express();
// use a json body parser with extended request body size limit
// set to 16 MB to allow prompt image uploads
app.use(express.json({ limit: 50e6 }));

// API auth middleware
app.use(require("./middleware/authentication").adminPanelAuthentication);
app.use(require("./middleware/authentication").mobileAppAuthentication);

// API routes
app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/projects", require("./routes/api/projects"));
app.use("/api/prompts", require("./routes/api/prompts"));
app.use("/api/recordings", require("./routes/api/recordings"));
app.use("/api/sessions", require("./routes/api/sessions"));
app.use("/api/accounts", require("./routes/api/accounts"));
app.use("/api/settings", require("./routes/api/settings"));

// serve static front-end files
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));
app.get(/\/admin\/.*/, (req, res) =>
  res.sendFile("admin/index.html", { root: publicDir })
);

app.listen(process.env.PORT || 5000, () => {
  console.log("Express server running...");
});
