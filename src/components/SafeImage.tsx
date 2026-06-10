"use client";

import { useState } from "react";

type SafeImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  fallbackClassName?: string;
};

export default function SafeImage({
  src,
  alt,
  fallbackSrc,
  className = "",
  fill,
  width,
  height,
  fallbackClassName = "bg-gradient-to-br from-slate-700 to-slate-900",
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div
        className={`${fill ? "absolute inset-0" : ""} ${fallbackClassName} ${className}`}
        aria-label={alt}
      />
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
        onError={handleError}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
}
