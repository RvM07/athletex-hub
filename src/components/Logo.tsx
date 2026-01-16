import { useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "main" | "text";
}

const Logo = ({ size = "md", variant = "main" }: LogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [textImageError, setTextImageError] = useState(false);

  const mainLogoSizes = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32",
    xl: "h-40",
  };

  const textLogoSizes = {
    sm: "h-12",
    md: "h-16",
    lg: "h-20",
    xl: "h-28",
  };

  const textSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-6xl",
  };

  const taglineSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-base",
  };

  // Text fallback component
  const TextFallback = ({ showTagline = false }: { showTagline?: boolean }) => (
    <div className="flex flex-col">
      <span className={`font-display ${textSizes[size]} tracking-wider font-bold italic`}>
        <span className="text-foreground">ATHLETE</span>
        <span className="text-red-600">X</span>
      </span>
      {showTagline && (
        <div className={`${taglineSizes[size]} text-red-600 font-bold tracking-widest uppercase -mt-1`}>
          Unlock Your X-Factor
        </div>
      )}
    </div>
  );

  // Main Spartan warrior logo for navbar
  if (variant === "main") {
    if (imageError) {
      return <TextFallback />;
    }
    return (
      <img 
        src="/logo.png" 
        alt="AthleteX Logo" 
        className={`${mainLogoSizes[size]} w-auto object-contain`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Text logo with tagline for footer
  if (textImageError) {
    return <TextFallback showTagline={true} />;
  }
  
  return (
    <div className="flex flex-col">
      <img 
        src="/logo-text.png" 
        alt="AthleteX - Unlock Your X-Factor" 
        className={`${textLogoSizes[size]} w-auto object-contain`}
        onError={() => setTextImageError(true)}
      />
    </div>
  );
};

export default Logo;
