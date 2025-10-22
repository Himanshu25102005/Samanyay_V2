var express = require("express");
var router = express.Router();
const userModel = require("./users");
const session = require("express-session");

const passport = require("passport");
require("./auth");

const isloggedin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("http://localhost:3000/login");
  }
};



/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("<a href='/api/auth/google'>Click to authenticate<a>");
});

// Test endpoint to check if backend is working
router.get("/api/test", function (req, res, next) {
  res.json({ message: "Backend is working!", timestamp: new Date() });
});

router.post("/api/register", (req, res) => {
  console.log("Registration request received:", req.body);
  
  const data = new userModel({
    name: req.body.name,
    email: req.body.email,
    username: req.body.email, // passport-local-mongoose uses username field
  });

  userModel.register(data, req.body.password)
    .then((user) => {
      console.log("User registered successfully:", user);
      
      // Use passport authentication after registration
      passport.authenticate("local")(req, res, () => {
        res.json({ 
          success: true, 
          message: "Registration and authentication successful",
          user: { name: user.name, email: user.email }
        });
      });
    })
    .catch((error) => {
      console.error("Registration error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Registration failed", 
        error: error.message 
      });
    });
});


router.post("/api/login", (req, res, next) => {
  console.log("Login request received:", req.body);
  
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Authentication error", 
        error: err.message 
      });
    }
    
    if (!user) {
      console.log("Authentication failed:", info);
      return res.status(401).json({ 
        success: false, 
        message: info.message || "Authentication failed" 
      });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Login failed", 
          error: err.message 
        });
      }
      
      console.log("User logged in successfully:", user);
      return res.json({ 
        success: true, 
        message: "Login successful",
        user: { name: user.name, email: user.email }
      });
    });
  })(req, res, next);
});

router.get("/new", function (req, res, next) {
  res.send("Hello from samanyay");
});

// Get current user data
router.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("User authenticated:", req.user);
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo || req.user.avatar,
        googleId: req.user.google_id
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }
});

router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  (req, res) => {
    res.send("Logged in");
  }
);

// Google OAuth callback route
router.get(
  "/api/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000" }),
  (req, res) => {
    console.log("Google OAuth successful, redirecting to profile...");
    // Redirect to frontend profile page
    res.redirect("http://localhost:3000/profile");
  }
);

router.get("/api/legal-research", isloggedin, (req, res) => {
  res.redirect("http://localhost:3000/Legal-Research");
});

router.get("/api/Drafting-Assistant", isloggedin, (req, res) => {
  res.redirect("http://localhost:3000/Drafting-Assistant");
});

router.get("/api/Document-Analysis", isloggedin, (req, res) => {
  res.redirect("http://localhost:3000/Document-Analysis");
});

module.exports = router;
