import express from "express";
import authController from "../controllers/authController";

export const authRouter = express.Router();

authRouter.get("/", (req, res) => {
	res.send("Hop Auth Endpoint!");
});
authRouter.post("/", authController.postEvent);
