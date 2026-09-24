const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      default: "teleGlobals International Pvt. Ltd.",
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    reportingHead: {
      type: String,
      required: [true, "Reporting head is required"],
      trim: true,
    },
    officeAddress: {
      type: String,
      required: [true, "Office address is required"],
      trim: true,
      default: "Cerebrum IT Park, B-3, Office No.4B, Kalyani Nagar, Pune, Maharashtra - 411014",
    },
    bloodGroup: {
      type: String,
      default: "",
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: "",
      trim: true,
    },
    dateOfJoining: {
      type: String,
      default: "",
      trim: true,
    },
    emergencyNo: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    instagram: {
      type: String,
      default: "",
      trim: true,
    },
    facebook: {
      type: String,
      default: "",
      trim: true,
    },
    // Stored as a URL or a base64 data URL.
    photo: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
    // Self-registered profiles wait for admin approval before the digital ID is active.
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
