import { notImplemented } from "./payment.repository";

export const getPaymentInfo = () => ({
  ...notImplemented(),
  activeGateway: "RAZORPAY",
  availableGateways: ["RAZORPAY"],
});

export const renderPhonePeRedirectPage = (targetUrl?: string, merchantOrderId?: string) => {
  const safeTargetUrl = targetUrl && /^[-a-zA-Z0-9+&@#/%?=~_|!:,.;()]+$/.test(targetUrl) ? targetUrl : null;
  const nextUrl = safeTargetUrl || null;
  const fallbackText = merchantOrderId
    ? `Payment finished for order ${merchantOrderId}. You can return to the app now.`
    : "Payment finished. You can return to the app now.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Returning to app...</title>
    ${nextUrl ? `<meta http-equiv="refresh" content="0;url=${nextUrl}" />` : ""}
    <style>
      body { font-family: Arial, sans-serif; background: #fff7ed; color: #7c2d12; margin: 0; min-height: 100vh; display: grid; place-items: center; }
      main { max-width: 420px; padding: 24px; text-align: center; }
      a { color: #ea580c; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>Returning to the app...</h1>
      <p>${fallbackText}</p>
      ${nextUrl ? `<p><a href="${nextUrl}">Tap here if the app does not open automatically.</a></p>` : ""}
    </main>
    ${nextUrl ? `<script>window.location.replace(${JSON.stringify(nextUrl)});</script>` : ""}
  </body>
</html>`;
};
