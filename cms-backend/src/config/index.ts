import dotenv from "dotenv";
import path from "path";
dotenv.config();

const get = (k: string, fallback?: string) => process.env[k] ?? fallback;
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
function readNumber(envKey: string, fallback: number) {
  const v = process.env[envKey];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const config = {
  MONGODB_URI: get("MONGODB_URI", "mongodb://localhost:27017/cmsdb"),
  PORT: Number(get("PORT", "4000")),
  JWT_SECRET: get("JWT_SECRET", "please-change-me"),
  JWT_EXPIRES_IN: get("JWT_EXPIRES_IN", "1h"),
  FRONTEND_URL: get("FRONTEND_URL", "http://localhost:3000"),
  API_BASE_URL: get("API_BASE_URL"),
  FILE_BASE_URL: get("FILE_BASE_URL"),
  AWS_REGION: get("AWS_REGION"),
  AWS_ACCESS_KEY_ID: get("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: get("AWS_SECRET_ACCESS_KEY"),
  S3_BUCKET: get("S3_BUCKET"),
  REDIS_URL: get("REDIS_URL"),
  RATE_LIMIT_WINDOW_MS: readNumber("RATE_LIMIT_WINDOW_MS", 60_000),
  RATE_LIMIT_MAX: readNumber("RATE_LIMIT_MAX", 200),
  // STRICT is smaller; default to 20
  RATE_LIMIT_STRICT: readNumber("RATE_LIMIT_STRICT", 20),
  NODE_ENV: process.env.NODE_ENV ?? "development",
};

export default config;
