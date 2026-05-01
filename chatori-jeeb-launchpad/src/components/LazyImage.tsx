import { ImgHTMLAttributes, useState } from "react";

/**
 * Apple-style image fade-in: starts slightly zoomed + blurred,
 * settles on load. Uses transform + opacity + filter only.
 */
export const LazyImage = ({
  className = "",
  loading = "lazy",
  decoding = "async",
  onLoad,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      {...props}
      loading={loading}
      decoding={decoding}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      style={{
        transition:
          "opacity 900ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1), filter 900ms cubic-bezier(0.16,1,0.3,1)",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "scale(1)" : "scale(1.04)",
        filter: loaded ? "blur(0)" : "blur(8px)",
        ...props.style,
      }}
      className={className}
    />
  );
};