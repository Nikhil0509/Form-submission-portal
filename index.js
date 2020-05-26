const express = require("express");
const cors = require("cors");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const mongoose = require("mongoose");
const path = require("path");
const key = require("./config");
const users = require("./model/User");
let user = {};
require("dotenv").config();
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: key.FACEBOOK.clientId,
      clientSecret: key.FACEBOOK.clientSecret,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "emails"],
    },
    function (accessToken, refreshToken, profile, cb) {
      user = { ...profile };
      console.log(profile.emails[0].value);
      users.find({ id: profile.id }).then((docs) => {
        if (docs.length !== 0) {
          return cb(null, user);
        } else {
          let USER = new users();
          USER.id = profile.id;
          USER.email = profile.emails[0].value;
          USER, (url = "");

          USER.save().catch((err) => {
            console.log(err);
          });
        }
      });
      return cb(null, user);
    }
  )
);

const app = express();
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, "build")));

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/facebook");
  }
);
app.get("/user", (req, res) => {
  console.log("getting user data");
  res.send(user);
});
app.get("/logout", (req, res) => {
  console.log("logging out");
  user = {};
  res.redirect("/");
});

app.post("/registerForm", (req, res) => {
  const { email, tel, name, date, url } = req.body;
  console.log(user.id);
  users
    .updateOne(
      { id: user.id },
      { $set: { name, tel, alternate_email: email, birthday: date, url } }
    )
    .then(() => {
      res.json("Submitted");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
require("dotenv").config();

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
//mongoose.Promise = global.Promise;
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});
connection.on("error", (err) => {
  console.log("Error occurred");
});
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
