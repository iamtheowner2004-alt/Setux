const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "setux_super_secret_key_2026";

// =====================================================
// SIGN UP
// =====================================================

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
    });

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during signup. Please try again.",
    });
  }
};

// =====================================================
// LOGIN (CITIZEN / USER)
// =====================================================

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || "").toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and password are required",
      });
    }

    // Check for csmuadmin credentials in regular login
    if (
      (identifier === "csmuadmin" || identifier === "csmuadmin@setux.org") &&
      password === "admin1234"
    ) {
      let adminUser = await User.findOne({
        $or: [{ email: "csmuadmin@setux.org" }, { name: "CSMU Admin" }],
      });

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("admin1234", 10);
        adminUser = await User.create({
          name: "CSMU Admin",
          email: "csmuadmin@setux.org",
          password: hashedPassword,
          role: "admin",
        });
      } else if (adminUser.role !== "admin") {
        adminUser.role = "admin";
        await adminUser.save();
      }

      const token = jwt.sign(
        {
          userId: adminUser._id,
          role: "admin",
          name: adminUser.name,
          email: adminUser.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: "admin",
        },
      });
    }

    // Robust case-insensitive lookup by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { name: { $regex: new RegExp(`^${identifier}$`, "i") } },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email/username.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// =====================================================
// ADMIN LOGIN (DEDICATED PORTAL)
// Username: csmuadmin | Password: admin1234
// =====================================================

const adminLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (username || email || "").toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Admin username and password are required",
      });
    }

    const isMasterAdmin =
      (identifier === "csmuadmin" || identifier === "csmuadmin@setux.org") &&
      password === "admin1234";

    let user = await User.findOne({
      $or: [
        { email: identifier },
        { email: `${identifier}@setux.org` },
        { name: identifier },
        { email: "csmuadmin@setux.org" },
      ],
    });

    if (isMasterAdmin) {
      if (!user) {
        const hashedPassword = await bcrypt.hash("admin1234", 10);
        user = await User.create({
          name: "CSMU Admin",
          email: "csmuadmin@setux.org",
          password: hashedPassword,
          role: "admin",
        });
      } else {
        if (user.role !== "admin") {
          user.role = "admin";
          await user.save();
        }
      }
    } else {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access restricted. You do not have administrator permissions.",
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        });
      }
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: "admin",
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin authorization verified",
      token,
      admin: {
        id: user._id,
        name: user.name,
        username: "csmuadmin",
        email: user.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during admin authentication",
    });
  }
};

module.exports = {
  signup,
  login,
  adminLogin,
};