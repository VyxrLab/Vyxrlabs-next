import Script from "next/script";

// The tags the previous site ran, carried over so reporting continues after the switch.
const GTM_ID = "GTM-MFGS6W3F";
const CONTENTSQUARE_SRC = "https://t.contentsquare.net/uxa/f93a56e5379ec.js";

// Track real visitors only: not local development, and not Vercel preview deployments.
const enabled = process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";

/** Google Tag Manager and Contentsquare. Render once, at the top of <body>. */
export default function Analytics() {
  if (!enabled) return null;
  return (
    <>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <Script src={CONTENTSQUARE_SRC} strategy="afterInteractive" />
    </>
  );
}
