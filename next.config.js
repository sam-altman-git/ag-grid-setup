// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,

  images: {
    domains: [
      "clinicrad.s3.amazonaws.com",
      "clinicacme.s3.amazonaws.com",
      "clinicsssacme.s3.amazonaws.com",
      "flagcdn.com",
    ],
  },

  headers: async () => {
    let headersArr = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(self), microphone=(self), geolocation=()",
      },
      {
        key: "Content-Security-Policy",
        value: `
    default-src 'self' *.radinhealth.com *.radindev.net https://localhost.neologica.it:9088 http://127.0.0.1:9088;
    script-src 'self' *.radinhealth.com https://ajax.googleapis.com https://cdn.jsdelivr.net https://cdn.quilljs.com https://code.jquery.com https://cdnjs.cloudflare.com https://d30r8kui0m3d0v.cloudfront.net https://test-api.payrix.com https://applepay.cdn-apple.com https://*.online-metrix.net https://jsd-widget.atlassian.com 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://*.sdkassets.chime.aws;
    style-src 'self' *.radinhealth.com https://fonts.googleapis.com https://cdn.quilljs.com https://cdn.jsdelivr.net https://code.jquery.com 'unsafe-inline';
    img-src 'self' blob: *.radinhealth.com *.radindev.net data: https://flagcdn.com https://localhost.neologica.it:9088 https://localhost.neologica.it:9089 https://localhost.neologica.it:9090 https://localhost.neologica.it:9091 https://localhost.neologica.it:9092 http://127.0.0.1:9088 http://127.0.0.1:9089 http://127.0.0.1:9090 http://127.0.0.1:9091 http://127.0.0.1:9092 https://127.0.0.1:* https://code.jquery.com *.s3.amazonaws.com *.s3.us-east-1.amazonaws.com https://*.online-metrix.net;
    font-src 'self' *.radinhealth.com https://fonts.gstatic.com https://fonts.googleapis.com data:;
    connect-src 'self' *.radinhealth.com *.radindev.net https://devapi.radindev.net 
      wss://*.radinhealth.com *.sepstream.net wss://*.sepstream.net 
      https://*.chime.aws wss://*.chime.aws 
      https://*.amazonaws.com https://*.ingest.chime.aws 
      https://cognito-idp.us-east-1.amazonaws.com 
      https://cognito-identity.us-east-1.amazonaws.com 
      wss://mdilfocoi5.execute-api.us-east-1.amazonaws.com 
      wss://vecsn9jhzl.execute-api.us-east-1.amazonaws.com 
      *.s3.amazonaws.com 
      https://seppi-technology.signalwire.com/api/relay/rest/jwt 
      wss://relay.signalwire.com 
      https://0to562k2wd.execute-api.us-east-1.amazonaws.com/prod 
      https://seppi-tech.signalwire.com/api/relay/rest/jwt 
      wss://a31cr59aba.execute-api.us-east-1.amazonaws.com 
      https://127.0.0.1:* ws://127.0.0.1:* 
      https://mdls.dynamsoftonline.com https://sdls.dynamsoftonline.com 
      https://test-api.payrix.com 
      https://applepay.cdn-apple.com 
      https://*.online-metrix.net 
      https://jsd-widget.atlassian.com 
      wss://bxkgouqsz4.execute-api.us-east-1.amazonaws.com/production;

    worker-src 'self' blob: https://*.sdkassets.chime.aws;
    frame-src 'self' *.radinhealth.com *.radindev.net blob: *.s3.amazonaws.com https://test-api.payrix.com https://applepay.cdn-apple.com https://*.online-metrix.net https://jsd-widget.atlassian.com;
    object-src *.s3.amazonaws.com;
    base-uri 'self' https://jsd-widget.atlassian.com;
    media-src 'self';
    form-action 'self' *.radinhealth.com *.radindev.net;
    `
          .replace(/\s{2,}/g, " ")
          .trim(),
      },
      { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      { key: "Secure", value: "from radin" },
    ];

    console.warn("Starting server with NODE_ENV:", process.env.NODE_ENV);

    if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
      console.warn("Development mode: removing CSP header");
      headersArr = headersArr.filter(
        (header) => header.key !== "Content-Security-Policy",
      );
    }
    return [
      {
        source: "/(.*)",
        headers: headersArr,
      },
    ];
  },
};

module.exports = nextConfig;
