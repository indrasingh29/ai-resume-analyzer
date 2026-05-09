import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error";
import apiRoutes from "./routes";

export const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGINS,
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-resume-analyzer-api"
  });
});

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);
