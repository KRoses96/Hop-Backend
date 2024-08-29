import { createServer } from "node:http";
import { instrument } from "@socket.io/admin-ui";
// import Sentry from "@sentry/node";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import { authMiddleware } from "./authMiddleware";
import spaceController from "./controllers/spaceController";
import userMethods from "./models/userMethods";
import { authRouter } from "./routes/auth";
import spaceRouter from "./routes/space";
import userRouter from "./routes/user";

const app = express();

const limiter = rateLimit({
	windowMs: 1000,
	limit: 20,
	standardHeaders: "draft-7",
	legacyHeaders: false,
});
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(morgan("dev"));


// No Auth Required
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/spaceId/:spaceId", spaceController.getSpaceById);
app.get("/api", (req, res) => {
	res.send("Hi, welcome to Hop API!");
});

// Auth Protected
app.use(authMiddleware);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/space", spaceRouter);

// ! Setup SENTRY for deployment
/*
import "../instrument";
Sentry.setupExpressErrorHandler(app);
// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
	res.statusCode = 500;
	res.end(`${res.sentry} + \n`);
	});*/

const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:3000",
			"https://admin.socket.io",
			"https://hop-sand.vercel.app/",
		],
		methods: ["GET", "POST"],
		credentials: true,
	},
});

instrument(io, {
	auth: false,
	mode: "development",
});

const connectedUsers = new Map<string, string>();

// Add to Database & Connected Users Map
async function addUser(userId: string, socketId: string) {
	if (connectedUsers.has(userId)) {
		connectedUsers.delete(userId);
	}
	connectedUsers.set(userId, socketId);
	await userMethods.addStatus(userId);
}

async function userJoinSpaceStatus(userId: string, spaceId: string) {
	await userMethods.addSpaceStatus(userId, spaceId);
}

async function userLeaveSpaceStatus(userId: string) {
	await userMethods.removeSpaceStatus(userId);
}

// Remove from DB & Connected Users Map
async function deleteUser(userId: string) {
	await userMethods.removeStatus(userId);
	connectedUsers.delete(userId);
}

async function checkOnlineFriends(userId: string) {
	const friends = await userMethods.findAllFriends(userId);
	const friendsIdArray = friends.map((friend) => friend.id);
	const connectedUsersArray = Array.from(
		connectedUsers,
		([userId, socketId]) => ({
			userId,
			socketId,
		}),
	);
	const onlineFriends = connectedUsersArray.filter((friend) =>
		friendsIdArray.includes(friend.userId),
	);
	return onlineFriends;
}

io.use(async (socket, next) => {
	const socketId = socket.id;
	const userId = socket.handshake.auth.token;
	await addUser(userId, socketId);
	const onlineFriends = await checkOnlineFriends(userId);
	if (onlineFriends) {
		io.emit("online_friends", "updated");
	}
	console.log(`WSS - Connected: ${userId}`);
	console.log("Online Friends: ", onlineFriends);
	next();
});

io.on("connection", async (socket) => {
	socket.on("friend_request", async (arg) => {
		const userId = socket.handshake.auth.token;
		const onlineFriends = await checkOnlineFriends(userId);
		if (onlineFriends) {
			for (const [userId, friendId] of Object.entries(onlineFriends)) {
				io.to(friendId.socketId).emit("online_friends", "updated");
			}
		}
	});

	socket.on("space_request", async (arg) => {
		const userId = socket.handshake.auth.token;
		const onlineFriends = await checkOnlineFriends(userId);
		if (onlineFriends) {
			for (const [userId, friendId] of Object.entries(onlineFriends)) {
				io.to(friendId.socketId).emit("online_friends", "updated");
			}
		}
	});

	socket.on("space_join", async (arg) => {
		const userId = socket.handshake.auth.token;
		const socketId = socket.id;
		const spaceId = arg;
		await userJoinSpaceStatus(userId, spaceId);
	});

	socket.on("space_leave", async (arg) => {
		const userId = socket.handshake.auth.token;
		const socketId = socket.id;
		const spaceId = arg;
		await userLeaveSpaceStatus(userId);
	});

	socket.on("disconnect", async (arg) => {
		const userId = socket.handshake.auth.token;
		const onlineFriends = await checkOnlineFriends(userId);
		if (onlineFriends) {
			for (const [userId, friendId] of Object.entries(onlineFriends)) {
				io.to(friendId.socketId).emit("online_friends", "updated");
			}
		}
		await deleteUser(userId);
		console.log(`WSS - Disconnected: ${userId}`);
		console.log(`WSS - Connected Users: ${connectedUsers}`);
	});
});

export default server;
