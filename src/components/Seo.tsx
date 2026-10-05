import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export const SITE_URL = "https://auto-reach-drive.lovable.app";

export default function Seo({
  title,
  description,
  noindex = false,
  jsonLd,
}: {
  title: string;
  description: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}) {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${pathname}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
