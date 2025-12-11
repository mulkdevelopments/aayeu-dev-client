"use client";

import Head from "next/head";

export default function DynamicSEO(props) {
  const {
    title,
    titleTemplate,
    description,
    keywords,
    image,
    url,
    canonical,
    type = "website",
    robots = "index, follow",
    jsonLd,
    customMeta = [],
    siteName,
  } = props;

  const finalTitle = titleTemplate ? titleTemplate.replace("%s", title) : title;

  return (
    <Head>
      {/* Primary */}
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* OG */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Custom meta loop */}
      {customMeta.map((meta, idx) =>
        meta.name ? (
          <meta key={idx} name={meta.name} content={meta.content} />
        ) : (
          <meta key={idx} property={meta.property} content={meta.content} />
        )
      )}

      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      )}
    </Head>
  );
}
