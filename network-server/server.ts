import express, { Express } from "express";
import { readdirSync } from "fs";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
const app: Express = express();

dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

readdirSync("./routes").forEach(async (file) => {
  const route = await import(`./routes/${file}`);
  app.use("/api/v1", route.default);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
