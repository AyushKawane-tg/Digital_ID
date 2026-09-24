const QRCode = require("qrcode");

/**
 * Builds the public digital ID URL that a scanned QR code should open.
 * FRONTEND_URL comes from .env so the same code works on localhost or a LAN IP.
 */
const getDigitalIdUrl = (employeeId) => {
  let frontendUrl = (process.env.FRONTEND_URL || "https://khjnrb9t-5173.inc1.devtunnels.ms/").trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(frontendUrl)) {
    frontendUrl = `http://${frontendUrl}`;
  }
  return `${frontendUrl}/id/${employeeId}`;
};

/**
 * Generates a high-resolution QR code (PNG data URL) that points to
 * the employee's public digital ID page.
 */
const generateEmployeeQR = async (employeeId) => {
  const digitalIdUrl = getDigitalIdUrl(employeeId);

  try {
    const qrCode = await QRCode.toDataURL(digitalIdUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 480,
      margin: 2,
      color: {
        dark: "#0b3a75",
        light: "#ffffff",
      },
    });

    return {
      employeeId,
      digitalIdUrl,
      qrCode,
    };
  } catch (error) {
    const qrError = new Error("Failed to generate QR code");
    qrError.statusCode = 500;
    qrError.cause = error;
    throw qrError;
  }
};

module.exports = {
  getDigitalIdUrl,
  generateEmployeeQR,
};
