import { env } from "../../config/env";
import { AppError } from "../../common/errors/app-error";

const DEFAULT_PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

type JsonRecord = Record<string, any>;

const getPhonePeBaseUrl = () =>
  (env.PHONEPE_BASE_URL || DEFAULT_PHONEPE_BASE_URL).replace(/\/+$/, "");

const requirePhonePeConfig = () => {
  if (!env.PHONEPE_CLIENT_ID || !env.PHONEPE_CLIENT_SECRET || !env.PHONEPE_CLIENT_VERSION) {
    throw new AppError("PhonePe is not configured on the server", 500);
  }
};

const parseJsonResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new AppError(`PhonePe returned a non-JSON response (${response.status})`, 502);
  }
};

const getAccessToken = async (): Promise<string> => {
  requirePhonePeConfig();

  const response = await fetch(`${getPhonePeBaseUrl()}/v1/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.PHONEPE_CLIENT_ID!,
      client_version: env.PHONEPE_CLIENT_VERSION!,
      client_secret: env.PHONEPE_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
  });

  const payload = await parseJsonResponse(response);
  const token =
    payload.access_token ||
    payload.accessToken ||
    payload.token ||
    payload.data?.access_token ||
    payload.data?.accessToken ||
    payload.data?.token;

  if (!response.ok || !token) {
    throw new AppError(payload.message || "Failed to fetch PhonePe auth token", 502);
  }

  return token;
};

const extractCheckoutUrl = (payload: JsonRecord): string | undefined =>
  payload.paymentUrl ||
  payload.redirectUrl ||
  payload.checkoutUrl ||
  payload.tokenUrl ||
  payload.data?.paymentUrl ||
  payload.data?.redirectUrl ||
  payload.data?.checkoutUrl ||
  payload.data?.tokenUrl ||
  payload.data?.paymentPageUrl ||
  payload.data?.instrumentResponse?.redirectInfo?.url ||
  payload.instrumentResponse?.redirectInfo?.url;

const extractTransactionId = (payload: JsonRecord): string | undefined =>
  payload.transactionId ||
  payload.paymentTransactionId ||
  payload.data?.transactionId ||
  payload.data?.paymentTransactionId ||
  payload.data?.paymentDetails?.[0]?.transactionId ||
  payload.data?.paymentDetails?.[0]?.paymentTransactionId ||
  payload.paymentDetails?.[0]?.transactionId ||
  payload.paymentDetails?.[0]?.paymentTransactionId;

const getProviderState = (payload: JsonRecord): string =>
  String(
    payload.state ||
      payload.status ||
      payload.code ||
      payload.data?.state ||
      payload.data?.status ||
      payload.data?.code ||
      "UNKNOWN"
  ).toUpperCase();

export const buildPhonePeRedirectProxyUrl = (targetAppUrl: string, merchantOrderId: string) => {
  if (!env.BACKEND_URL) return targetAppUrl;

  const redirectUrl = new URL("/api/v1/payments/phonepe/redirect", env.BACKEND_URL);
  redirectUrl.searchParams.set("target", targetAppUrl);
  redirectUrl.searchParams.set("merchantOrderId", merchantOrderId);
  return redirectUrl.toString();
};

export const createPhonePePayment = async (input: {
  merchantOrderId: string;
  amount: number;
  redirectUrl: string;
  message?: string;
  metaInfo?: Record<string, string>;
}) => {
  const token = await getAccessToken();
  const response = await fetch(`${getPhonePeBaseUrl()}/checkout/v2/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify({
      merchantOrderId: input.merchantOrderId,
      amount: Math.round(input.amount * 100),
      expireAfter: 20 * 60,
      metaInfo: input.metaInfo,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: input.message || "Food order payment",
        merchantUrls: {
          redirectUrl: input.redirectUrl,
        },
      },
    }),
  });

  const payload = await parseJsonResponse(response);
  const checkoutUrl = extractCheckoutUrl(payload);

  if (!response.ok || !checkoutUrl) {
    throw new AppError(payload.message || "Failed to create PhonePe payment session", 502);
  }

  return {
    merchantOrderId: input.merchantOrderId,
    checkoutUrl,
    raw: payload,
  };
};

export const getPhonePeOrderStatus = async (merchantOrderId: string) => {
  const token = await getAccessToken();
  const response = await fetch(`${getPhonePeBaseUrl()}/checkout/v2/order/${merchantOrderId}/status`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
  });

  const payload = await parseJsonResponse(response);
  const providerState = getProviderState(payload);
  const isPaid = ["COMPLETED", "SUCCESS", "PAYMENT_SUCCESS", "PAID"].includes(providerState);
  const isPending = ["PENDING", "CREATED", "INITIATED", "PAYMENT_PENDING"].includes(providerState);

  if (!response.ok && !isPaid && !isPending) {
    throw new AppError(payload.message || "Failed to fetch PhonePe payment status", 502);
  }

  return {
    providerState,
    isPaid,
    isPending,
    transactionId: extractTransactionId(payload),
    raw: payload,
  };
};
