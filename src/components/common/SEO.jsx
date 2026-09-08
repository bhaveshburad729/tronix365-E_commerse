import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  canonicalUrl,
  type = 'website',
  brand = 'Tronix365',
  noindex = false,
}) => {
  const defaultTitle = 'Tronix365 | Premium Electronic Components';
  const defaultDesc = 'Shop high-quality Arduino boards, sensors, ESP32 modules, robotics parts, and IoT devices at Tronix365.';
  const defaultKeywords = 'electronics, Arduino, ESP32, Sensors, Robotics, IoT Modules, Microcontrollers';
  const defaultUrl = 'https://www.tronix365.in/e-commerse/';
  const defaultImage = 'https://www.tronix365.in/e-commerse/Tronix3650final_circular.png';

  const getAutoCanonicalUrl = () => {
    const passed = canonicalUrl || url;
    if (passed) return passed;
    if (typeof window !== 'undefined' && window.location) {
      let p = window.location.pathname.replace(/\/+$/, '');
      if (p === '' || p === '/e-commerse') {
        return 'https://www.tronix365.in/e-commerse/';
      }
      if (!p.startsWith('/e-commerse')) {
        p = `/e-commerse${p}`;
      }
      return `https://www.tronix365.in${p}`;
    }
    return defaultUrl;
  };

  const seoTitle = title ? `${title} | ${brand}` : defaultTitle;
  const seoDescription = description || defaultDesc;
  const seoKeywords = keywords || defaultKeywords;
  const seoUrl = getAutoCanonicalUrl();
  const seoImage = image || defaultImage;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content={brand} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
};

export default SEO;
