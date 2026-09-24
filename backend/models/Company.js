const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "teleGlobals International Pvt. Ltd.",
    },
    logo: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    corporateOfficeAddress: {
      type: String,
      default:
        "Cerebrum IT Park, B-3, Office No.4B, Kalyani Nagar, Pune, Maharashtra - 411014",
      trim: true,
    },
    otherLocations: {
      type: [String],
      default: [],
    },
    contactNumber: {
      type: String,
      default: "",
      trim: true,
    },
    contactEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    ceoName: {
      type: String,
      default: "",
      trim: true,
    },
    founderName: {
      type: String,
      default: "",
      trim: true,
    },
    badgesAndCertificates: {
      type: [String],
      default: [],
    },
    mission: {
      type: String,
      default: "",
      trim: true,
    },
    vision: {
      type: String,
      default: "",
      trim: true,
    },
    // URL or data URL for the company deck PDF / presentation.
    companyDeckUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);
