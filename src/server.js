require("dotenv").config();
// const cookieSession = require("cookie-session");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const passport = require("passport");

const mongoose = require("mongoose");
const connectToDB = require("./config/connectToDB");
const corsOptions = require("./config/corsOptions");
const rootRoute = require("./routes/root");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const createMemoryStore = require("memorystore");
// const Socket = require("./utils/Socket");
const MemoryStore = createMemoryStore(session);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;

connectToDB();

if (process.env.IN_DEVELOPMENT !== "YES") {
  app.set("trust proxy", 1); // trust first proxy
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 * 7,
      sameSite: "none", // Allow cross-site cookies
      secure: true, // Only send cookies over HTTPS
      // domain: ".onrender.com",
      httpOnly: true, // Prevent client-side script access
    },
  })
);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "https://watchify-server.onrender.com",
      "https://watchifyclient.serveo.net/",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");
  app.set("socket", socket);

  // Handle events or broadcast messages as needed
  // For example, you can handle disconnect event, etc.
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

require("./passport");
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  console.log({ passport_user: req?.session.passport?.user });
  res.status(200).json({ msg: "Welcome to Watchify API" });
});

// Routes
app.use("/api", rootRoute);

app.all("*", (req, res) => {
  res.status(404).json({ message: "404 ROUTE NOT FOUND" });
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  server.listen(port, () => console.log(`Listenting on port ${port}...`));
  // Initializes Socket
  // Socket(server);
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

module.exports = app;
