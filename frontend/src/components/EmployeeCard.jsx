import { useState } from "react";
import CompanyLogo from "./CompanyLogo.jsx";
import { demoAvatar } from "./EmployeePhoto.jsx";

const RETURN_ADDRESS =
  "Cerebrum IT Park, B-3, Office No.4B,\nKalyani Nagar, Pune, Maharashtra - 411014";
const CARD_BLUE = "#0088cc";
const CARD_CHARCOAL = "#3a3d42";

function firstName(fullName = "") {
  return String(fullName).trim().split(/\s+/)[0] || "Employee";
}

function EmployeeCard({ employee, qrCode }) {
  const [flipped, setFlipped] = useState(false);

  if (!employee) return null;

  const isActive = employee.status === "ACTIVE";
  const photoSrc = employee.photo || demoAvatar;

  return (
    <div className="w-full max-w-[320px] select-none sm:max-w-[340px]">
      <p className="mb-3 text-center text-xs font-medium text-slate-500">Tap the card to flip</p>

      <div
        className="id-scene mx-auto aspect-[54/86] w-full"
        style={{ perspective: "1400px" }}
        role="button"
        tabIndex={0}
        aria-label="Flip employee ID card"
        onClick={() => setFlipped((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setFlipped((current) => !current);
          }
        }}
      >
        <div
          className={`id-card relative h-full w-full transition-transform duration-700 ease-out ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <FrontFace employee={employee} photoSrc={photoSrc} qrCode={qrCode} isActive={isActive} />
          <BackFace employee={employee} />
        </div>
      </div>
    </div>
  );
}

function FrontFace({ employee, photoSrc, qrCode, isActive }) {
  return (
    <article
      className="id-face absolute inset-0 flex flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.28)]"
      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
    >
      {!isActive ? (
        <div className="absolute right-[-38px] top-9 z-30 rotate-45 bg-red-600 px-12 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          Inactive
        </div>
      ) : null}

      {/* Top — photo stretched to left & right card edges */}
      <div className="relative flex-[0_0_56%] overflow-hidden bg-[#3a3d42]">
        <img
          src={photoSrc}
          alt={employee.name}
          className="absolute inset-0 block"
          style={{
            objectFit: "fill",
            width: "100%",
            height: "100%",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
          onError={(event) => {
            event.currentTarget.src = demoAvatar;
          }}
        />

        <div className="absolute left-3.5 top-3.5 z-20 flex items-center gap-1.5">
          <CompanyLogo className="h-8 w-8 rounded-full bg-white object-contain p-0.5" />
          <div className="leading-none">
            <p className="text-[13px] font-semibold tracking-wide text-white drop-shadow">teleGlobals</p>
            <p className="mt-[2px] max-w-[140px] text-[6px] leading-tight text-white/80 drop-shadow">
              Connecting Global Business Horizons
            </p>
          </div>
        </div>

        <svg
          className="absolute bottom-0 left-0 z-20 h-[48px] w-full"
          viewBox="0 0 320 48"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 28 C50 48 110 8 170 20 C230 32 280 8 320 22 L320 48 L0 48 Z" fill="#ffffff" />
          <path
            d="M0 28 C50 48 110 8 170 20 C230 32 280 8 320 22"
            fill="none"
            stroke={CARD_BLUE}
            strokeWidth="3.5"
          />
        </svg>
      </div>

      {/* Hello — always visible on the wave divider */}
      <p
        className="pointer-events-none absolute left-5 z-40 text-left text-[42px] font-extrabold leading-none tracking-tight sm:text-[46px]"
        style={{ color: CARD_BLUE, top: "52%" }}
      >
        Hello
      </p>

      {/* White — I am + Name centered under Hello */}
      <div
        className={`relative z-10 flex flex-[0_0_26%] flex-col items-center bg-white px-5 pt-9 ${
          isActive ? "" : "opacity-80 grayscale"
        }`}
      >
        <p className="text-center text-[14px] font-normal text-black">I am</p>
        <p className="mt-1 text-center text-[34px] font-extrabold leading-none text-black sm:text-[38px]">
          {firstName(employee.name)}
        </p>
      </div>

      {/* Footer — QR overlaps white + blue bar */}
      <div className="relative z-10 flex flex-[0_0_18%] flex-col">
        <div className="flex-1 bg-white" />
        <div className="h-[46%] w-full" style={{ backgroundColor: CARD_BLUE }} />

        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[28%]">
          {qrCode ? (
            <img
              src={qrCode}
              alt="Employee QR code"
              className="h-[120px] w-[120px] bg-white p-1 sm:h-[130px] sm:w-[130px]"
            />
          ) : (
            <div className="flex h-[120px] w-[120px] items-center justify-center border border-dashed border-slate-300 bg-white text-[10px] text-slate-400 sm:h-[130px] sm:w-[130px]">
              QR
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function BackFace({ employee }) {
  const rows = [
    ["Employee Name", employee.name],
    ["Employee Id", employee.employeeId],
    ["Designation", employee.designation],
    ["Department", employee.department],
    ["Blood Group", employee.bloodGroup || "—"],
    ["Date Of Birth", employee.dateOfBirth || "—"],
    ["Date Of Joining", employee.dateOfJoining || "—"],
    ["Emergency No", employee.emergencyNo || employee.phone || "—"],
    ["LinkedIn", employee.linkedin || "—"],
  ];

  return (
    <article
      className="id-face absolute inset-0 flex flex-col overflow-hidden rounded-[18px] px-5 py-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] sm:px-6"
      style={{
        backgroundColor: CARD_BLUE,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      <div className="space-y-2.5 text-[13px] leading-relaxed sm:text-[14px]">
        {rows.map(([label, value]) => (
          <p key={label}>
            <span className="font-medium">{label} : </span>
            <span className="font-semibold">{value}</span>
          </p>
        ))}
      </div>

      <div className="my-4 h-px w-full bg-white/90" />

      <ol className="list-decimal space-y-2 pl-4 text-[12px] leading-snug sm:text-[13px]">
        <li>This card must be displayed by holder while in office.</li>
        <li>Loss of card must be reported immediately to the issuing authority.</li>
        <li>This card is not transferable.</li>
      </ol>

      <div className="mt-8 flex justify-end">
        <div className="w-40 text-right">
          <div className="mb-1 h-px w-full bg-white" />
          <p className="text-[11px]">issuing Authority</p>
        </div>
      </div>

      <div className="my-4 h-px w-full bg-white/90" />

      <div className="mt-auto text-center text-[12px] leading-relaxed sm:text-[13px]">
        <p className="mb-1">( If found please return to )</p>
        <p className="font-bold">teleGlobals International Pvt. Ltd.</p>
        <p className="mt-1 whitespace-pre-line text-[11px] sm:text-[12px]">
          {employee.officeAddress || RETURN_ADDRESS}
        </p>
      </div>
    </article>
  );
}

export default EmployeeCard;
