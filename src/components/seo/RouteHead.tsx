import React from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteSeo } from '../../seo/routes';

export const RouteHead: React.FC = () => {
  const { pathname } = useLocation();
  const routeSeo = getRouteSeo(pathname);

  if (!routeSeo) {
    // If not in manifest (e.g. 404 or custom dynamic route), let page handle its own head
    return null;
  }

  const canonicalUrl = `https://zaboraa.com${routeSeo.path === '/' ? '' : routeSeo.path}`;

  return (
    <>
      <title>{routeSeo.title}</title>
      <meta name="description" content={routeSeo.description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={routeSeo.title} />
      <meta property="og:description" content={routeSeo.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={routeSeo.title} />
      <meta name="twitter:description" content={routeSeo.description} />
      {routeSeo.jsonld.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};
