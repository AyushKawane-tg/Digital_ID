import logo from "../logo.webp";

function CompanyLogo({ className = "h-10 w-10", alt = "Teleglobals International" }) {
  return <img src={logo} alt={alt} className={`${className} object-contain`} />;
}

export default CompanyLogo;
export { logo };
