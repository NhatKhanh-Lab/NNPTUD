const cors = require("cors");
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const path = require("path");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const env = require("./config/env");

const app = express();

const allowedOrigins = new Set([
  env.clientUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5050",
  "http://127.0.0.1:5050"
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/tools", express.static(path.join(process.cwd(), "public")));
const frontendDist = path.join(process.cwd(), "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

app.use("/api/v1", routes);
if (fs.existsSync(frontendDist)) {
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/") || req.path.startsWith("/tools/")) {
      return next();
    }
    return res.sendFile(path.join(frontendDist, "index.html"));
  });
}
app.use(errorHandler);

module.exports = app;
