import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env";
import routes from "./routes";
import { errorMiddleware } from "./common/middleware/error.middleware";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/v1", routes);
app.use(errorMiddleware);

export default app;
