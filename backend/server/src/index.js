require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json()); // for parsing json body content in requests

app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/projects", require("./routes/api/projects"));
app.use("/api/recordings", require("./routes/api/recordings"));
app.use("/api/sessions", require("./routes/api/sessions"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Express server running...");
});
