// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const connectDB = require("./config/db");

// const problemRoutes = require("./routes/problem.routes");

// const app = express();

// // ==============================
// // DATABASE
// // ==============================

// connectDB();

// // ==============================
// // MIDDLEWARE
// // ==============================

// app.use(cors());
// app.use(express.json());

// // ==============================
// // ROUTES
// // ==============================

// app.get("/", (req, res) => {
//   res.json({
//     message: "SetuX Backend is running 🚀",
//   });
// });

// app.use("/api/problems", problemRoutes);

// // ==============================
// // SERVER
// // ==============================

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`SetuX server running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const problemRoutes = require("./routes/problem.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// ==============================
// DATABASE
// ==============================

connectDB();

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// ROUTES
// ==============================

app.get("/", (req, res) => {
  res.json({
    message: "SetuX Backend is running 🚀",
  });
});

// Problem routes
app.use("/api/problems", problemRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// ==============================
// SERVER
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SetuX server running on port ${PORT}`);
});