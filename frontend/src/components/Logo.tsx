import { Link } from "react-router-dom";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-teal">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
          <path d="M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
      </div>
      <span className="font-display font-bold text-xl text-foreground">CollabFlow</span>
    </Link>
  );
};

export default Logo;
