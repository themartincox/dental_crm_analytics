import React, { useState, useRef, useEffect } from 'react';
import { getOptimizedImageProps, lazyLoadImages } from '../utils/imageOptimization';

/**
 * OptimizedImage - High-performance image component with lazy loading and responsive images
 * Features:
 * - Responsive images with multiple formats (WebP, AVIF, JPEG)
 * - Lazy loading with Intersection Observer
 * - Placeholder and loading states
 * - Error handling
 * - Accessibility support
 */

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  priority = false,
  lazy = true,
  sizes = '100vw',
  className = '',
  style = {},
  placeholder = true,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(placeholder);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate optimized image props
  const imageProps = getOptimizedImageProps(src, alt, {
    width,
    height,
    quality,
    priority,
    lazy,
    sizes
  });

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setShowPlaceholder(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setShowPlaceholder(false);
    onError?.();
  };

  // Set up lazy loading
  useEffect(() => {
    if (lazy && !priority && imgRef.current) {
      // Set up data attributes for lazy loading
      const img = imgRef.current;
      img.dataset.src = imageProps.src;
      img.dataset.srcset = imageProps.srcSet;
      img.src = ''; // Clear src to prevent immediate loading

      // Set up intersection observer
      observerRef.current = lazyLoadImages(`img[data-src="${imageProps.src}"]`);
    }
  }, [lazy, priority, imageProps.src, imageProps.srcSet]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Generate placeholder
  const placeholderStyle = {
    width: width || '100%',
    height: height || '200px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    ...style
  };

  // Error state
  if (hasError) {
    return (
      <div
        className={`optimized-image-error ${className}`}
        style={placeholderStyle}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <div>Image unavailable</div>
        </div>
      </div>
    );
  }

  // Placeholder while loading
  if (showPlaceholder && !isLoaded) {
    return (
      <div
        className={`optimized-image-placeholder ${className}`}
        style={placeholderStyle}
        aria-hidden="true"
      >
        <div className="animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <picture className={`optimized-image-container ${className}`}>
      {/* WebP source */}
      <source
        type="image/webp"
        srcSet={imageProps.srcSet}
        sizes={imageProps.sizes}
      />

      {/* AVIF source (best compression) */}
      <source
        type="image/avif"
        srcSet={imageProps.srcSet}
        sizes={imageProps.sizes}
      />

      {/* Fallback image */}
      <img
        ref={imgRef}
        src={priority ? imageProps.src : ''}
        srcSet={priority ? imageProps.srcSet : ''}
        alt={alt}
        width={width}
        height={height}
        sizes={imageProps.sizes}
        loading={imageProps.loading}
        decoding={imageProps.decoding}
        fetchPriority={imageProps.fetchpriority}
        className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoaded ? 1 : 0,
          ...style
        }}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
