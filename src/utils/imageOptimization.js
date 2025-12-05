/**
 * Image optimization utilities for AES CRM
 * Handles responsive images, WebP conversion, and lazy loading
 */
import React from 'react';

// Image optimization configuration
export const imageConfig = {
  // Breakpoints for responsive images
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    large: 1280,
    xlarge: 1536
  },

  // Quality settings for different image types
  quality: {
    hero: 85,
    content: 80,
    thumbnail: 75,
    icon: 90
  },

  // Supported formats
  formats: ['webp', 'avif', 'jpeg', 'png'],

  // Lazy loading settings
  lazy: {
    rootMargin: '50px',
    threshold: 0.1
  }
};

/**
 * Generate responsive image sources
 * @param {string} basePath - Base path to image
 * @param {string} alt - Alt text
 * @param {Object} options - Configuration options
 * @returns {Object} Responsive image object
 */
export function generateResponsiveImage(basePath, alt, options = {}) {
  const {
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    quality = imageConfig.quality.content,
    lazy = true,
    priority = false
  } = options;

  const imageName = basePath.split('/').pop().split('.')[0];
  const imageDir = basePath.substring(0, basePath.lastIndexOf('/'));

  // Generate sources for different formats and sizes
  const sources = [];

  // WebP sources (preferred)
  sources.push({
    type: 'image/webp',
    srcSet: generateSrcSet(imageDir, imageName, 'webp', quality),
    sizes
  });

  // AVIF sources (best compression)
  sources.push({
    type: 'image/avif',
    srcSet: generateSrcSet(imageDir, imageName, 'avif', quality),
    sizes
  });

  // Fallback JPEG/PNG
  const fallbackSrc = generateSrcSet(imageDir, imageName, 'jpg', quality);

  return {
    alt,
    src: fallbackSrc.split(',')[0].split(' ')[0], // First size as default
    srcSet: fallbackSrc,
    sizes,
    loading: lazy ? 'lazy' : 'eager',
    decoding: 'async',
    fetchpriority: priority ? 'high' : 'auto'
  };
}

/**
 * Generate srcSet string for responsive images
 * @param {string} dir - Image directory
 * @param {string} name - Image name
 * @param {string} format - Image format
 * @param {number} quality - Image quality
 * @returns {string} SrcSet string
 */
function generateSrcSet(dir, name, format, quality) {
  const breakpoints = Object.values(imageConfig.breakpoints);
  const srcSet = breakpoints.map(width => {
    const filename = `${name}-${width}w.${format}`;
    return `${dir}/${filename} ${width}w`;
  });

  return srcSet.join(', ');
}

/**
 * Lazy load images with Intersection Observer
 * @param {string} selector - CSS selector for images
 * @param {Object} options - Observer options
 */
export function lazyLoadImages(selector = 'img[data-src]', options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: imageConfig.lazy.rootMargin,
    threshold: imageConfig.lazy.threshold
  };

  const observerOptions = { ...defaultOptions, ...options };

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }

        if (srcset) {
          img.srcset = srcset;
          img.removeAttribute('data-srcset');
        }

        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, observerOptions);

  // Observe all images with data-src
  const images = document.querySelectorAll(selector);
  images.forEach(img => imageObserver.observe(img));

  return imageObserver;
}

/**
 * Preload critical images
 * @param {Array} imageUrls - Array of image URLs to preload
 * @param {string} type - Image type (image/webp, image/jpeg, etc.)
 */
export function preloadImages(imageUrls, type = 'image/webp') {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.type = type;
    document.head.appendChild(link);
  });
}

/**
 * Generate optimized image component props
 * @param {string} src - Image source
 * @param {string} alt - Alt text
 * @param {Object} options - Options
 * @returns {Object} Optimized image props
 */
export function getOptimizedImageProps(src, alt, options = {}) {
  const {
    width,
    height,
    quality = imageConfig.quality.content,
    priority = false,
    lazy = true,
    sizes = '100vw'
  } = options;

  // Generate responsive image data
  const responsiveImage = generateResponsiveImage(src, alt, {
    quality,
    priority,
    lazy,
    sizes
  });

  return {
    ...responsiveImage,
    width,
    height,
    style: {
      width: '100%',
      height: 'auto',
      objectFit: 'cover'
    }
  };
}

/**
 * Convert image to WebP format (client-side)
 * @param {File} file - Image file
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>} WebP blob
 */
export function convertToWebP(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(resolve, 'image/webp', quality);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate placeholder for images
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} color - Placeholder color
 * @returns {string} Data URL placeholder
 */
export function generatePlaceholder(width, height, color = '#f3f4f6') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

/**
 * Image optimization hook for React components
 * @param {string} src - Image source
 * @param {Object} options - Options
 * @returns {Object} Optimized image data
 */
export function useOptimizedImage(src, options = {}) {
  const [imageData, setImageData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!src) return;

    setLoading(true);
    setError(null);

    try {
      const optimized = getOptimizedImageProps(src, options.alt || '', options);
      setImageData(optimized);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [src, options]);

  return { imageData, loading, error };
}

// Export default configuration
export default {
  imageConfig,
  generateResponsiveImage,
  lazyLoadImages,
  preloadImages,
  getOptimizedImageProps,
  convertToWebP,
  generatePlaceholder,
  useOptimizedImage
};
