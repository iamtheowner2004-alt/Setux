import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  adminAPI,
  industryAPI,
  governmentAPI,
  problemsAPI,
} from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  // State
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProblem, setSelectedProblem] = useState(null);

  // Email Modal State (University)
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [matchingUniversities, setMatchingUniversities] = useState(false);

  // Email Modal State (Industry)
  const [industryEmailModalOpen, setIndustryEmailModalOpen] = useState(false);
  const [industryEmailPreview, setIndustryEmailPreview] = useState(null);
  const [industryRecipientEmail, setIndustryRecipientEmail] = useState("");
  const [sendingIndustryEmail, setSendingIndustryEmail] = useState(false);
  const [industryEmailStatus, setIndustryEmailStatus] = useState("");

  // Solution Submission / Industry Discovery State
  const [solutionModalOpen, setSolutionModalOpen] = useState(false);
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionDesc, setSolutionDesc] = useState("");
  const [solutionTech, setSolutionTech] = useState("IoT Sensors, Solar Powered Filtration, Telemetry");
  const [findingIndustries, setFindingIndustries] = useState(false);
  const [industryRecommendations, setIndustryRecommendations] = useState(null);

  // Government Report Modal State
  const [govReportModalOpen, setGovReportModalOpen] = useState(false);
  const [govReport, setGovReport] = useState(null);
  const [loadingGovReport, setLoadingGovReport] = useState(false);

  // Action status notification
  const [actionMessage, setActionMessage] = useState("");

  // Section references
  const overviewRef = useRef(null);
  const problemsRef = useRef(null);
  const universityRef = useRef(null);
  const industryRef = useRef(null);
  const governmentRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // =====================================================
  // FETCH PROBLEMS
  // =====================================================

  // Admin Authentication Guard
  const [adminUser, setAdminUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch problems from AI backend
      const res = await adminAPI.getAllProblemsAdmin();
      if (res.success && res.problems) {
        setProblems(res.problems);
        if (res.problems.length > 0 && !selectedProblem) {
          setSelectedProblem(res.problems[0]);
        }
      } else {
        // Fallback to Node backend
        const nodeRes = await problemsAPI.getAllProblems();
        if (nodeRes.success && nodeRes.problems) {
          setProblems(nodeRes.problems);
          if (nodeRes.problems.length > 0 && !selectedProblem) {
            setSelectedProblem(nodeRes.problems[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load admin problems:", err);
      setError("Unable to connect to backend server. Please verify services are running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminUser");
    const normalUser = localStorage.getItem("user");

    let validAdmin = false;
    let parsedAdmin = null;

    if (storedAdmin) {
      try {
        parsedAdmin = JSON.parse(storedAdmin);
        if (parsedAdmin.role === "admin") validAdmin = true;
      } catch (e) {}
    } else if (normalUser) {
      try {
        parsedAdmin = JSON.parse(normalUser);
        if (parsedAdmin.role === "admin") validAdmin = true;
      } catch (e) {}
    } else if (adminToken) {
      validAdmin = true;
    }

    if (!validAdmin) {
      navigate("/admin/login");
      return;
    }

    setAdminUser(
      parsedAdmin || {
        name: "CSMU Admin",
        username: "csmuadmin",
        role: "admin",
      }
    );
    loadData();
  }, []);

  // Sync selected problem recommendations whenever selected
  useEffect(() => {
    if (selectedProblem) {
      const probId = selectedProblem._id || selectedProblem.problem_id;
      // Check if industry recommendations exist for this problem
      industryAPI
        .getIndustryRecommendationsForProblem(probId)
        .then((res) => {
          if (res.success && res.latest_recommendation) {
            setIndustryRecommendations(res.latest_recommendation);
          } else {
            setIndustryRecommendations(null);
          }
        })
        .catch(() => setIndustryRecommendations(null));

      // Check if government report exists for this problem
      governmentAPI
        .getGovernmentReportForProblem(probId)
        .then((res) => {
          if (res.success && res.report) {
            setGovReport(res.report);
          } else {
            setGovReport(null);
          }
        })
        .catch(() => setGovReport(null));
    }
  }, [selectedProblem]);

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 5000);
  };

  // =====================================================
  // UNIVERSITY ACTIONS
  // =====================================================

  const handleMatchUniversities = async (probId) => {
    try {
      setMatchingUniversities(true);
      const res = await adminAPI.matchUniversities(probId);
      if (res.success && res.university_recommendations) {
        const rawUnis = res.university_recommendations;
        const uniArray = Array.isArray(rawUnis)
          ? rawUnis
          : (rawUnis.top_universities || []);
        showNotification(`✓ Matched ${uniArray.length} Indian universities via OpenAlex!`);
        await loadData();
        setSelectedProblem((prev) => ({
          ...prev,
          university_recommendations: uniArray,
          ai_analysis: res.ai_analysis || prev.ai_analysis,
        }));
      } else {
        showNotification("✕ Unable to match universities. Please try again.");
      }
    } catch (err) {
      console.error("Match universities error:", err);
      showNotification("✕ Error running OpenAlex university matcher.");
    } finally {
      setMatchingUniversities(false);
    }
  };

  const handleApproveUniversity = async (probId, uniIndex) => {
    try {
      const res = await adminAPI.approveUniversity(probId, uniIndex);
      if (res.success) {
        showNotification(`✓ ${res.message || "University approved for outreach!"}`);
        await loadData();
        // Update selected problem
        setSelectedProblem((prev) => ({
          ...prev,
          status: "approved_for_university_outreach",
          selected_university_index: uniIndex,
          selected_university: prev.university_recommendations?.[uniIndex],
        }));
      }
    } catch (err) {
      alert("Failed to approve university: " + err.message);
    }
  };

  const handleOpenEmailPreview = async (probId) => {
    try {
      setEmailStatus("");
      setEmailModalOpen(true);
      const res = await adminAPI.previewUniversityEmail(probId);
      if (res.success) {
        setEmailPreview(res);
        setRecipientEmail(res.suggested_recipient || "dean_rnd@iitb.ac.in");
      }
    } catch (err) {
      alert("Failed to generate email preview: " + err.message);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      alert("Please specify a recipient email address.");
      return;
    }
    setSendingEmail(true);
    setEmailStatus("");
    try {
      const probId = selectedProblem._id || selectedProblem.problem_id;
      const res = await adminAPI.sendUniversityEmail(probId, recipientEmail);
      if (res.success) {
        setEmailStatus("✓ Outreach email dispatched successfully via SMTP!");
        showNotification("✓ Formal outreach email dispatched to university!");
        await loadData();
        setSelectedProblem((prev) => ({
          ...prev,
          status: "university_contacted",
        }));
        setTimeout(() => setEmailModalOpen(false), 2000);
      }
    } catch (err) {
      setEmailStatus("❌ Failed to send email: " + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSimulateUniversityResponse = async (responseChoice) => {
    try {
      const probId = selectedProblem._id || selectedProblem.problem_id;
      const res = await adminAPI.respondAsUniversity(probId, responseChoice);
      if (res.success) {
        showNotification(`✓ Recorded university response: ${responseChoice.toUpperCase()}`);
        await loadData();
        setSelectedProblem((prev) => ({
          ...prev,
          status: res.new_status || res.status,
          university_response: responseChoice,
        }));

        // If university decline triggered government escalation
        if (res.government_escalation?.report) {
          setGovReport(res.government_escalation.report);
          scrollToSection(governmentRef);
        }
      }
    } catch (err) {
      alert("Failed to record university response: " + err.message);
    }
  };

  // =====================================================
  // SOLUTION & INDUSTRY ACTIONS
  // =====================================================

  const handleFindIndustries = async (e) => {
    e.preventDefault();
    if (!solutionTitle.trim() || !solutionDesc.trim()) {
      alert("Please provide a solution title and technical description.");
      return;
    }
    setFindingIndustries(true);
    try {
      const probId = selectedProblem._id || selectedProblem.problem_id;
      const techList = solutionTech.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await industryAPI.findIndustries(probId, solutionTitle, solutionDesc, techList);
      if (res.success) {
        setIndustryRecommendations(res.recommendation || res);
        setSolutionModalOpen(false);
        showNotification(`✓ Discovered & ranked Indian industry partners via DuckDuckGo & Gemini!`);
        await loadData();
        scrollToSection(industryRef);
      }
    } catch (err) {
      alert("Industry discovery failed: " + err.message);
    } finally {
      setFindingIndustries(false);
    }
  };

  const handleApproveIndustry = async (recId, indIndex) => {
    try {
      const res = await industryAPI.approveIndustry(recId, indIndex);
      if (res.success) {
        showNotification(`✓ ${res.message || "Industry partner approved for collaboration!"}`);
        // Reload industry recommendation
        const probId = selectedProblem._id || selectedProblem.problem_id;
        const indRes = await industryAPI.getIndustryRecommendationsForProblem(probId);
        if (indRes.success) setIndustryRecommendations(indRes.latest_recommendation);
        await loadData();
      }
    } catch (err) {
      alert("Failed to approve industry: " + err.message);
    }
  };

  const handleOpenIndustryEmailPreview = async (recId) => {
    try {
      setIndustryEmailStatus("");
      setIndustryEmailModalOpen(true);
      const res = await industryAPI.previewIndustryEmail(recId);
      if (res.success) {
        setIndustryEmailPreview(res);
        setIndustryRecipientEmail(res.suggested_recipient || "partnerships@company.com");
      }
    } catch (err) {
      alert("Failed to generate industry email preview: " + err.message);
    }
  };

  const handleSendIndustryEmail = async () => {
    if (!industryRecipientEmail.trim()) {
      alert("Please specify a recipient email address.");
      return;
    }
    setSendingIndustryEmail(true);
    setIndustryEmailStatus("");
    try {
      const recId = industryRecommendations._id;
      const res = await industryAPI.sendIndustryEmail(recId, industryRecipientEmail);
      if (res.success) {
        setIndustryEmailStatus("✓ Collaboration outreach email dispatched successfully via SMTP!");
        showNotification("✓ Formal invitation email dispatched to industry partner!");
        const probId = selectedProblem._id || selectedProblem.problem_id;
        const indRes = await industryAPI.getIndustryRecommendationsForProblem(probId);
        if (indRes.success) setIndustryRecommendations(indRes.latest_recommendation);
        await loadData();
        setTimeout(() => setIndustryEmailModalOpen(false), 2000);
      }
    } catch (err) {
      setIndustryEmailStatus("❌ Failed to send email: " + err.message);
    } finally {
      setSendingIndustryEmail(false);
    }
  };

  const handleMarkIndustryInvited = async (recId) => {
    try {
      const res = await industryAPI.markInvitationSent(recId);
      if (res.success) {
        showNotification("✓ Formal invitation recorded as sent to industry partner!");
        const probId = selectedProblem._id || selectedProblem.problem_id;
        const indRes = await industryAPI.getIndustryRecommendationsForProblem(probId);
        if (indRes.success) setIndustryRecommendations(indRes.latest_recommendation);
      }
    } catch (err) {
      alert("Failed to mark invitation sent: " + err.message);
    }
  };

  const handleSimulateIndustryResponse = async (recId, respChoice) => {
    try {
      const res = await industryAPI.respondAsIndustry(recId, respChoice);
      if (res.success) {
        showNotification(`✓ Recorded Industry Response: ${respChoice.toUpperCase()}`);
        const probId = selectedProblem._id || selectedProblem.problem_id;
        const indRes = await industryAPI.getIndustryRecommendationsForProblem(probId);
        if (indRes.success) setIndustryRecommendations(indRes.latest_recommendation);
        await loadData();
      }
    } catch (err) {
      alert("Failed to record industry response: " + err.message);
    }
  };

  // =====================================================
  // GOVERNMENT ESCALATION
  // =====================================================

  const handleTriggerGovernmentEscalation = async (recId) => {
    setLoadingGovReport(true);
    try {
      const res = await governmentAPI.escalateToGovernment(recId, "all_failed");
      if (res.success) {
        setGovReport(res.report);
        showNotification("✓ Executive Government Escalation Report synthesized by Gemini AI!");
        await loadData();
      }
    } catch (err) {
      alert("Government escalation failed: " + err.message);
    } finally {
      setLoadingGovReport(false);
    }
  };

  const handleTriggerProblemGovernmentEscalation = async (probId, reason = "university_rejected") => {
    setLoadingGovReport(true);
    try {
      const res = await governmentAPI.escalateProblemToGovernment(probId, reason);
      if (res.success) {
        setGovReport(res.report);
        showNotification("✓ Direct Government Policy Escalation Brief generated by Gemini AI!");
        await loadData();
        scrollToSection(governmentRef);
      }
    } catch (err) {
      alert("Government escalation failed: " + err.message);
    } finally {
      setLoadingGovReport(false);
    }
  };

  const handleUpdateGovReportStatus = async (reportId, newStatus) => {
    try {
      const res = await governmentAPI.updateReportStatus(reportId, newStatus);
      if (res.success) {
        showNotification(`✓ Government status updated to: ${newStatus.replace(/_/g, " ").toUpperCase()}`);
        if (govReport) {
          setGovReport((prev) => ({
            ...prev,
            status: newStatus,
          }));
        }
      }
    } catch (err) {
      alert("Failed to update government status: " + err.message);
    }
  };

  const handleExportGovReport = () => {
    if (!govReport) return;
    const reportData = JSON.stringify(govReport, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Government_Policy_Briefing_${selectedProblem?.title?.replace(/\s+/g, "_") || "Report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("✓ Policy briefing downloaded as JSON!");
  };

  // Format Helper
  const formatStatus = (s) => {
    const map = {
      pending_admin_review: "Pending Review",
      "Pending Review": "Pending Review",
      approved_for_university_outreach: "University Approved",
      university_contacted: "Email Dispatched",
      university_accepted: "University Accepted",
      pending_next_university: "Next HEI Pending",
      all_universities_declined: "All HEIs Declined",
      industry_approved: "Industry Approved",
      industry_invited: "Industry Invited",
      industry_collaboration_started: "Collaboration Active",
      pending_next_industry: "Next Industry Pending",
      industry_declined: "Industry Declined",
      escalated_to_government: "Gov Escalated",
    };
    return map[s] || s || "Pending Review";
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case "university_accepted":
      case "industry_collaboration_started":
        return "bg-green-100 text-green-700 border-green-200";
      case "escalated_to_government":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "approved_for_university_outreach":
      case "university_contacted":
      case "industry_approved":
      case "industry_invited":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "all_universities_declined":
      case "industry_declined":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-[#e5e3dc] bg-white px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-[#183153]"
          >
            Setu<span className="text-[#3c8d87]">X</span>
          </Link>
          <span className="rounded-full bg-[#183153] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
            AI Multi-Agent Control Center
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-[#3c8d87]/30 bg-[#edf6f4] px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            <span className="text-xs font-bold text-[#183153]">
              {adminUser?.username || "csmuadmin"}
            </span>
            <span className="rounded bg-[#183153] px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white">
              Admin
            </span>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminUser");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/");
            }}
            className="text-sm font-semibold text-[#b85d5d] transition hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="fixed bottom-0 left-0 top-[72px] z-40 hidden w-60 border-r border-[#e5e3dc] bg-white lg:block">
        <div className="flex h-full flex-col p-4">
          <div className="px-3 pb-4 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#89918a]">
              Administration
            </p>
            <p className="mt-1 text-sm font-bold text-[#183153]">
              HITL Workflow
            </p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => scrollToSection(overviewRef)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#5e6871] transition hover:bg-[#edf3f1] hover:text-[#183153]"
            >
              <span>📊</span> Overview
            </button>

            <button
              onClick={() => scrollToSection(problemsRef)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#5e6871] transition hover:bg-[#edf3f1] hover:text-[#183153]"
            >
              <span>📋</span> Problems ({problems.length})
            </button>

            <button
              onClick={() => scrollToSection(universityRef)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#5e6871] transition hover:bg-[#edf3f1] hover:text-[#183153]"
            >
              <span>🎓</span> HEI Discovery & Outreach
            </button>

            <button
              onClick={() => scrollToSection(industryRef)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#5e6871] transition hover:bg-[#edf3f1] hover:text-[#183153]"
            >
              <span>🏢</span> Industry Matcher
            </button>

            <button
              onClick={() => scrollToSection(governmentRef)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#5e6871] transition hover:bg-[#edf3f1] hover:text-[#183153]"
            >
              <span>🏛️</span> Gov Escalation
            </button>
          </nav>

          <div className="mt-auto border-t border-[#e5e3dc] pt-4">
            <div className="rounded-xl bg-[#f5f6f2] p-4">
              <p className="text-xs font-bold text-[#183153]">SetuX HITL Core</p>
              <p className="mt-1 text-[11px] leading-5 text-[#89918a]">
                AI analyzes & ranks. Administrator inspects, overrides & approves.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="pt-[72px] lg:pl-60">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
          {/* ACTION NOTIFICATION BANNER */}
          {actionMessage && (
            <div className="mb-6 animate-fade-in rounded-xl border border-green-300 bg-green-50 p-4 text-sm font-bold text-green-800 shadow-sm">
              {actionMessage}
            </div>
          )}

          {/* =================================================
              OVERVIEW & KPIS
          ================================================= */}
          <section ref={overviewRef} className="scroll-mt-28">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
                  Autonomous Agent Monitoring
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#183153] sm:text-4xl">
                  Admin Control Center
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#6d7780]">
                  Human-in-the-Loop oversight for NLP Problem Analysis, OpenAlex Academic Matcher, DuckDuckGo Industry Grounding, and Policy Escalation.
                </p>
              </div>

              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#e5e3dc] px-4 py-2 text-xs font-bold text-[#183153] shadow-xs hover:bg-[#fafbf8]"
              >
                🔄 Refresh Live Data
              </button>
            </div>

            {/* KPI STATS */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="rounded-xl border border-[#e5e3dc] bg-white p-5">
                <strong className="text-2xl font-extrabold text-[#183153]">
                  {problems.length}
                </strong>
                <p className="mt-1 text-xs text-[#6d7780]">Total Ingested</p>
              </div>

              <div className="rounded-xl border border-[#e5e3dc] bg-white p-5">
                <strong className="text-2xl font-extrabold text-amber-700">
                  {
                    problems.filter(
                      (p) =>
                        p.status === "pending_admin_review" ||
                        p.status === "Pending Review"
                    ).length
                  }
                </strong>
                <p className="mt-1 text-xs text-[#6d7780]">Pending Review</p>
              </div>

              <div className="rounded-xl border border-[#e5e3dc] bg-white p-5">
                <strong className="text-2xl font-extrabold text-[#3c8d87]">
                  {
                    problems.filter((p) =>
                      p.status?.includes("university") || p.status === "Approved"
                    ).length
                  }
                </strong>
                <p className="mt-1 text-xs text-[#6d7780]">HEI Outreach</p>
              </div>

              <div className="rounded-xl border border-[#e5e3dc] bg-white p-5">
                <strong className="text-2xl font-extrabold text-blue-700">
                  {
                    problems.filter((p) => p.status?.includes("industry")).length
                  }
                </strong>
                <p className="mt-1 text-xs text-[#6d7780]">Industry Match</p>
              </div>

              <div className="rounded-xl border border-[#e5e3dc] bg-white p-5">
                <strong className="text-2xl font-extrabold text-purple-700">
                  {
                    problems.filter((p) => p.status === "escalated_to_government")
                      .length
                  }
                </strong>
                <p className="mt-1 text-xs text-[#6d7780]">Gov Escalated</p>
              </div>
            </div>
          </section>

          {/* =================================================
              ACTIVE PROBLEM SELECTOR & AI DETAILS
          ================================================= */}
          <section ref={problemsRef} className="mt-12 scroll-mt-28">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#183153]">
                  Problems & AI Intelligence
                </h2>
                <p className="mt-1 text-xs text-[#89918a]">
                  Select any problem to review AI extraction, OpenAlex HEIs, and initiate outreach.
                </p>
              </div>

              <span className="rounded-full bg-[#edf3f1] px-3 py-1 text-xs font-bold text-[#3c8d87]">
                {problems.length} Problems Loaded
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-[#e5e3dc] bg-white p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3c8d87] border-t-transparent"></div>
                <p className="mt-4 text-sm font-semibold text-[#6d7780]">
                  Loading live problems from SetuX AI Engine...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-semibold text-red-700">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-3 rounded-lg bg-[#183153] px-4 py-2 text-xs font-bold text-white"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* PROBLEM LIST COLUMN */}
                <div className="space-y-3 lg:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#89918a]">
                    Select Problem
                  </p>
                  <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
                    {problems.map((prob) => {
                      const isSelected =
                        selectedProblem &&
                        (selectedProblem._id === prob._id ||
                          selectedProblem.problem_id === prob.problem_id);
                      return (
                        <div
                          key={prob._id || prob.problem_id}
                          onClick={() => setSelectedProblem(prob)}
                          className={`cursor-pointer rounded-xl border p-4 transition ${
                            isSelected
                              ? "border-[#3c8d87] bg-[#edf6f4] shadow-sm"
                              : "border-[#e5e3dc] bg-white hover:border-[#ccd9d6]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-2 text-sm font-bold text-[#183153]">
                              {prob.title}
                            </h4>
                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                                prob.status
                              )}`}
                            >
                              {formatStatus(prob.status)}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs text-[#6d7780]">
                            {prob.description}
                          </p>

                          <div className="mt-3 flex items-center justify-between text-[11px] text-[#8a9298]">
                            <span>📍 {prob.location || prob.address || "India"}</span>
                            <span>
                              {prob.university_recommendations?.length || 0} HEIs
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SELECTED PROBLEM DETAIL & AI PRE-ANALYSIS */}
                <div className="space-y-6 lg:col-span-2">
                  {selectedProblem ? (
                    <div className="rounded-2xl border border-[#e5e3dc] bg-white p-6 shadow-sm">
                      <div className="flex flex-col justify-between gap-3 border-b border-[#eeeeea] pb-5 sm:flex-row sm:items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#3c8d87]">
                              Active Problem
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusBadge(
                                selectedProblem.status
                              )}`}
                            >
                              {formatStatus(selectedProblem.status)}
                            </span>
                          </div>
                          <h3 className="mt-1 text-xl font-extrabold text-[#183153]">
                            {selectedProblem.title}
                          </h3>
                        </div>

                        <Link
                          to={`/problem/${selectedProblem._id || selectedProblem.problem_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#3c8d87] hover:underline"
                        >
                          Public View ↗
                        </Link>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#89918a]">
                          Citizen Statement
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#35414c]">
                          {selectedProblem.description}
                        </p>
                      </div>

                      {/* AI EXTRACTION CARDS */}
                      {selectedProblem.ai_analysis && (
                        <div className="mt-6 rounded-xl border border-[#dce8e5] bg-[#edf3f1] p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">🤖</span>
                            <h4 className="font-bold text-[#183153] text-sm">
                              Gemini 3.6 Flash Extraction
                            </h4>
                          </div>

                          <p className="text-xs leading-5 text-[#35414c] mb-4">
                            {selectedProblem.ai_analysis.summary}
                          </p>

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-lg bg-white p-3 border border-[#dce8e5]">
                              <p className="text-[10px] text-[#89918a]">Domain</p>
                              <p className="text-xs font-bold text-[#183153]">
                                {selectedProblem.ai_analysis.category || "General"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-white p-3 border border-[#dce8e5]">
                              <p className="text-[10px] text-[#89918a]">Severity</p>
                              <p className="text-xs font-bold text-amber-700">
                                {selectedProblem.ai_analysis.severity || "Normal"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-white p-3 border border-[#dce8e5]">
                              <p className="text-[10px] text-[#89918a]">Priority Score</p>
                              <p className="text-xs font-bold text-[#3c8d87]">
                                {selectedProblem.ai_analysis.priority_score || 85} / 100
                              </p>
                            </div>

                            <div className="rounded-lg bg-white p-3 border border-[#dce8e5]">
                              <p className="text-[10px] text-[#89918a]">OpenAlex HEIs</p>
                              <p className="text-xs font-bold text-[#183153]">
                                {selectedProblem.university_recommendations?.length || 0} Found
                              </p>
                            </div>
                          </div>

                          {selectedProblem.ai_analysis.required_expertise?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {selectedProblem.ai_analysis.required_expertise.map((e, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-[#183153] border border-[#dce8e5]"
                                >
                                  🔬 {e}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#e5e3dc] bg-white p-12 text-center text-sm text-[#89918a]">
                      Select a problem on the left to view details and manage AI workflows.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              UNIVERSITY RECOMMENDATIONS & OUTREACH
          ================================================= */}
          <section ref={universityRef} className="mt-16 scroll-mt-28">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
                  Academic Matcher (Agent 3)
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#183153]">
                  University Recommendations & Outreach
                </h2>
                <p className="mt-1 text-xs text-[#89918a]">
                  Ranked Higher Education Institutions (HEIs) retrieved dynamically from OpenAlex with bibliographic RAG.
                </p>
              </div>

              {selectedProblem && (
                <span className="text-xs font-bold text-[#183153]">
                  Selected: <span className="text-[#3c8d87]">{selectedProblem.title}</span>
                </span>
              )}
            </div>

            {(() => {
              const uniList = Array.isArray(selectedProblem?.university_recommendations)
                ? selectedProblem.university_recommendations
                : (selectedProblem?.university_recommendations?.top_universities || []);

              return selectedProblem && uniList.length > 0 ? (
                <div className="space-y-4">
                  {uniList.map((uni, idx) => {
                  const isApproved =
                    selectedProblem.selected_university_index === idx ||
                    (selectedProblem.selected_university?.name === uni.name);
                  const isContacted = selectedProblem.status === "university_contacted";
                  const isAccepted = selectedProblem.status === "university_accepted";

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-5 transition sm:p-6 ${
                        isApproved
                          ? "border-[#3c8d87] bg-white ring-2 ring-[#3c8d87]/20"
                          : "border-[#e5e3dc] bg-white"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="flex gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf6f4] text-xl font-bold text-[#3c8d87]">
                            #{idx + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-[#183153]">
                                {uni.name}
                              </h3>
                              {isApproved && (
                                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                                  Approved Candidate
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-[#6d7780]">
                              📍 {uni.location || uni.country || "India"}
                              {uni.official_website && (
                                <>
                                  {" • "}
                                  <a
                                    href={uni.official_website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#3c8d87] hover:underline"
                                  >
                                    Official Site ↗
                                  </a>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Match Score */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-[#3c8d87]">
                              {uni.match_score || 90}% Match
                            </span>
                            <p className="text-[10px] text-[#89918a]">
                              OpenAlex Score
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Evidence & Query Match */}
                      <div className="mt-4 grid gap-3 border-t border-[#eeeeea] pt-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase text-[#89918a]">
                            Publication & Research Volume
                          </p>
                          <p className="mt-1 text-xs text-[#35414c]">
                            {uni.relevant_papers
                              ? `${uni.relevant_papers} papers indexed on topic`
                              : uni.reason || "Leading national research center"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase text-[#89918a]">
                            Matched Search Query
                          </p>
                          <p className="mt-1 text-xs font-mono text-[#3c8d87]">
                            "{uni.matched_query || "Sustainable Civic Solutions"}"
                          </p>
                        </div>
                      </div>

                      {/* Admin HITL Actions */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeeea] pt-4">
                        <div className="flex items-center gap-2">
                          {!isApproved ? (
                            <button
                              onClick={() =>
                                handleApproveUniversity(
                                  selectedProblem._id || selectedProblem.problem_id,
                                  idx
                                )
                              }
                              className="rounded-lg bg-[#183153] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#102945]"
                            >
                              Approve {uni.name} →
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleOpenEmailPreview(
                                    selectedProblem._id || selectedProblem.problem_id
                                  )
                                }
                                className="rounded-lg bg-[#3c8d87] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2e6d68]"
                              >
                                ✉️ Preview Outreach Email
                              </button>

                              <button
                                onClick={() =>
                                  handleOpenEmailPreview(
                                    selectedProblem._id || selectedProblem.problem_id
                                  )
                                }
                                className="rounded-lg border border-[#3c8d87] bg-white px-4 py-2 text-xs font-bold text-[#3c8d87] transition hover:bg-[#edf6f4]"
                              >
                                Send via SMTP
                              </button>
                            </>
                          )}
                        </div>

                        {isApproved && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#89918a]">Simulate HEI:</span>
                            <button
                              onClick={() => handleSimulateUniversityResponse("accept")}
                              className="rounded bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-200"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleSimulateUniversityResponse("decline")}
                              className="rounded bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"
                            >
                              ✕ Decline (Fallback)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : selectedProblem ? (
              <div className="rounded-2xl border border-dashed border-[#3c8d87]/40 bg-[#f7fbfa] p-8 text-center sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6f4] text-2xl text-[#3c8d87]">
                  🏛️
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#183153]">
                  No Academic Matches Found Yet for "{selectedProblem.title}"
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-[#6d7780]">
                  Run our Academic Matcher AI Agent (Agent 3) to dynamically query the live OpenAlex 
                  bibliographic database, analyze research publications, and rank the top Indian Higher 
                  Education Institutions (IITs, NITs, Central Universities) tailored to this specific civic problem.
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() =>
                      handleMatchUniversities(
                        selectedProblem._id || selectedProblem.problem_id
                      )
                    }
                    disabled={matchingUniversities}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#3c8d87] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#2e6d68] disabled:opacity-50"
                  >
                    {matchingUniversities ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Searching OpenAlex Live Academic Database...
                      </>
                    ) : (
                      <>
                        ⚡ Search & Match Universities via OpenAlex (Live AI)
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e5e3dc] bg-white p-8 text-center text-sm text-[#89918a]">
                Select a problem above to inspect matched universities.
              </div>
            );
            })()}
          </section>

          {/* =================================================
              INDUSTRY DISCOVERY & COLLABORATION
          ================================================= */}
          <section ref={industryRef} className="mt-16 scroll-mt-28">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
                  Industry Matcher (Agent 4)
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#183153]">
                  Industry Discovery & Commercialization
                </h2>
                <p className="mt-1 text-xs text-[#89918a]">
                  Real-time Indian industry identification via DuckDuckGo Live Search and anti-hallucination Gemini verification.
                </p>
              </div>

              {selectedProblem && (
                <button
                  onClick={() => setSolutionModalOpen(true)}
                  className="rounded-xl bg-[#183153] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#102945]"
                >
                  + Submit University Solution & Match Industries
                </button>
              )}
            </div>

            {industryRecommendations &&
            industryRecommendations.recommended_industries?.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#dce8e5] bg-[#edf3f1] p-4 text-xs text-[#183153]">
                  <strong>Active Solution Proposal:</strong>{" "}
                  {industryRecommendations.solution_title || "Technical Solution Framework"}
                </div>

                {industryRecommendations.recommended_industries.map((ind, idx) => {
                  const isApproved =
                    industryRecommendations.selected_industry_index === idx ||
                    ind.status === "approved";
                  const isInvited = ind.status === "invited";
                  const isAccepted = ind.status === "accepted";
                  const isDeclined = ind.status === "declined";

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-5 transition ${
                        isApproved
                          ? "border-blue-500 bg-white ring-2 ring-blue-500/20"
                          : "border-[#e5e3dc] bg-white"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-[#183153]">
                              {ind.company_name || ind.name}
                            </h3>
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                              🇮🇳 {ind.india_relevance || "High Relevance"}
                            </span>
                            {isApproved && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                Approved Partner
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[#6d7780]">
                            {ind.website ? (
                              <a
                                href={ind.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#3c8d87] hover:underline"
                              >
                                {ind.website} ↗
                              </a>
                            ) : (
                              "Verified Indian Enterprise"
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-extrabold text-blue-700">
                            {ind.match_score || 92}% Match
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-[#eeeeea] pt-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase text-[#89918a]">
                            Why Recommended by AI
                          </p>
                          <p className="mt-1 text-xs text-[#35414c]">
                            {ind.why_recommended || "Domain capability & market leadership"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase text-[#89918a]">
                            Potential Contribution
                          </p>
                          <p className="mt-1 text-xs text-[#35414c]">
                            {Array.isArray(ind.possible_contribution)
                              ? ind.possible_contribution.join(" • ")
                              : ind.possible_contribution || "Pilot deployment, manufacturing & scaling"}
                          </p>
                        </div>
                      </div>

                      {/* Industry Actions */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eeeeea] pt-4">
                        <div className="flex items-center gap-2">
                          {!isApproved ? (
                            <button
                              onClick={() =>
                                handleApproveIndustry(
                                  industryRecommendations._id,
                                  idx
                                )
                              }
                              className="rounded-lg bg-[#183153] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#102945]"
                            >
                              Approve {ind.company_name || ind.name} →
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleOpenIndustryEmailPreview(
                                    industryRecommendations._id
                                  )
                                }
                                className="rounded-lg bg-[#3c8d87] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2e6d68]"
                              >
                                ✉️ Preview Collaboration Email
                              </button>

                              <button
                                onClick={() =>
                                  handleOpenIndustryEmailPreview(
                                    industryRecommendations._id
                                  )
                                }
                                className="rounded-lg border border-[#3c8d87] bg-white px-4 py-2 text-xs font-bold text-[#3c8d87] transition hover:bg-[#edf6f4]"
                              >
                                Send via SMTP
                              </button>
                            </>
                          )}
                        </div>

                        {isApproved && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#89918a]">Simulate Response:</span>
                            <button
                              onClick={() =>
                                handleSimulateIndustryResponse(
                                  industryRecommendations._id,
                                  "accepted"
                                )
                              }
                              className="rounded bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-200"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() =>
                                handleSimulateIndustryResponse(
                                  industryRecommendations._id,
                                  "not_interested"
                                )
                              }
                              className="rounded bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"
                            >
                              ✕ Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Industry Declined Manual Escalation Banner */}
                {(selectedProblem?.status === "industry_declined" ||
                  industryRecommendations?.status === "industry_declined") &&
                  !govReport && (
                    <div className="mt-4 flex flex-col justify-between gap-4 rounded-xl border border-purple-300 bg-purple-50 p-5 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="text-sm font-bold text-purple-900">
                          ⚠️ Commercial Industry Pathway Exhausted
                        </h4>
                        <p className="mt-1 text-xs text-purple-800">
                          All contacted industry partners have declined. Admin can now manually escalate to Government for state grants & municipal pilot deployment.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleTriggerGovernmentEscalation(industryRecommendations._id)
                        }
                        disabled={loadingGovReport}
                        className="shrink-0 rounded-lg bg-purple-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-800"
                      >
                        🏛️ Escalate to Government Policy
                      </button>
                    </div>
                  )}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e5e3dc] bg-white p-8 text-center text-sm text-[#89918a]">
                No active industry recommendations for this problem yet. Click "+ Submit University Solution & Match Industries" to run real-time DuckDuckGo search.
              </div>
            )}
          </section>

          {/* =================================================
              GOVERNMENT ESCALATION (AGENT 5)
          ================================================= */}
          <section ref={governmentRef} className="mt-16 scroll-mt-28">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[1.5px] text-purple-700">
                  Policy Escalation (Agent 5)
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#183153]">
                  Government & Public Sector Escalation
                </h2>
                <p className="mt-1 text-xs text-[#89918a]">
                  Automated executive policy synthesis generated when academic or commercial pathways are unavailable.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedProblem && (
                  <button
                    onClick={() => {
                      const probId = selectedProblem._id || selectedProblem.problem_id;
                      if (industryRecommendations?._id) {
                        handleTriggerGovernmentEscalation(industryRecommendations._id);
                      } else {
                        handleTriggerProblemGovernmentEscalation(probId, "all_failed");
                      }
                    }}
                    disabled={loadingGovReport}
                    className="rounded-xl bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-800 disabled:opacity-50"
                  >
                    {loadingGovReport
                      ? "Synthesizing Policy Briefing..."
                      : govReport
                      ? "🔄 Regenerate Gov Policy Report"
                      : "⚡ Generate Gov Escalation Report"}
                  </button>
                )}

                {govReport && (
                  <>
                    <button
                      onClick={handleExportGovReport}
                      className="rounded-xl border border-purple-300 bg-white px-3.5 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50"
                      title="Download JSON"
                    >
                      📥 Export Report
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                      title="Print Document"
                    >
                      🖨️ Print
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* University Decline Direct Escalation Banner */}
            {selectedProblem &&
              (selectedProblem.status === "all_universities_declined" ||
                selectedProblem.status === "pending_next_university") &&
              !govReport && (
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      ⚠️ Academic Pipeline Fallback / Escalation Recommended
                    </h4>
                    <p className="mt-1 text-xs text-amber-800">
                      Universities have declined or are unavailable. You can escalate directly to the relevant State Ministry or Municipal Authority for grant allocation.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleTriggerProblemGovernmentEscalation(
                        selectedProblem._id || selectedProblem.problem_id,
                        "university_rejected"
                      )
                    }
                    disabled={loadingGovReport}
                    className="shrink-0 rounded-lg bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800"
                  >
                    🏛️ Escalate Directly to Ministry
                  </button>
                </div>
              )}

            {govReport ? (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-6 shadow-sm">
                {/* Header Card */}
                <div className="flex flex-col justify-between gap-4 border-b border-purple-200 pb-5 lg:flex-row lg:items-center">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">🏛️</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wide text-purple-700">
                          Official Policy Briefing Document
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-[#6d7780]">
                          {govReport.report?.escalation_date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-[#183153]">
                        {govReport.report?.report_title || govReport.report?.executive_summary || "Government Escalation Briefing"}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        govReport.report?.urgency === "Critical"
                          ? "bg-red-100 text-red-700"
                          : govReport.report?.urgency === "High"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      ⚡ {govReport.report?.urgency || "High"} Urgency
                    </span>

                    {/* Government Status Dropdown */}
                    <div className="flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-2.5 py-1 text-xs">
                      <span className="font-bold text-purple-900">Status:</span>
                      <select
                        value={govReport.status || "pending_government_review"}
                        onChange={(e) =>
                          handleUpdateGovReportStatus(govReport._id, e.target.value)
                        }
                        className="bg-transparent font-semibold text-purple-800 outline-none"
                      >
                        <option value="pending_government_review">Pending Review</option>
                        <option value="under_review">Under Department Review</option>
                        <option value="action_taken">Pilot Budget Allocated</option>
                        <option value="implemented">Field Trial Implemented</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-purple-100 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase text-purple-800">Target Ministry</p>
                    <p className="mt-1 text-xs font-bold text-[#183153]">
                      {govReport.report?.suggested_ministry || "Ministry of Housing and Urban Affairs"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-100 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase text-purple-800">State / Municipal Authority</p>
                    <p className="mt-1 text-xs font-bold text-[#183153]">
                      {govReport.report?.suggested_authority_type || "State Municipal Development Department"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-100 bg-white p-4 sm:col-span-2 lg:col-span-1">
                    <p className="text-[11px] font-bold uppercase text-purple-800">Escalation Trigger</p>
                    <p className="mt-1 text-xs font-bold text-[#183153]">
                      {govReport.report?.escalation_reason_code === "university_rejected"
                        ? "Academic R&D Pathway Exhausted"
                        : "Private Sector / Commercial Market Failure"}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="mt-5 space-y-4 text-xs text-[#35414c]">
                  {/* Problem Summary */}
                  {(govReport.report?.problem_summary || govReport.report?.executive_summary) && (
                    <div className="rounded-xl border border-purple-100 bg-white p-5">
                      <p className="font-bold text-purple-900 mb-1">1. Societal Challenge & Impact Summary</p>
                      <p className="leading-6">{govReport.report?.problem_summary || govReport.report?.executive_summary}</p>
                    </div>
                  )}

                  {/* Solution Summary */}
                  {govReport.report?.solution_summary && (
                    <div className="rounded-xl border border-purple-100 bg-white p-5">
                      <p className="font-bold text-purple-900 mb-1">2. Validated Academic Prototype & Solution</p>
                      <p className="leading-6">{govReport.report.solution_summary}</p>
                    </div>
                  )}

                  {/* Industry Outreach Summary */}
                  {govReport.report?.industry_outreach_summary && (
                    <div className="rounded-xl border border-purple-100 bg-white p-5">
                      <p className="font-bold text-purple-900 mb-1">3. Private-Sector Commercialization Record</p>
                      <p className="leading-6">{govReport.report.industry_outreach_summary}</p>
                    </div>
                  )}

                  {/* Reason for Escalation */}
                  {govReport.report?.reason_for_escalation && (
                    <div className="rounded-xl border border-purple-100 bg-white p-5">
                      <p className="font-bold text-purple-900 mb-1">4. Core Reason for Public Authority Intervention</p>
                      <p className="leading-6">{govReport.report.reason_for_escalation}</p>
                    </div>
                  )}

                  {/* Recommended Government Actions */}
                  {(govReport.report?.recommended_government_actions?.length > 0 ||
                    govReport.report?.recommended_government_action) && (
                    <div className="rounded-xl border border-purple-200 bg-purple-100/90 p-5">
                      <p className="font-bold text-purple-950 mb-3 text-sm">
                        5. Recommended Government Directives & Policy Actions
                      </p>
                      {Array.isArray(govReport.report?.recommended_government_actions) ? (
                        <ul className="space-y-2">
                          {govReport.report.recommended_government_actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 font-medium text-purple-950">
                              <span className="mt-0.5 rounded-full bg-purple-700 px-1.5 py-0.2 text-[10px] font-bold text-white">
                                {i + 1}
                              </span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="leading-6 font-semibold">{govReport.report?.recommended_government_action}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e5e3dc] bg-white p-8 text-center text-sm text-[#89918a]">
                No government escalation report generated for this problem yet. Click the button above to synthesize a real-world executive policy briefing.
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =====================================================
          EMAIL PREVIEW & DISPATCH MODAL
      ===================================================== */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeea] pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#3c8d87]">
                  Academic Outreach Dispatch
                </span>
                <h3 className="text-lg font-bold text-[#183153]">
                  Formal University Invitation Email
                </h3>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {emailPreview ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#183153] mb-1">
                    Recipient Email (Dean / HoD / R&D Cell):
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#ccd9d6] p-2.5 text-xs text-[#183153] focus:border-[#3c8d87] focus:outline-hidden"
                    placeholder="dean_rnd@university.ac.in"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#183153] mb-1">
                    Subject:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={emailPreview.email_preview?.subject || emailPreview.subject || "Collaboration Request"}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-[#5e6871]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#183153] mb-1">
                    Email Body:
                  </label>
                  <textarea
                    rows={8}
                    readOnly
                    value={emailPreview.body || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-5 font-mono text-[#35414c]"
                  />
                </div>

                {emailStatus && (
                  <p className="text-xs font-bold text-[#3c8d87]">{emailStatus}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEmailModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="rounded-lg bg-[#3c8d87] px-5 py-2 text-xs font-bold text-white hover:bg-[#2e6d68]"
                  >
                    {sendingEmail ? "Dispatching via SMTP..." : "🚀 Send Email via SMTP"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="p-8 text-center text-xs text-gray-500">
                Generating email preview...
              </p>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          INDUSTRY EMAIL PREVIEW & DISPATCH MODAL
      ===================================================== */}
      {industryEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeea] pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#3c8d87]">
                  Public-Private Commercialization Dispatch
                </span>
                <h3 className="text-lg font-bold text-[#183153]">
                  Formal Industry Collaboration Invitation
                </h3>
              </div>
              <button
                onClick={() => setIndustryEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {industryEmailPreview ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#183153] mb-1">
                    Recipient Email (Partnerships / CSR / R&D Office):
                  </label>
                  <input
                    type="email"
                    value={industryRecipientEmail}
                    onChange={(e) => setIndustryRecipientEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#ccd9d6] p-2.5 text-xs text-[#183153] focus:border-[#3c8d87] focus:outline-hidden"
                    placeholder="partnerships@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#183153] mb-1">
                    Subject:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={
                      industryEmailPreview.email_preview?.subject ||
                      industryEmailPreview.subject ||
                      "Industry Collaboration Request"
                    }
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-[#5e6871]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#183153] mb-1">
                    Email Body:
                  </label>
                  <textarea
                    rows={8}
                    readOnly
                    value={
                      industryEmailPreview.email_preview?.body ||
                      industryEmailPreview.body ||
                      ""
                    }
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-5 font-mono text-[#35414c]"
                  />
                </div>

                {industryEmailStatus && (
                  <p className="text-xs font-bold text-[#3c8d87]">
                    {industryEmailStatus}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIndustryEmailModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendIndustryEmail}
                    disabled={sendingIndustryEmail}
                    className="rounded-lg bg-[#3c8d87] px-5 py-2 text-xs font-bold text-white hover:bg-[#2e6d68]"
                  >
                    {sendingIndustryEmail
                      ? "Dispatching via SMTP..."
                      : "🚀 Send Email via SMTP"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="p-8 text-center text-xs text-gray-500">
                Generating industry email preview...
              </p>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          SOLUTION PROPOSAL & INDUSTRY SEARCH MODAL
      ===================================================== */}
      {solutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeea] pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#3c8d87]">
                  Academic Solution & Industry Match
                </span>
                <h3 className="text-lg font-bold text-[#183153]">
                  Submit University Technical Solution
                </h3>
              </div>
              <button
                onClick={() => setSolutionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFindIndustries} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#183153] mb-1">
                  Solution Title:
                </label>
                <input
                  type="text"
                  required
                  value={solutionTitle}
                  onChange={(e) => setSolutionTitle(e.target.value)}
                  placeholder="e.g. Solar-Powered Adsorptive Filtration Unit"
                  className="w-full rounded-lg border border-[#ccd9d6] p-2.5 text-xs text-[#183153] focus:border-[#3c8d87] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183153] mb-1">
                  Technical Solution Description:
                </label>
                <textarea
                  rows={4}
                  required
                  value={solutionDesc}
                  onChange={(e) => setSolutionDesc(e.target.value)}
                  placeholder="Describe the research prototype, chemical/engineering principles, and deployment readiness..."
                  className="w-full rounded-lg border border-[#ccd9d6] p-2.5 text-xs text-[#183153] focus:border-[#3c8d87] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183153] mb-1">
                  Key Technologies (comma separated):
                </label>
                <input
                  type="text"
                  value={solutionTech}
                  onChange={(e) => setSolutionTech(e.target.value)}
                  placeholder="IoT Sensors, Adsorption Column, Solar Photovoltaic"
                  className="w-full rounded-lg border border-[#ccd9d6] p-2.5 text-xs text-[#183153] focus:border-[#3c8d87] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSolutionModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={findingIndustries}
                  className="rounded-lg bg-[#183153] px-5 py-2 text-xs font-bold text-white hover:bg-[#102945]"
                >
                  {findingIndustries
                    ? "Searching DuckDuckGo & Gemini Ranking..."
                    : "🔍 Discover Indian Industries"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;