// =====================================================
// SETUX CENTRALIZED API SERVICE
// Bridges Node.js Backend (5000) & FastAPI AI Engine (8000)
// =====================================================

export const NODE_API_BASE = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000/api";
export const AI_API_BASE = import.meta.env.VITE_AI_API_URL || "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// =====================================================
// 1. AUTHENTICATION (NODE BACKEND)
// =====================================================

export const authAPI = {
  signup: async (name, email, password) => {
    const response = await fetch(`${NODE_API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${NODE_API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  adminLogin: async (username, password) => {
    const response = await fetch(`${NODE_API_BASE}/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },
};

// =====================================================
// 2. CITIZEN PROBLEM MANAGEMENT (NODE + AI MULTI-AGENT)
// =====================================================

export const problemsAPI = {
  createProblem: async (problemData) => {
    const response = await fetch(`${NODE_API_BASE}/problems`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(problemData),
    });
    return response.json();
  },

  getMyProblems: async () => {
    const response = await fetch(`${NODE_API_BASE}/problems/my-problems`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getProblemById: async (id) => {
    const response = await fetch(`${NODE_API_BASE}/problems/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getAllProblems: async () => {
    const response = await fetch(`${NODE_API_BASE}/problems/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Direct AI Engine check (Fallback / Direct query)
  getAIProblemDetails: async (problemId) => {
    const response = await fetch(`${AI_API_BASE}/ai/problems/${problemId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },
};

// =====================================================
// 3. ADMIN & UNIVERSITY MANAGEMENT (FASTAPI AI ENGINE)
// =====================================================

export const adminAPI = {
  getPendingProblems: async () => {
    const response = await fetch(`${AI_API_BASE}/admin/problems/pending`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },

  getAllProblemsAdmin: async () => {
    const response = await fetch(`${AI_API_BASE}/admin/problems/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },

  approveUniversity: async (problemId, universityIndex = 0) => {
    const response = await fetch(
      `${AI_API_BASE}/admin/problems/${problemId}/approve-university?university_index=${universityIndex}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  previewUniversityEmail: async (problemId) => {
    const response = await fetch(
      `${AI_API_BASE}/admin/problems/${problemId}/university-email-preview`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  sendUniversityEmail: async (problemId, recipientEmail) => {
    const response = await fetch(
      `${AI_API_BASE}/admin/problems/${problemId}/send-university-email?recipient_email=${encodeURIComponent(
        recipientEmail
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  respondAsUniversity: async (problemId, responseChoice) => {
    const response = await fetch(
      `${AI_API_BASE}/universities/problems/${problemId}/respond?response=${responseChoice}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },
};

// =====================================================
// 4. SOLUTION & INDUSTRY MATCHING (FASTAPI AI ENGINE)
// =====================================================

export const industryAPI = {
  analyzeSolution: async (problemId, solutionTitle, solutionDescription, technologies = []) => {
    const response = await fetch(`${AI_API_BASE}/ai/analyze-solution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problem_id: problemId,
        solution_title: solutionTitle,
        solution_description: solutionDescription,
        technologies,
      }),
    });
    return response.json();
  },

  findIndustries: async (problemId, solutionTitle, solutionDescription, technologies = []) => {
    const response = await fetch(`${AI_API_BASE}/ai/find-industries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problem_id: problemId,
        solution_title: solutionTitle,
        solution_description: solutionDescription,
        technologies,
      }),
    });
    return response.json();
  },

  getPendingIndustryRecommendations: async () => {
    const response = await fetch(
      `${AI_API_BASE}/admin/industry-recommendations/pending`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  getIndustryRecommendationsForProblem: async (problemId) => {
    const response = await fetch(
      `${AI_API_BASE}/admin/industry-recommendations/problem/${problemId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  approveIndustry: async (recommendationId, industryIndex = 0) => {
    const response = await fetch(
      `${AI_API_BASE}/admin/industry-recommendations/${recommendationId}/approve-industry?industry_index=${industryIndex}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  rejectIndustryRecommendation: async (recommendationId) => {
    const response = await fetch(
      `${AI_API_BASE}/admin/industry-recommendations/${recommendationId}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  previewIndustryEmail: async (recommendationId) => {
    const response = await fetch(
      `${AI_API_BASE}/admin/industry-recommendations/${recommendationId}/industry-email-preview`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  sendIndustryEmail: async (recommendationId, recipientEmail) => {
    const response = await fetch(
      `${AI_API_BASE}/admin/industry-recommendations/${recommendationId}/send-industry-email?recipient_email=${encodeURIComponent(
        recipientEmail
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  markInvitationSent: async (recommendationId) => {
    const response = await fetch(
      `${AI_API_BASE}/industry/${recommendationId}/mark-invitation-sent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  respondAsIndustry: async (recommendationId, responseChoice) => {
    const response = await fetch(
      `${AI_API_BASE}/industry/${recommendationId}/respond?response=${responseChoice}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },
};

export const governmentAPI = {
  // Escalate from industry recommendation (industry declined path)
  escalateToGovernment: async (recommendationId, escalationReason = "all_failed") => {
    const response = await fetch(
      `${AI_API_BASE}/government/escalate/${recommendationId}?escalation_reason=${escalationReason}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  // Escalate directly from problem ID (university rejection path)
  escalateProblemToGovernment: async (problemId, escalationReason = "university_rejected") => {
    const response = await fetch(
      `${AI_API_BASE}/government/escalate-problem/${problemId}?escalation_reason=${escalationReason}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  getGovernmentReports: async () => {
    const response = await fetch(`${AI_API_BASE}/government/reports`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },

  getGovernmentReportForProblem: async (problemId) => {
    const response = await fetch(
      `${AI_API_BASE}/government/reports/problem/${problemId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  updateReportStatus: async (reportId, status) => {
    const response = await fetch(
      `${AI_API_BASE}/government/reports/${reportId}/status?status=${status}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },
};

