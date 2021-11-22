const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connected Successfully");
  })
  .catch((err) => {
    console.log("There was an error connecting to the database");
    console.log(err);
  });

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
