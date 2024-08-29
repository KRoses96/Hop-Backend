import type { Request, Response } from "express";
import authMethods from "../models/authMethods";

// Mock data from Stack webhook
// {
//   "type": "user.created",
//   "data": {
//     "id": "2209422a-eef7-4668-967d-be79409972c5",
//   }
// }

class AuthController {
	async postEvent(req: Request, res: Response) {
		try {
			const { type, data } = req.body;
			if (type === "user.created") {
				const userId = data.id;
				const newUser = await authMethods.insertUser(userId);
				if (newUser) {
					res.status(201).send(newUser);
				} else {
					res.status(500).send("Failed to register user!");
				}
			} else if (type === "user.deleted") {
				const userId = data.id;
				const deletedUser = await authMethods.deleteUser(userId);
				if (deletedUser) {
					res.status(200).send(deletedUser);
				} else {
					res.status(500).send("Failed to delete user!");
				}
			} else {
				console.error(`Failed to process event type: ${type}`);
				res.status(500).send("Failed to process event");
			}
		} catch (error) {
			res.status(500).send("Failed to register user!");
		}
	}
}

export default new AuthController();
