const path = require("path");

module.exports = {
  transpileDependencies: ["vuetify"],

  publicPath: "/admin/",
  outputDir: path.resolve(__dirname, "../server/public/admin"),
};
