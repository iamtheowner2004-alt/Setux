const express = require("express");

const {
  createProblem,
  getAllProblems,
  getMyProblems,
  getProblemById,
} = require("../controllers/problem.controller");

const router = express.Router();


// =====================================================
// CREATE PROBLEM
// =====================================================

router.post("/", createProblem);


// =====================================================
// GET MY PROBLEMS
// =====================================================

router.get("/my-problems", getMyProblems);


// =====================================================
// GET ALL PROBLEMS
// ADMIN WILL USE THIS
// =====================================================

router.get("/all", getAllProblems);


// =====================================================
// GET ONE USER'S PROBLEM
// =====================================================

router.get("/:id", getProblemById);


module.exports = router;