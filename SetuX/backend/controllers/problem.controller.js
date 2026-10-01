const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Problem = require("../models/problem.model");

// =====================================================
// GET USER FROM JWT
// =====================================================

const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "setux_super_secret_key_2026"
    );
  } catch (error) {
    return null;
  }
};


// =====================================================
// CREATE PROBLEM (WITH AI MULTI-AGENT INGESTION)
// =====================================================

const createProblem = async (req, res) => {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const {
      title,
      description,
      address,
      latitude,
      longitude,
      images,
      videos,
      documents,
    } = req.body;

    if (!title || !description || !address) {
      return res.status(400).json({
        success: false,
        message: "Title, description and address are required",
      });
    }

    const userId = user.userId || user.id;
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    let aiAnalysis = null;
    let universityRecommendations = [];
    let duplicateCheck = null;
    let createdProblemId = null;

    // Call Python FastAPI Multi-Agent Engine (with 20s timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const aiResponse = await fetch(`${aiServiceUrl}/api/ai/analyze-problem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: address,
          address,
          submittedBy: String(userId),
          images: images || [],
          videos: videos || [],
          documents: documents || [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();

        // Duplicate detected by AI Agent
        if (aiData.status === "duplicate_detected" || aiData.isDuplicate) {
          return res.status(200).json({
            success: true,
            status: "duplicate_detected",
            isDuplicate: true,
            message: aiData.message || "A similar problem already exists in our system.",
            duplicate: aiData.duplicate,
            similar_problems: aiData.similar_problems || [],
          });
        }

        if (aiData.success) {
          aiAnalysis = aiData.analysis;
          universityRecommendations = aiData.university_discovery?.top_universities || [];
          duplicateCheck = aiData.duplicate_check;
          createdProblemId = aiData.problem_id;
        }
      }
    } catch (aiError) {
      console.warn("AI Service call notice:", aiError.message);
    }

    let problem;

    // If Python already created the document in MongoDB, update it to ensure consistent user reference
    if (createdProblemId && mongoose.Types.ObjectId.isValid(createdProblemId)) {
      problem = await Problem.findByIdAndUpdate(
        createdProblemId,
        {
          $set: {
            title: title.trim(),
            description: description.trim(),
            address,
            location: address,
            latitude: latitude || null,
            longitude: longitude || null,
            images: images || [],
            videos: videos || [],
            documents: documents || [],
            submittedBy: userId,
            status: "pending_admin_review",
            ai_analysis: aiAnalysis,
            university_recommendations: universityRecommendations,
            aiAnalysis: aiAnalysis
              ? {
                  primaryDomain: aiAnalysis.category || "",
                  relatedDomain: aiAnalysis.subcategory || "",
                  priority: aiAnalysis.severity || "",
                  assessment: aiAnalysis.summary || "",
                }
              : undefined,
            universityMatches: universityRecommendations.map((u) => ({
              name: u.name,
              score: u.match_score || 0,
              reason: u.why_recommended || (u.papers && u.papers.length ? u.papers[0] : "Academic expertise"),
              status: "Pending",
            })),
          },
        },
        { new: true, upsert: false }
      );
    }

    // Fallback if not found or AI service was offline
    if (!problem) {
      problem = await Problem.create({
        title: title.trim(),
        description: description.trim(),
        address,
        location: address,
        latitude: latitude || null,
        longitude: longitude || null,
        images: images || [],
        videos: videos || [],
        documents: documents || [],
        submittedBy: userId,
        status: "pending_admin_review",
        ai_analysis: aiAnalysis,
        university_recommendations: universityRecommendations,
        aiAnalysis: aiAnalysis
          ? {
              primaryDomain: aiAnalysis.category || "",
              relatedDomain: aiAnalysis.subcategory || "",
              priority: aiAnalysis.severity || "",
              assessment: aiAnalysis.summary || "",
            }
          : undefined,
        universityMatches: universityRecommendations.map((u) => ({
          name: u.name,
          score: u.match_score || 0,
          reason: u.why_recommended || (u.papers && u.papers.length ? u.papers[0] : "Academic expertise"),
          status: "Pending",
        })),
      });
    }

    res.status(201).json({
      success: true,
      message: "Problem submitted and analyzed successfully",
      problem,
      problem_id: String(problem._id),
      ai_analysis: aiAnalysis,
      university_discovery: {
        top_universities: universityRecommendations,
      },
      duplicate_check: duplicateCheck,
    });
  } catch (error) {
    console.error("Create problem error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit problem",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL PROBLEMS
// =====================================================

const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });

  } catch (error) {
    console.error("Get all problems error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
};


// =====================================================
// GET ONLY LOGGED-IN USER'S PROBLEMS
// =====================================================

const getMyProblems = async (req, res) => {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const userId = user.userId || user.id;

    const problems = await Problem.find({
      $or: [
        { submittedBy: userId },
        ...(mongoose.Types.ObjectId.isValid(userId) ? [{ submittedBy: new mongoose.Types.ObjectId(userId) }] : [])
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });

  } catch (error) {
    console.error("Get my problems error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your problems",
      error: error.message,
    });
  }
};


// =====================================================
// GET ONE PROBLEM
// =====================================================

const getProblemById = async (req, res) => {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const problemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID format",
      });
    }

    const problem = await Problem.findById(problemId).populate("submittedBy", "name email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });

  } catch (error) {
    console.error("Get problem by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
};


module.exports = {
  createProblem,
  getAllProblems,
  getMyProblems,
  getProblemById,
};