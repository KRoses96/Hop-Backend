import type { Request, Response } from "express";
import { themeEnum } from "../models/schema";
import spaceMethods from "../models/spaceMethods";
import type { ThemesEnumType } from "../types";

class SpaceController {
	async postSpace(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { id, name, password, theme } = req.body;
			const newSpace = await spaceMethods.insertSpace(
				id,
				name,
				userId,
				password,
				theme,
			);
			if (newSpace) {
				res.status(201).send(newSpace);
			} else {
				res.status(400).send("Could not create space!");
			}
		} catch (error) {
			res.status(500).send("Could not create space!");
		}
	}

	async deleteSpace(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { spaceId } = req.params;
			const deletedSpace = await spaceMethods.deleteSpace(spaceId, userId);
			if (deletedSpace) {
				res.status(202).send("Space deleted!");
			} else {
				res.status(400).send("Space not found!");
			}
		} catch (error) {
			res.status(500).send("Could not delete space!");
		}
	}

	async postSpaceRequest(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { spaceId, friendId, role } = req.body;
			const invitedMember = await spaceMethods.insertSpaceRequest(
				spaceId,
				userId,
				friendId,
				role,
			);

			if (invitedMember) {
				res.status(201).send("Invited user!");
			} else {
				res.status(400).send("Could not invite user to space!");
			}
		} catch (error) {
			res.status(500).send("Server Issues!");
		}
	}

	async postAcceptSpaceRequest(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { requestId } = req.params;
			const acceptedInvite = await spaceMethods.acceptSpaceRequest(
				requestId,
				userId,
			);
			if (acceptedInvite) {
				res.status(201).send("Created: User invited to space!");
			} else {
				res.status(400).send("Error: Could not accept invite!");
			}
		} catch (error) {
			res.status(500).send("Server Issues!");
		}
	}

	async deleteSpaceRequest(req: Request, res: Response): Promise<void> {
		try {
			const { requestId } = req.params;
			const rejectedInvite = await spaceMethods.rejectSpaceRequest(requestId);
			if (rejectedInvite) {
				res.status(200).send("Rejected invite!");
			} else {
				res.status(400).send("Error: Could not reject invite!");
			}
		} catch (error) {
			res.status(500).send("Server Issues!");
		}
	}

	async getAllSpaceRequests(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const requests = await spaceMethods.findAllSpaceRequests(userId);
			if (requests) {
				res.status(200).send(requests);
			} else {
				res.status(400).send("Error: Could not fetch requests!");
			}
		} catch (error) {
			res.status(500).send("Server failed to fetch space requests");
		}
	}

	async deleteUserFromSpace(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { spaceId, userId } = req.params;
			const removedMember = await spaceMethods.removeUserFromSpace(
				spaceId,
				id,
				userId,
			);
			if (removedMember) {
				res.status(201).send("Removed user!");
			} else {
				res.status(400).send("Could not remove user from space!");
			}
		} catch (error) {
			res.status(500).send("Server failed to remove user from space");
		}
	}

	async getAdminSpaces(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const adminSpaces = await spaceMethods.findOwnedSpaces(userId);
			res.status(200).send(adminSpaces);
		} catch (error) {
			res.status(500).send("Server failed to fetch your spaces");
		}
	}

	async getInvitedSpaces(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const memberSpaces = await spaceMethods.findInvitedSpaces(userId);
			res.status(200).send(memberSpaces);
		} catch (error) {
			res.status(500).send("Server failed to fetch invited spaces");
		}
	}

	async getSpaceById(req: Request, res: Response): Promise<void> {
		try {
			const { spaceId } = req.params;
			const spaceFound = await spaceMethods.findSpace(spaceId);
			if (spaceFound) {
				res.status(200).send(spaceFound);
			} else {
				res.status(400).send("Space not found!");
			}
		} catch (error) {
			res.status(500).send("Server failed to fetch space!");
		}
	}

	async getSpaceMembers(req: Request, res: Response): Promise<void> {
		try {
			const { spaceId } = req.params;
			const spaceFound = await spaceMethods.findSpaceMembers(spaceId);
			if (spaceFound) res.status(200).send(spaceFound);

			res.status(400).send("Space not found!");
		} catch (error) {
			res.status(500).send("Server failed to fetch space!");
		}
	}

	async getSpaceRole(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { spaceId } = req.params;
			const spaceRole = await spaceMethods.findMySpaceRole(spaceId, userId);
			if (spaceRole) res.status(200).send({ role: spaceRole });
			res.status(400).send("User does not belong to space!");
		} catch (error) {
			res.status(500).send("Server failed to fetch role!");
		}
	}

	async putSpace(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user;
			const { spaceId, spaceName, spaceTheme } = req.body;

			if (!Object.values(themeEnum).includes(spaceTheme))
				res.status(400).send("wrong theme");
			const realSpaceTheme = spaceTheme as ThemesEnumType;
			const spaceEdit = await spaceMethods.editSpace(
				userId,
				spaceId,
				spaceName,
				realSpaceTheme,
			);

			if (spaceEdit) res.status(200).send("Space Edited");

			res.status(400).send("You don't have permission to change the space");
		} catch (error) {
			res.status(500).send("Server failed to edit space");
		}
	}

	async putUserRole(req: Request, res: Response): Promise<void> {
		try {
			const ownerId = req.user;
			const { userId, spaceId, role } = req.body;
			const editUser = await spaceMethods.editUserRole(
				ownerId,
				userId,
				spaceId,
				role,
			);

			if (editUser) res.status(202).send("User role edited");
			res
				.status(400)
				.send("You don't have permission to change this user's role");
		} catch (error) {
			res.status(500).send("Server could not edit the user role!");
		}
	}
}

export default new SpaceController();
