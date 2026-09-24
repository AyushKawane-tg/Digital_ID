import { useState } from "react";
import demoAvatar from "../demo-avatar.svg";

function EmployeePhoto({ name, photo, size = "lg", className = "" }) {
  const [failed, setFailed] = useState(false);
  const sizes = {
    xs: "h-10 w-10 text-xs",
    sm: "h-16 w-16 text-lg",
    md: "h-24 w-24 text-2xl",
    lg: "h-32 w-32 text-3xl",
    xl: "h-36 w-36 text-4xl",
  };

  const ring = size === "xs" ? "ring-2 ring-slate-200" : "ring-4 ring-white";
  const shape = `${sizes[size]} rounded-full object-cover shadow-md ${ring} ${className}`;
  const src = photo && !failed ? photo : demoAvatar;

  return (
    <img
      src={src}
      alt={name || "Employee photo"}
      onError={() => setFailed(true)}
      className={shape}
    />
  );
}

export default EmployeePhoto;
export { demoAvatar };
