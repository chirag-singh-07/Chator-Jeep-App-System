import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./config/env";
import routes from "./routes";
import { errorMiddleware } from "./common/middleware/error.middleware";

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chator Jeeb API",
      version: "1.0.0",
      description: "Backend API for Chator Jeeb Food Delivery System",
      contact: {
        name: "Chirag Singh",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "Main API Server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Restaurants", description: "Restaurant management endpoints" },
      { name: "Menu", description: "Menu and food item endpoints" },
      { name: "Orders", description: "Order management endpoints" },
      { name: "Users", description: "User endpoints" },
      { name: "Delivery", description: "Delivery partner endpoints" },
      { name: "Wallet", description: "Wallet and payment endpoints" },
    ],
  },
  apis: ["./src/routes/**/*.ts", "./src/swagger/schemas.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({
  limit: "5mb",
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60 * 1000,     // 1 minute
    max: 120
  })
);

// Swagger UI
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Chator Jeeb API Docs",
}));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Chator Jeep App Backend is running",
    version: "1.0.0",
    author: "Chirag Singh",
    documentation: "/api/v1/docs",
    date: new Date()
  });
});



app.use("/api/v1", routes);
app.use(errorMiddleware);

export default app;