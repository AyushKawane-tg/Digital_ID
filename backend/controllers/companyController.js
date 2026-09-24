const Company = require("../models/Company");

const DEFAULT_COMPANY = {
  name: "teleGlobals International Pvt. Ltd.",
  logo: "",
  about:
    "teleGlobals International Pvt. Ltd. connects global business horizons with technology, talent, and trusted delivery.",
  website: "https://teleglobals.com",
  corporateOfficeAddress:
    "Cerebrum IT Park, B-3, Office No.4B, Kalyani Nagar, Pune, Maharashtra - 411014",
  otherLocations: [],
  contactNumber: "+91 20 0000 0000",
  contactEmail: "info@teleglobals.com",
  ceoName: "",
  founderName: "",
  badgesAndCertificates: [],
  mission: "Deliver reliable digital identity and workplace solutions that keep people and organizations connected.",
  vision: "To be the trusted partner for global businesses building secure, modern workplaces.",
  companyDeckUrl: "",
};

const COMPANY_FIELDS = [
  "name",
  "logo",
  "about",
  "website",
  "corporateOfficeAddress",
  "otherLocations",
  "contactNumber",
  "contactEmail",
  "ceoName",
  "founderName",
  "badgesAndCertificates",
  "mission",
  "vision",
  "companyDeckUrl",
];

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const getOrCreateCompany = async () => {
  let company = await Company.findOne().sort({ createdAt: 1 });
  if (!company) {
    company = await Company.create(DEFAULT_COMPANY);
  }
  return company;
};

const toPublicCompany = (company) => {
  const payload = {};
  COMPANY_FIELDS.forEach((field) => {
    payload[field] = company[field];
  });
  return payload;
};

const getCompany = async (req, res) => {
  try {
    const company = await getOrCreateCompany();
    return res.json({ company: toPublicCompany(company) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch company details", error: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const updates = {};
    COMPANY_FIELDS.forEach((field) => {
      if (req.body[field] === undefined) return;
      if (field === "otherLocations" || field === "badgesAndCertificates") {
        updates[field] = normalizeList(req.body[field]);
      } else {
        updates[field] = req.body[field];
      }
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No company fields provided" });
    }

    const company = await getOrCreateCompany();
    Object.assign(company, updates);
    await company.save();

    return res.json({
      message: "Company details updated",
      company: toPublicCompany(company),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update company details", error: error.message });
  }
};

module.exports = {
  getCompany,
  updateCompany,
  getOrCreateCompany,
  toPublicCompany,
  DEFAULT_COMPANY,
};
