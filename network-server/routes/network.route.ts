import { Router } from "express";
import { createFileYAML } from "../controllers/network.controller";

const networkRouter: Router = Router();

networkRouter.post("/create-file-yaml", createFileYAML);

export default networkRouter;
