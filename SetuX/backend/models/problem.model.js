// const mongoose = require("mongoose");

// const problemSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     address: {
//       type: String,
//       default: "",
//     },

//     latitude: {
//       type: Number,
//       default: null,
//     },

//     longitude: {
//       type: Number,
//       default: null,
//     },

//     images: {
//       type: [String],
//       default: [],
//     },

//     videos: {
//       type: [String],
//       default: [],
//     },

//     documents: {
//       type: [String],
//       default: [],
//     },

//     // AI-generated information
//     domain: {
//       type: String,
//       default: "",
//     },

//     category: {
//       type: String,
//       default: "",
//     },

//     priority: {
//       type: String,
//       default: "",
//     },

//     // Current problem status
//     status: {
//       type: String,
//       enum: [
//         "Pending Review",
//         "Under Review",
//         "Approved",
//         "Rejected",
//       ],
//       default: "Pending Review",
//     },

//     // ⭐ IMPORTANT
//     // Which user submitted this problem?
//     submittedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // AI university/industry results
//     universityMatches: {
//       type: Array,
//       default: [],
//     },

//     industryMatches: {
//       type: Array,
//       default: [],
//     },

//     // Admin decision
//     universityDecision: {
//       type: String,
//       enum: ["Pending", "Approved", "Rejected"],
//       default: "Pending",
//     },

//     industryDecision: {
//       type: String,
//       enum: ["Pending", "Approved", "Rejected"],
//       default: "Pending",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Problem = mongoose.model("Problem", problemSchema);

// module.exports = Problem;
const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },

    documents: {
      type: [String],
      default: [],
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    status: {
      type: String,
      default: "pending_admin_review",
    },

    ai_analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    embedding: {
      type: [Number],
      default: undefined,
    },

    university_recommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    selected_university: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    selected_university_index: {
      type: Number,
      default: null,
    },

    university_response: {
      type: String,
      default: null,
    },

    university_email: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    universityMatches: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    industryMatches: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Problem", problemSchema);