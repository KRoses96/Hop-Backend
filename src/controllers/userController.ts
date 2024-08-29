import type { Request, Response } from "express";
import cloudinary from "../cloudinary";
import userMethods from "../models/userMethods";
import type { CloudinaryUploadResult } from "../types";

class UserController {
	async getOneUser(req: Request, res: Response): Promise<void> {
		try {
			const { user } = req;
			const userById = await userMethods.findUserById(user);
			if (userById) {
				res.status(200).send(userById);
			} else {
				res.status(404).send("User not found!");
			}
		} catch (error) {
			res.status(500).send("Could not fetch user!");
		}
	}

	async putUser(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { username, nickname } = req.body;
			let profilePicture = req.body.profilePicture;

			if (req.file) {
				try {
					const uploadPromise = () =>
						new Promise<CloudinaryUploadResult>((resolve, reject) => {
							cloudinary.uploader
								.upload_stream({ resource_type: "auto" }, (error, result) => {
									if (error) {
										return reject(
											new Error(`Cloudinary upload failed: ${error.message}`),
										);
									}
									resolve(result as CloudinaryUploadResult);
								})
								.end(req.file ? req.file.buffer : null);
						});
					const result = await uploadPromise();
					profilePicture = result.secure_url;
				} catch (error) {
					throw new Error("Failed to upload profile picture");
				}
			}

			const userData = {
				username,
				nickname,
				profilePicture,
			};

			const updatedUser = await userMethods.updateUser(userId, userData);
			if (updatedUser) {
				res.status(201).send(updatedUser);
			} else {
				res.status(500).send("Could not create user!");
			}
		} catch (error) {
			res.status(500).send("Could not create user!");
		}
	}

	async postFriendRequest(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { username } = req.params;

			const success = await userMethods.insertFriendRequest(userId, username);

			if (success) {
				res.status(201).send("Friend request created successfully");
			} else {
				res.status(400).send("Failed to create friend request");
			}
		} catch (error) {
			res.status(500).send("Could not create friend request!");
		}
	}

	async getAllFriendRequests(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const friendRequests = await userMethods.findAllFriendRequests(userId);
			res.status(200).send(friendRequests);
		} catch (error) {
			res.status(500).send("Failed to fetch friend requests");
		}
	}

	async acceptFriendRequest(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { friendRequestId } = req.params;

			const success = await userMethods.acceptFriendRequest(
				userId,
				friendRequestId,
			);

			if (success) {
				res.status(201).send("Friend request accepted successfully");
			} else {
				res.status(400).send("Failed to accept friend request");
			}
		} catch (error) {
			res.status(500).send("Failed to accept friend request");
		}
	}

	async rejectFriendRequest(req: Request, res: Response): Promise<void> {
		try {
			const { friendRequestId } = req.params;
			const success = await userMethods.deleteFriendRequest(friendRequestId);
			if (success) {
				res.status(201).send("Friend request rejected successfully");
			} else {
				res.status(400).send("Failed to reject friend request");
			}
		} catch (error) {
			res.status(500).send("Failed to reject friend request");
		}
	}

	async postFriendController(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { username } = req.params;

			if (!userId || !username) {
				res.status(400).send("Missing userId or username");
				return;
			}

			const success = await userMethods.insertFriend(userId, username);

			if (success) {
				res.status(201).send("Friend added successfully");
			} else {
				res
					.status(400)
					.send("Failed to add friend (already friends or users don't exist)");
			}
		} catch (error) {
			res.status(500).send("Error adding friend");
		}
	}

	async deleteFriendController(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { friendId } = req.params;

			if (!userId || !friendId) {
				res.status(400).send("Missing userId or friendId");
				return;
			}

			const success = await userMethods.deleteFriend(userId, friendId);

			if (success) {
				res.status(202).send("Friend deleted successfully");
			} else {
				res.status(404).send("Friendship not found");
			}
		} catch (error) {
			res.status(500).send("Error deleting friend");
		}
	}

	async getAllFriends(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const users = await userMethods.findAllFriends(userId);
			res.status(200).send(users);
		} catch (error) {
			res.status(500).send("Could not fetch users!");
		}
	}
}

export default new UserController();
