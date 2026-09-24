export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

const CARD_BLUE = "#0088cc";
const CARD_CHARCOAL = "#3a3d42";
const RETURN_ADDRESS =
  "Cerebrum IT Park, B-3, Office No.4B,\nKalyani Nagar, Pune, Maharashtra - 411014";

function firstName(fullName = "") {
  return String(fullName).trim().split(/\s+/)[0] || "Employee";
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Missing image source"));
      return;
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = src;
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawWave(ctx, width, topY, waveHeight) {
  ctx.beginPath();
  ctx.moveTo(0, topY + waveHeight * 0.58);
  ctx.bezierCurveTo(
    width * 0.16,
    topY + waveHeight,
    width * 0.34,
    topY + waveHeight * 0.17,
    width * 0.53,
    topY + waveHeight * 0.42
  );
  ctx.bezierCurveTo(
    width * 0.72,
    topY + waveHeight * 0.67,
    width * 0.88,
    topY + waveHeight * 0.17,
    width,
    topY + waveHeight * 0.46
  );
  ctx.lineTo(width, topY + waveHeight);
  ctx.lineTo(0, topY + waveHeight);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, topY + waveHeight * 0.58);
  ctx.bezierCurveTo(
    width * 0.16,
    topY + waveHeight,
    width * 0.34,
    topY + waveHeight * 0.17,
    width * 0.53,
    topY + waveHeight * 0.42
  );
  ctx.bezierCurveTo(
    width * 0.72,
    topY + waveHeight * 0.67,
    width * 0.88,
    topY + waveHeight * 0.17,
    width,
    topY + waveHeight * 0.46
  );
  ctx.strokeStyle = CARD_BLUE;
  ctx.lineWidth = 6;
  ctx.stroke();
}

/**
 * Draws the same portrait digital ID shown after a QR scan (front + back) and downloads both PNGs.
 */
export async function downloadMiniIdCard({ employee, qrCode, logoSrc }) {
  const front = await renderFrontCard({ employee, qrCode, logoSrc });
  const back = await renderBackCard({ employee });

  downloadDataUrl(front, `${employee.employeeId || "employee"}-id-front.png`);
  // Small delay so browsers don't drop the second download
  await new Promise((resolve) => setTimeout(resolve, 250));
  downloadDataUrl(back, `${employee.employeeId || "employee"}-id-back.png`);
}

async function renderFrontCard({ employee, qrCode, logoSrc }) {
  const width = 720;
  const height = 1144;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const radius = 36;
  roundRect(ctx, 0, 0, width, height, radius);
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const topH = Math.round(height * 0.56);
  const whiteH = Math.round(height * 0.26);
  const footerH = height - topH - whiteH;

  // Photo fills top section edge-to-edge
  ctx.fillStyle = CARD_CHARCOAL;
  ctx.fillRect(0, 0, width, topH);

  try {
    const photo = await loadImage(employee.photo || employee.demoPhoto);
    ctx.drawImage(photo, 0, 0, width, topH);
  } catch {
    drawDemoPortrait(ctx, 0, 0, width, topH);
  }

  // Brand
  try {
    const logo = await loadImage(logoSrc);
    ctx.beginPath();
    ctx.arc(52, 52, 28, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.drawImage(logo, 30, 30, 44, 44);
  } catch {
    // logo optional
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 28px Arial, Helvetica, sans-serif";
  ctx.fillText("teleGlobals", 92, 48);
  ctx.font = "400 11px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("Connecting Global Business Horizons", 92, 66);

  drawWave(ctx, width, topH - 70, 70);

  // White content area
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, topH, width, whiteH + footerH * 0.54);

  // Hello on divider
  ctx.fillStyle = CARD_BLUE;
  ctx.font = "800 84px Arial, Helvetica, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Hello", 36, topH + 18);

  // I am + first name
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.font = "400 28px Arial, Helvetica, sans-serif";
  ctx.fillText("I am", width / 2, topH + 90);
  ctx.font = "800 72px Arial, Helvetica, sans-serif";
  ctx.fillText(firstName(employee.name), width / 2, topH + 160);

  // Blue footer bar
  const footerTop = topH + whiteH;
  ctx.fillStyle = CARD_BLUE;
  ctx.fillRect(0, footerTop + footerH * 0.46, width, footerH * 0.54);

  // QR overlapping white + footer
  const qrSize = 260;
  const qrX = (width - qrSize) / 2;
  const qrY = footerTop - qrSize * 0.55;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);

  const qrImage = await loadImage(qrCode);
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  ctx.textAlign = "left";
  return canvas.toDataURL("image/png");
}

async function renderBackCard({ employee }) {
  const width = 720;
  const height = 1144;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  roundRect(ctx, 0, 0, width, height, 36);
  ctx.clip();
  ctx.fillStyle = CARD_BLUE;
  ctx.fillRect(0, 0, width, height);

  const rows = [
    ["Employee Name", employee.name || "—"],
    ["Employee Id", employee.employeeId || "—"],
    ["Blood Group", employee.bloodGroup || "—"],
    ["Date Of Joining", employee.dateOfJoining || "—"],
    ["Emergency No", employee.emergencyNo || employee.phone || "—"],
  ];

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  let y = 90;
  rows.forEach(([label, value]) => {
    ctx.font = "500 28px Arial, Helvetica, sans-serif";
    ctx.fillText(`${label} : ${value}`, 48, y);
    y += 52;
  });

  y += 10;
  ctx.fillRect(48, y, width - 96, 2);
  y += 50;

  const rules = [
    "1. This card must be displayed by holder while in office.",
    "2. Loss of card must be reported immediately to the issuing authority.",
    "3. This card is not transferable.",
  ];
  ctx.font = "400 24px Arial, Helvetica, sans-serif";
  rules.forEach((rule) => {
    wrapLine(ctx, rule, 48, y, width - 96, 34);
    y += 70;
  });

  y += 40;
  ctx.fillRect(width - 260, y, 200, 2);
  ctx.font = "400 22px Arial, Helvetica, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("issuing Authority", width - 60, y + 30);

  y += 70;
  ctx.textAlign = "left";
  ctx.fillRect(48, y, width - 96, 2);
  y += 50;

  ctx.textAlign = "center";
  ctx.font = "400 24px Arial, Helvetica, sans-serif";
  ctx.fillText("( If found please return to )", width / 2, y);
  y += 40;
  ctx.font = "700 28px Arial, Helvetica, sans-serif";
  ctx.fillText("teleGlobals International Pvt. Ltd.", width / 2, y);
  y += 40;
  ctx.font = "400 22px Arial, Helvetica, sans-serif";
  const address = employee.officeAddress || RETURN_ADDRESS;
  address.split("\n").forEach((line) => {
    ctx.fillText(line, width / 2, y);
    y += 30;
  });

  return canvas.toDataURL("image/png");
}

function wrapLine(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let offsetY = y;
  words.forEach((word, index) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, offsetY);
      line = word;
      offsetY += lineHeight;
    } else {
      line = test;
    }
    if (index === words.length - 1) {
      ctx.fillText(line, x, offsetY);
    }
  });
}

function drawDemoPortrait(ctx, x, y, width, height) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "#4b5563");
  gradient.addColorStop(1, "#1f2937");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = "#f8d5c0";
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height * 0.38, Math.min(width, height) * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height * 0.92, width * 0.28, height * 0.28, 0, Math.PI, 0, true);
  ctx.fill();
}
