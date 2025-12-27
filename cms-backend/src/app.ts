import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import routes from "./routes";
import errorHandler from "./middleware/errorHandler";
import config from "./config";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL || "*" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    index: false,
    extensions: ["jpg", "png", "webp", "gif", "jpeg"],
  })
);

// API routes (we'll create routes/index later)
app.use("/api", routes);

// health-check
app.get("/health", (_, res) => res.json({ ok: true }));

// error handler
app.use(errorHandler);

export default app;
