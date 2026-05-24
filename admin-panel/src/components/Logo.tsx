// Admin Panel Logo Component
type LogoSize = "sm" | "md" | "lg" | "xl";
type LogoWithTextSize = "sm" | "md" | "lg";

export const Logo = ({ size = "md", variant = "default" }: { size?: LogoSize; variant?: string }) => {
  const sizeClasses: Record<LogoSize, string> = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const logoPath = variant === "white" ? "/logos/chef-logo-white.png" : "/logos/chef-logo.png";

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <img 
        src={logoPath} 
        alt="Chef Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export const LogoWithText = ({ size = "md" }: { size?: LogoWithTextSize }) => {
  const sizeClasses: Record<LogoWithTextSize, string> = {
    sm: "text-sm gap-1",
    md: "text-base gap-2",
    lg: "text-lg gap-3",
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <Logo size={size === "sm" ? "sm" : size === "md" ? "md" : "lg"} />
      <span className="font-bold text-orange-500">Food Order System</span>
    </div>
  );
};

