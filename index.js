const connectToMongo = require("./database");
connectToMongo();

const path = require("path");
const express = require('express');
var cors = require('cors')
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  methods: ["GET", "PUT", "POST", "DELETE"]
}))
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/notes', require('./routes/notes'));

// --------------------------deployment------------------------------
const __dir = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dir, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dir, "client", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}
app.listen(PORT, () => {
  console.log(`Memosify running on ${PORT}`)
});