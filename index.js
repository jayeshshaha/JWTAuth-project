const express = require("express");
const userModel = require("./db");
const { render } = require("ejs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

async function isAuthenticated(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "secret");
    //    console.log(decoded);
    req.user = await userModel.findById(decoded._id); // storing all users infomation
    next();
  } else {
    res.render("login");
  }
}

app.get("/", isAuthenticated, (req, res) => {
  // console.log(`User data: ${req.user}` );
  res.render("logout", { name: req.user.name });
});

app.get("/register", async (req, res) => {
  res.render("register");
});
app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let userExists = await userModel.findOne({ email });
  if (userExists) {
    return res.redirect("/login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
  });
  const token = jwt.sign({ _id: user._id }, "secret");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.redirect("/register");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { message: "Incorrect password !!" });
  }
  const token = jwt.sign({ _id: user._id }, "secret");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(3001, () => {
  console.log("Server Up!");
});
