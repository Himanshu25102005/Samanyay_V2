var express = require("express");
var router = express.Router();
const User = require("./users");
const session = require("express-session");

const passport = require("passport");
require("./auth");

const isloggedin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("https://samanyay-v2.vercel.app/login");
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
  console.log("=== REGISTER REQUEST ===");
  console.log("Registration request received:", req.body);
  console.log("Headers:", req.headers);
  console.log("Origin:", req.get('origin'));
  
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
  console.log("=== LOGIN REQUEST ===");
  console.log("Login request received:", req.body);
  console.log("Headers:", req.headers);
  console.log("Origin:", req.get('origin'));
  
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
        console.error("=== LOGIN ERROR ===");
        console.error("Error:", err);
        console.error("Error message:", err.message);
        console.error("User object:", user);
        console.error("User._id:", user?._id);
        console.error("User.id:", user?.id);
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
  console.log("=== USER API DEBUG ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Is authenticated:", req.isAuthenticated());
  console.log("User object:", req.user);
  console.log("Cookies:", req.cookies);
  console.log("Headers:", req.headers);
  console.log("=====================");
  
  if (req.isAuthenticated() && req.user) {
    console.log("User authenticated:", req.user);
    res.json({
      success: true,
      user: {
        id: req.user._id || req.user.google_id,
        name: req.user.name || req.user.displayName || req.user.username,
        email: req.user.email,
        photo: req.user.photo || req.user.avatar,
        googleId: req.user.google_id
      }
    });
  } else {
    console.log("User not authenticated, returning 401");
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
  passport.authenticate("google", { failureRedirect: "https://samanyay-v2.vercel.app/" }),
  (req, res) => {
    console.log("Google OAuth successful, redirecting to profile...");
    // Redirect to frontend profile page
    res.redirect("https://samanyay-v2.vercel.app/profile");
  }
);

router.get("/api/legal-research", isloggedin, (req, res) => {
  res.redirect("https://samanyay-v2.vercel.app/Legal-Research");
});

router.get("/api/Drafting-Assistant", isloggedin, (req, res) => {
  res.redirect("https://samanyay-v2.vercel.app/Drafting-Assistant");
});

router.get("/api/Document-Analysis", isloggedin, (req, res) => {
  res.redirect("https://samanyay-v2.vercel.app/Document-Analysis");
});

// User registration route
router.post("/api/auth/register", async (req, res) => {
  try {
    console.log("=== REGISTRATION DEBUG ===");
    console.log("Registration data:", req.body);
    
    const { name, email, password, phone } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and password are required" 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Note: In production, hash this password
      phone: phone || '',
      google_id: null,
      photo: null
    });
    
    await newUser.save();
    
    console.log("User registered successfully:", newUser._id);
    
    // Auto-login the user after registration
    req.login(newUser, (err) => {
      if (err) {
        console.error("Auto-login error:", err);
        return res.status(500).json({ success: false, message: "Registration successful but login failed" });
      }
      
      res.json({ 
        success: true, 
        message: "User registered and logged in successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          photo: newUser.photo
        }
      });
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed", 
      error: error.message 
    });
  }
});

// User login route
router.post("/api/auth/login", async (req, res) => {
  try {
    console.log("=== LOGIN DEBUG ===");
    console.log("Login data:", req.body);
    
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
    
    // Check password (Note: In production, use bcrypt to compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
    
    // Login the user
    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, message: "Login failed" });
      }
      
      console.log("User logged in successfully:", user._id);
      
      res.json({ 
        success: true, 
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          photo: user.photo
        }
      });
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Login failed", 
      error: error.message 
    });
  }
});

// Logout route
router.post("/api/auth/logout", (req, res) => {
  console.log("=== LOGOUT DEBUG ===");
  console.log("Session before logout:", req.session);
  console.log("User before logout:", req.user);
  
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ success: false, message: "Session cleanup failed" });
      }
      
      console.log("User logged out successfully");
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
});

router.get("/api/Case-Management", isloggedin, (req, res) => {
  res.redirect("https://samanyay-v2.vercel.app/Case-Management");
});

// Debug route to catch all requests and see what's being called
// Only catch requests that don't start with /api/ to avoid interfering with API routes
router.all("*", (req, res, next) => {
  // Skip if this is an API route that should be handled by other routers
  if (req.url.startsWith('/api/')) {
    // Let the request pass through to other routers
    return next();
  }
  
  console.log("=== 404 REQUEST ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Origin:", req.get('origin'));
  res.status(404).json({ 
    error: "Route not found", 
    method: req.method, 
    url: req.url,
    availableRoutes: [
      "POST /api/register",
      "POST /api/login", 
      "GET /api/user",
      "GET /api/test",
      "GET /api/auth/google",
      "GET /api/google/callback"
    ]
  });
});

module.exports = router;
