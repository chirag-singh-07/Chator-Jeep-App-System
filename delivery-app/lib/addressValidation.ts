export type AddressFieldName =
  | "fullAddress"
  | "landmark"
  | "state"
  | "district"
  | "city"
  | "pinCode";

export type AddressDraft = Record<AddressFieldName, string>;

export type AddressValidationResult = {
  value: string;
  error: string;
  isValid: boolean;
};

const sqlPattern = /\b(select|insert|update|delete|drop|alter|truncate|union|exec|script)\b|(--|;|\/\*|\*\/)/i;
const scriptPattern = /<\s*\/?\s*script|javascript:/i;
const emojiPattern =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;
const repeatedCharPattern = /([a-zA-Z])\1{4,}/;
const hasLetterPattern = /[a-zA-Z]/;
const textPattern = /^[a-zA-Z][a-zA-Z\s.'-]*$/;
const addressPattern = /^[a-zA-Z0-9][a-zA-Z0-9\s,./#'()-]*$/;

export const emptyAddressDraft: AddressDraft = {
  fullAddress: "",
  landmark: "",
  state: "",
  district: "",
  city: "",
  pinCode: "",
};

export const normalizeSpaces = (value: string) =>
  value.replace(/\s+/g, " ").replace(/^\s+/, "");

export const capitalizeWords = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b[a-z]/g, (match) => match.toUpperCase());

const stripDangerousContent = (value: string) =>
  value
    .replace(emojiPattern, "")
    .replace(/[<>`{}[\]\\]/g, "")
    .replace(/["]/g, "'")
    .replace(/\s+/g, " ");

export const sanitizeAddressInput = (
  field: AddressFieldName,
  rawValue: string,
) => {
  const withoutDanger = stripDangerousContent(rawValue);

  if (field === "pinCode") {
    return withoutDanger.replace(/\D/g, "").slice(0, 6);
  }

  if (field === "state" || field === "city") {
    return capitalizeWords(
      withoutDanger.replace(/[^a-zA-Z\s]/g, "").slice(0, 60),
    );
  }

  if (field === "district") {
    return capitalizeWords(
      withoutDanger.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 70),
    );
  }

  if (field === "landmark") {
    return capitalizeWords(
      withoutDanger.replace(/[^a-zA-Z0-9\s,./#'()-]/g, "").slice(0, 90),
    );
  }

  return capitalizeWords(
    withoutDanger.replace(/[^a-zA-Z0-9\s,./#'()-]/g, "").slice(0, 150),
  );
};

const hasSecurityRisk = (value: string) =>
  sqlPattern.test(value) || scriptPattern.test(value);

const hasFakePattern = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return (
    repeatedCharPattern.test(normalized) ||
    ["test", "testing", "fake", "dummy", "asdf", "qwerty", "na", "n/a"].includes(
      normalized,
    )
  );
};

export const validateAddressField = (
  field: AddressFieldName,
  value: string,
): AddressValidationResult => {
  const trimmed = normalizeSpaces(value).trim();

  if (field === "landmark" && !trimmed) {
    return { value: trimmed, error: "", isValid: true };
  }

  if (!trimmed) {
    return { value: trimmed, error: "This field is required.", isValid: false };
  }

  if (hasSecurityRisk(trimmed)) {
    return {
      value: trimmed,
      error: "Remove unsafe words or symbols from this field.",
      isValid: false,
    };
  }

  if (hasFakePattern(trimmed)) {
    return {
      value: trimmed,
      error: "Please enter a real, meaningful address value.",
      isValid: false,
    };
  }

  if (field === "fullAddress") {
    if (trimmed.length < 10) {
      return {
        value: trimmed,
        error: "Enter at least 10 characters.",
        isValid: false,
      };
    }
    if (trimmed.length > 150) {
      return {
        value: trimmed,
        error: "Keep the address under 150 characters.",
        isValid: false,
      };
    }
    if (!hasLetterPattern.test(trimmed) || !addressPattern.test(trimmed)) {
      return {
        value: trimmed,
        error: "Use a real house/street address with letters.",
        isValid: false,
      };
    }
  }

  if (field === "state" || field === "city") {
    if (trimmed.length < 2 || !textPattern.test(trimmed)) {
      return {
        value: trimmed,
        error: "Use alphabetic characters only.",
        isValid: false,
      };
    }
  }

  if (field === "district") {
    if (trimmed.length < 2 || !textPattern.test(trimmed)) {
      return {
        value: trimmed,
        error: "Use valid text only.",
        isValid: false,
      };
    }
  }

  if (field === "pinCode" && !/^[1-9][0-9]{5}$/.test(trimmed)) {
    return {
      value: trimmed,
      error: "Enter a valid 6 digit Indian PIN code.",
      isValid: false,
    };
  }

  return { value: trimmed, error: "", isValid: true };
};

export const validateAddressDraft = (draft: AddressDraft) => {
  const fields = Object.fromEntries(
    (Object.keys(draft) as AddressFieldName[]).map((field) => [
      field,
      validateAddressField(field, draft[field]),
    ]),
  ) as Record<AddressFieldName, AddressValidationResult>;

  const isValid =
    fields.fullAddress.isValid &&
    fields.state.isValid &&
    fields.district.isValid &&
    fields.city.isValid &&
    fields.pinCode.isValid;

  return { fields, isValid };
};

export const formatAddressLine = (draft: AddressDraft) =>
  [
    validateAddressField("fullAddress", draft.fullAddress).value,
    validateAddressField("landmark", draft.landmark).value,
    validateAddressField("city", draft.city).value,
    validateAddressField("district", draft.district).value,
    validateAddressField("state", draft.state).value,
  ]
    .filter(Boolean)
    .join(", ") + ` - ${validateAddressField("pinCode", draft.pinCode).value}`;
