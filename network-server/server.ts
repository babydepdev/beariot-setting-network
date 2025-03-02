import express, { Express } from "express";
import { readdirSync } from "fs";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

const app: Express = express();
dotenv.config();

app.use(cors({ origin: "*" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const loadRoutes = async () => {
  const routeFiles = readdirSync("./routes").filter(
    (file) => file.endsWith(".js") || file.endsWith(".ts")
  );

  for (const file of routeFiles) {
    const route = await import(path.join(__dirname, "routes", file));
    app.use("/api/v1", route.default);
  }
};

loadRoutes()
  .then(() => console.log("Routes loaded successfully"))
  .catch((err) => console.error("Error loading routes:", err));

const PORT = process.env.SERVER_PORT || 3000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
