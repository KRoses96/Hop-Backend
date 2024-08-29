import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import type { StackWebhookDataType } from "./types";

dotenv.config();

const STACK_API = "https://api.stack-auth.com/api/v1/users/me";

type StackHeadersType = {
	"x-stack-access-type": string;
	"x-stack-project-id": string;
	"x-stack-secret-server-key": string;
	"x-stack-access-token": string;
	"x-stack-refresh-token": string;
};

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const publicEndpoints = ["/api/auth", "/api", "/api-docs"];

	if (publicEndpoints.includes(req.url)) {
		return next();
	}

	const accessToken = req.headers["x-stack-access-token"];
	const refreshToken = req.headers["x-stack-refresh-token"];

	if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
		return res.status(403).send("Forbidden: JWTs not provided");
	}
	const stackHeaders = generateStackHeaders(accessToken, refreshToken);
	if (!stackHeaders) {
		return res.status(500).send("Internal sever error");
	}
	try {
		const isAuthenticated = await authenticateUser(stackHeaders);

		if (!isAuthenticated) {
			return res.sendStatus(403);
		}

		req.user = isAuthenticated;

		next();
	} catch (error) {
		console.error(`Authentication error: ${error}`);
		res.status(500).send("Internal server error");
	}
};

const generateStackHeaders = (
	accessToken: string,
	refreshToken: string,
): StackHeadersType | null => {
	const projectId = process.env.PROJECT_ID;
	const serverSecretKey = process.env.STACK_SECRET_SERVER_KEY;

	if (projectId && serverSecretKey) {
		return {
			"x-stack-access-type": "server",
			"x-stack-project-id": projectId,
			"x-stack-secret-server-key": serverSecretKey,
			"x-stack-access-token": accessToken,
			"x-stack-refresh-token": refreshToken,
		};
	}
	throw new Error("Ensure STACK-AUTH environment variables are configured");
};

const authenticateUser = async (
	stackHeaders: StackHeadersType,
): Promise<string | null> => {
	const res = await fetch(STACK_API, {
		headers: stackHeaders,
	});
	if (res.ok) {
		const data: StackWebhookDataType = await res.json();
		if (data.id) {
			return data.id;
		}
		throw new Error("Invalid user");
	}
	console.log("Stack Authentication Error:", await res.json());
	return null;
};
