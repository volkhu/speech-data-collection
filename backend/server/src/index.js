require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json({ limit: 16e6 })); // for parsing json body content in requests, set limit to 16 MB

app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/projects", require("./routes/api/projects"));
app.use("/api/prompts", require("./routes/api/prompts"));
app.use("/api/recordings", require("./routes/api/recordings"));
app.use("/api/sessions", require("./routes/api/sessions"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Express server running...");
});
