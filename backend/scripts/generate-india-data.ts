import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

type PostalApiStatus = "Success" | "Error";

interface PostalApiResponse {
  Message: string;
  Status: PostalApiStatus;
  PostOffice: PostOfficeRecord[] | null;
}

interface PostOfficeRecord {
  Name?: string | null;
  District?: string | null;
  State?: string | null;
  Pincode?: string | null;
}

export type IndiaPincodeData = Record<
  string,
  Record<string, Record<string, string[]>>
>;

interface Checkpoint {
  lastProcessedPincode: number;
  updatedAt: string;
}

interface GeneratorOptions {
  startPincode: number;
  endPincode: number;
  concurrency: number;
  batchSize: number;
  retries: number;
  retryDelayMs: number;
}

const API_BASE_URL = "https://api.postalpincode.in/pincode";
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT_DIR, "output");
const CHECKPOINT_FILE = path.join(OUTPUT_DIR, "india-pincode.checkpoint.json");
const JSON_OUTPUT_FILE = path.join(OUTPUT_DIR, "india-pincode.json");
const TS_OUTPUT_FILE = path.join(OUTPUT_DIR, "india-pincode.ts");

const APP_COPY_TARGETS = [
  path.resolve(ROOT_DIR, "..", "Restaurant-app", "constants"),
  path.resolve(ROOT_DIR, "..", "delivery-app", "constants"),
  path.resolve(ROOT_DIR, "..", "main-user-app", "constants"),
];

const options: GeneratorOptions = {
  startPincode: Number(process.env.PINCODE_START || 100000),
  endPincode: Number(process.env.PINCODE_END || 999999),
  concurrency: Number(process.env.PINCODE_CONCURRENCY || 15),
  batchSize: Number(process.env.PINCODE_BATCH_SIZE || 2000),
  retries: Number(process.env.PINCODE_RETRIES || 3),
  retryDelayMs: Number(process.env.PINCODE_RETRY_DELAY_MS || 700),
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanText = (value?: string | null) =>
  value?.trim().replace(/\s+/g, " ") || "";

const isValidPincode = (value: string) => /^\d{6}$/.test(value);

const ensureDir = (dir: string) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
};

const loadCheckpoint = () => {
  if (!existsSync(CHECKPOINT_FILE)) return options.startPincode - 1;
  try {
    const checkpoint = JSON.parse(
      readFileSync(CHECKPOINT_FILE, "utf8"),
    ) as Checkpoint;
    return Math.max(checkpoint.lastProcessedPincode, options.startPincode - 1);
  } catch {
    return options.startPincode - 1;
  }
};

const saveCheckpoint = (lastProcessedPincode: number) => {
  const checkpoint: Checkpoint = {
    lastProcessedPincode,
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
};

const fetchPincode = async (
  pincode: number,
  attempt = 1,
): Promise<PostOfficeRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${pincode}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = (await response.json()) as PostalApiResponse[];
    const first = payload[0];
    if (
      !first ||
      first.Status !== "Success" ||
      !Array.isArray(first.PostOffice)
    ) {
      return [];
    }

    return first.PostOffice;
  } catch (error) {
    if (attempt <= options.retries) {
      await sleep(options.retryDelayMs * attempt);
      return fetchPincode(pincode, attempt + 1);
    }
    console.warn(
      `[warn] ${pincode} failed after ${options.retries} retries: ${(error as Error).message}`,
    );
    return [];
  }
};

const addPostOffice = (data: IndiaPincodeData, record: PostOfficeRecord) => {
  const state = cleanText(record.State);
  const district = cleanText(record.District);
  const city = cleanText(record.Name);
  const pincode = cleanText(record.Pincode);

  if (!state || !district || !city || !isValidPincode(pincode)) return;

  data[state] ??= {};
  data[state][district] ??= {};
  data[state][district][city] ??= [];

  if (!data[state][district][city].includes(pincode)) {
    data[state][district][city].push(pincode);
  }
};

const sortData = (data: IndiaPincodeData): IndiaPincodeData => {
  const sorted: IndiaPincodeData = {};

  for (const state of Object.keys(data).sort((a, b) => a.localeCompare(b))) {
    sorted[state] = {};
    for (const district of Object.keys(data[state]).sort((a, b) =>
      a.localeCompare(b),
    )) {
      sorted[state][district] = {};
      for (const city of Object.keys(data[state][district]).sort((a, b) =>
        a.localeCompare(b),
      )) {
        sorted[state][district][city] = [
          ...new Set(data[state][district][city]),
        ].sort();
      }
    }
  }

  return sorted;
};

const runWithConcurrency = async (
  pincodes: number[],
  worker: (pincode: number) => Promise<void>,
) => {
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(options.concurrency, pincodes.length) },
    async () => {
      while (cursor < pincodes.length) {
        const next = pincodes[cursor++];
        await worker(next);
      }
    },
  );
  await Promise.all(workers);
};

const buildTsOutput = (
  data: IndiaPincodeData,
) => `export type IndiaPincodeData = Record<string, Record<string, Record<string, string[]>>>;

export const indiaPincodeData: IndiaPincodeData = ${JSON.stringify(data, null, 2)};

export const getStates = () => Object.keys(indiaPincodeData);

export const getDistricts = (state: string) =>
  Object.keys(indiaPincodeData[state] || {});

export const getCities = (state: string, district: string) =>
  Object.keys(indiaPincodeData[state]?.[district] || {});

export const getPincodes = (state: string, district: string, city: string) =>
  [...(indiaPincodeData[state]?.[district]?.[city] || [])];
`;

const writeOutputs = (data: IndiaPincodeData) => {
  const sorted = sortData(data);
  const json = JSON.stringify(sorted, null, 2);
  const ts = buildTsOutput(sorted);

  writeFileSync(JSON_OUTPUT_FILE, `${json}\n`);
  writeFileSync(TS_OUTPUT_FILE, ts);

  for (const targetDir of APP_COPY_TARGETS) {
    ensureDir(targetDir);
    writeFileSync(path.join(targetDir, "india-pincode.json"), `${json}\n`);
    writeFileSync(path.join(targetDir, "india-pincode.ts"), ts);
  }
};

const main = async () => {
  ensureDir(OUTPUT_DIR);
  const data: IndiaPincodeData = {};
  const resumeFrom = loadCheckpoint() + 1;

  console.log(
    "[start] Generating India pincode data from api.postalpincode.in",
  );
  console.log(
    `[config] range=${resumeFrom}-${options.endPincode}, concurrency=${options.concurrency}, batch=${options.batchSize}`,
  );

  for (
    let start = resumeFrom;
    start <= options.endPincode;
    start += options.batchSize
  ) {
    const end = Math.min(start + options.batchSize - 1, options.endPincode);
    const pincodes = Array.from(
      { length: end - start + 1 },
      (_, index) => start + index,
    );

    await runWithConcurrency(pincodes, async (pincode) => {
      const records = await fetchPincode(pincode);
      for (const record of records) addPostOffice(data, record);
    });

    saveCheckpoint(end);
    console.log(
      `[progress] processed ${end}/${options.endPincode}; states=${Object.keys(data).length}`,
    );
    writeOutputs(data);
  }

  writeOutputs(data);
  console.log(`[done] Wrote ${JSON_OUTPUT_FILE}`);
  console.log(`[done] Wrote ${TS_OUTPUT_FILE}`);
  console.log(
    "[done] Copied generated files to Restaurant-app, delivery-app, and main-user-app constants folders.",
  );
};

void main().catch((error) => {
  console.error("[fatal]", error);
  process.exit(1);
});
