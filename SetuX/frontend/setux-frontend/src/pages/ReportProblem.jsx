import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function ReportProblem() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=/report-problem");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // HANDLE TEXT INPUT
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // GET LOCATION
  // =====================================================

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({
          latitude,
          longitude,
        });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          const data = await response.json();

          if (data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(
              `${latitude}, ${longitude}`
            );
          }
        } catch (error) {
          console.error(
            "Reverse geocoding error:",
            error
          );

          setAddress(
            `${latitude}, ${longitude}`
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationLoading(false);

        setError(
          "Unable to get your location. Please allow location access and try again."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // FILE HANDLERS
  // =====================================================

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);

    setImages(files);
  };

  const handleVideos = (e) => {
    const files = Array.from(e.target.files || []);

    setVideos(files);
  };

  const handleDocuments = (e) => {
    const files = Array.from(e.target.files || []);

    setDocuments(files);
  };

  // =====================================================
  // SUBMIT PROBLEM
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login before reporting a problem."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a problem title.");
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Please describe the problem."
      );
      return;
    }

    if (!address.trim()) {
      setError(
        "Please get your location before submitting."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Currently the backend stores the file names.
       * Actual Cloudinary/file uploading can be connected
       * later without changing the problem ownership logic.
       */

      const imageNames = images.map(
        (file) => file.name
      );

      const videoNames = videos.map(
        (file) => file.name
      );

      const documentNames = documents.map(
        (file) => file.name
      );

      const response = await fetch(
        "http://localhost:5000/api/problems",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            // ⭐ THIS IS THE IMPORTANT PART
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: formData.title.trim(),

            description:
              formData.description.trim(),

            address,

            latitude:
              coordinates.latitude,

            longitude:
              coordinates.longitude,

            images: imageNames,

            videos: videoNames,

            documents: documentNames,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit problem"
        );
      }

      // Handle AI Duplicate Detection
      if (data.status === "duplicate_detected" || data.isDuplicate) {
        const bestMatch = data.duplicate || {};
        setError(
          `⚠️ Duplicate Problem Detected! Our AI agent found an existing similar issue: "${bestMatch.title || "Similar Problem"}" (${bestMatch.similarity || 85}% similarity). Please check if your community issue is already being addressed.`
        );
        setLoading(false);
        return;
      }

      const aiCat = data.ai_analysis?.category || "Societal Challenge";
      const aiSev = data.ai_analysis?.severity || "Active";
      const topUni = data.university_discovery?.top_universities?.[0]?.name;

      setSuccess(
        `✓ Problem submitted & analyzed by SetuX AI! Category: ${aiCat} • Priority: ${aiSev}${topUni ? ` • Matched: ${topUni}` : ""}. Redirecting to your dashboard...`
      );

      // Clear form
      setFormData({
        title: "",
        description: "",
      });

      setAddress("");

      setCoordinates({
        latitude: null,
        longitude: null,
      });

      setImages([]);
      setVideos([]);
      setDocuments([]);

      // Reset file inputs
      const fileInputs =
        document.querySelectorAll(
          'input[type="file"]'
        );

      fileInputs.forEach((input) => {
        input.value = "";
      });

      // Redirect to dashboard or problem
      const newProblemId = data.problem?._id || data.problem_id;
      setTimeout(() => {
        if (newProblemId) {
          navigate(`/problem/${newProblemId}`);
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (error) {
      console.error(
        "Submit problem error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while submitting the problem."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#fbfaf6]">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="border-b border-[#e5e5df] bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-[#183153]"
          >
            Setu<span className="text-[#6bb5ae]">X</span>
          </Link>

          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#6d7780] transition hover:text-[#183153]"
          >
            ← Dashboard
          </Link>

        </div>

      </nav>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">

        {/* HEADER */}

        <div className="mb-8">

          <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
            Report a Problem
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#183153] sm:text-4xl">
            Tell us what is happening
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d7780] sm:text-base">
            Describe the problem around you.
            SetuX's AI agent will analyse it and
            identify the appropriate field automatically.
          </p>

        </div>


        {/* =================================================
            FORM CARD
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e3e3dd] bg-white p-5 shadow-sm sm:p-8"
        >

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>

            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3">

              <p className="text-sm font-semibold text-green-700">
                {success}
              </p>

            </div>
          )}


          {/* =================================================
              TITLE
          ================================================= */}

          <div className="mb-6">

            <label className="text-sm font-bold text-[#35414c]">
              Problem Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your problem a short title"
              required
              disabled={loading}
              className="mt-2 w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/10 disabled:bg-gray-100"
            />

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="mb-6">

            <label className="text-sm font-bold text-[#35414c]">
              Problem Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain the problem in as much detail as possible..."
              rows={7}
              required
              disabled={loading}
              className="mt-2 w-full resize-none rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/10 disabled:bg-gray-100"
            />

            <p className="mt-2 text-xs text-[#8a9298]">
              You don't need to select a category.
              Our AI agent will identify the relevant
              field automatically.
            </p>

          </div>


          {/* =================================================
              LOCATION
          ================================================= */}

          <div className="mb-6 rounded-xl border border-[#e2e5df] bg-[#fafbf8] p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h3 className="text-sm font-bold text-[#183153]">
                  Problem Location
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#6d7780]">
                  We'll automatically detect your
                  current location and convert it into
                  an address.
                </p>

              </div>

              <button
                type="button"
                onClick={getLocation}
                disabled={
                  locationLoading ||
                  loading
                }
                className="rounded-lg bg-[#183153] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102945] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {locationLoading
                  ? "Getting Location..."
                  : "Get My Location"}
              </button>

            </div>


            {/* ADDRESS */}

            {address && (
              <div className="mt-5 rounded-lg border border-[#d8e5e2] bg-white p-4">

                <p className="text-xs font-bold uppercase tracking-wide text-[#3c8d87]">
                  Detected Address
                </p>

                <p className="mt-2 text-sm leading-6 text-[#35414c]">
                  {address}
                </p>

                {coordinates.latitude !== null &&
                  coordinates.longitude !== null && (
                    <p className="mt-2 text-xs text-[#8a9298]">
                      Location detected successfully
                    </p>
                  )}

              </div>
            )}

          </div>


          {/* =================================================
              PHOTOS
          ================================================= */}

          <div className="mb-6">

            <label className="text-sm font-bold text-[#35414c]">
              Add Photos
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              disabled={loading}
              className="mt-2 block w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#183153] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />

            {images.length > 0 && (
              <p className="mt-2 text-xs text-[#6d7780]">
                {images.length} photo
                {images.length !== 1
                  ? "s"
                  : ""} selected
              </p>
            )}

          </div>


          {/* =================================================
              VIDEOS
          ================================================= */}

          <div className="mb-6">

            <label className="text-sm font-bold text-[#35414c]">
              Add Videos
            </label>

            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideos}
              disabled={loading}
              className="mt-2 block w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#183153] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />

            {videos.length > 0 && (
              <p className="mt-2 text-xs text-[#6d7780]">
                {videos.length} video
                {videos.length !== 1
                  ? "s"
                  : ""} selected
              </p>
            )}

          </div>


          {/* =================================================
              DOCUMENTS
          ================================================= */}

          <div className="mb-8">

            <label className="text-sm font-bold text-[#35414c]">
              Add Documents
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              onChange={handleDocuments}
              disabled={loading}
              className="mt-2 block w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#183153] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />

            {documents.length > 0 && (
              <p className="mt-2 text-xs text-[#6d7780]">
                {documents.length} document
                {documents.length !== 1
                  ? "s"
                  : ""} selected
              </p>
            )}

          </div>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#183153] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#102945] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting Problem..."
              : "Submit Problem"}
          </button>

        </form>

      </main>

    </div>
  );
}

export default ReportProblem;