function Alert({ type = "error", children }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${styles[type]}`}>
      {children}
    </div>
  );
}

export default Alert;
