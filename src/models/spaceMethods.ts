import { and, eq, not } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { db } from "../server";
import type {
	RolesEnumType,
	SpaceMemberType,
	SpaceRequestType,
	SpaceType,
	ThemesEnumType,
	UserType,
} from "../types";
import {
	RoleEnum,
	SpaceMemberSchema,
	SpaceRequestSchema,
	SpaceSchema,
} from "../types";
import { spaceMembers, spaceRequests, spaces, users } from "./schema";

const FLY_API_URL = process.env.FLY_API_URL || "http://localhost:5000/api/apps";

export class SpaceMethods {
	async insertSpace(
		id: string,
		name: string,
		userId: string,
		password: string,
		theme: ThemesEnumType = "default",
	): Promise<SpaceType | null> {
		try {
			const appName = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${id}`;
			// SDK
			try {
				const response = await fetch(FLY_API_URL, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						app_name: appName,
						password: password,
					}),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
			} catch (error) {
				throw error as Error;
			}

			// IF SDK CONFIRMED
			const flyUrl = `https://${appName}.fly.dev`;
			return await db.transaction(async (tx) => {
				const space: SpaceType = {
					id,
					name,
					password,
					flyUrl,
					theme,
				};

				const validatedSpace = SpaceSchema.parse(space);

				const createdSpace = await tx
					.insert(spaces)
					.values(validatedSpace)
					.returning()
					.then((result) => result[0]);

				if (createdSpace.id) {
					const spaceMember: SpaceMemberType = {
						spaceId: createdSpace.id,
						userId,
						role: "owner",
					};

					const validatedSpaceMember = SpaceMemberSchema.parse(spaceMember);

					await tx.insert(spaceMembers).values(validatedSpaceMember);

					return createdSpace;
				}
				return null;
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				console.error("Validation failed:", error.errors);
			} else {
				console.error("Error creating space:", error);
			}
			return null;
		}
	}

	async deleteSpace(spaceId: string, userId: string): Promise<boolean> {
		try {
			const spaceToDelete = await db
				.select()
				.from(spaces)
				.where(eq(spaces.id, spaceId))
				.then((result) => result[0]);

			if (!spaceToDelete) return false;

			const spaceOwner = await db
				.select()
				.from(spaceMembers)
				.where(
					and(
						eq(spaceMembers.role, "owner"),
						eq(spaceMembers.spaceId, spaceId),
						eq(spaceMembers.userId, userId),
					),
				)
				.then((result) => result[0]);

			if (!spaceOwner) return false;

			const appName = (spaceToDelete.flyUrl.match(
				/(?<=https:\/\/).*?(?=\.fly\.dev)/,
			) || [null])[0];

			try {
				const response = await fetch(FLY_API_URL, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						app_name: appName,
					}),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
			} catch (error) {
				throw error as Error;
			}

			return await db.transaction(async (tx) => {
				await tx.delete(spaceMembers).where(eq(spaceMembers.spaceId, spaceId));
				await tx.delete(spaces).where(eq(spaces.id, spaceId));

				return true;
			});
		} catch (error) {
			console.error("Error deleting space:", error);
			return false;
		}
	}

	async insertSpaceRequest(
		spaceId: string,
		inviterId: string,
		invitedId: string,
		role: RolesEnumType,
	): Promise<boolean> {
		try {
			const spaceMember: SpaceRequestType = {
				spaceId,
				inviterId,
				invitedId,
				role,
			};

			const validatedSpaceMember = SpaceRequestSchema.parse(spaceMember);

			const memberExists = await db
				.select()
				.from(spaceMembers)
				.where(
					and(
						eq(spaceMembers.spaceId, validatedSpaceMember.spaceId),
						eq(spaceMembers.userId, validatedSpaceMember.invitedId),
					),
				)
				.then((result) => result[0]);

			if (memberExists) return false;
			await db.insert(spaceRequests).values(validatedSpaceMember);

			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				console.error("Validation failed:", error.errors);
			} else {
				console.error("Error adding user to space:", error);
			}
			return false;
		}
	}

	async acceptSpaceRequest(requestId: string, userId: string) {
		try {
			await db.transaction(async (tx) => {
				const spaceInvite = await tx
					.delete(spaceRequests)
					.where(eq(spaceRequests.id, requestId))
					.returning()
					.then((result) => result[0]);

				if (!spaceInvite) return false;

				await tx
					.delete(spaceRequests)
					.where(
						and(
							eq(spaceRequests.spaceId, spaceInvite.spaceId),
							eq(spaceRequests.invitedId, userId),
						),
					);

				const spaceMember: SpaceMemberType = {
					spaceId: spaceInvite.spaceId,
					userId: spaceInvite.invitedId,
					role: spaceInvite.role,
				};

				const validatedSpaceMember = SpaceMemberSchema.parse(spaceMember);

				await tx.insert(spaceMembers).values(validatedSpaceMember);

				return true;
			});
		} catch (error) {
			console.error("Error accepting space invite:", error);
			return false;
		}
	}

	async rejectSpaceRequest(requestId: string): Promise<boolean> {
		try {
			await db.delete(spaceRequests).where(eq(spaceRequests.id, requestId));
			return true;
		} catch (error) {
			console.error("Error rejecting space invite:", error);
			return false;
		}
	}

	async findAllSpaceRequests(userId: string) {
		return await db
			.select({
				id: spaceRequests.id,
				spaceId: {
					id: spaces.id,
					name: spaces.name,
				},
				inviterId: {
					id: users.id,
					username: users.username,
					profilePicture: users.profilePicture,
				},
				role: spaceRequests.role,
			})
			.from(spaceRequests)
			.where(eq(spaceRequests.invitedId, userId))
			.leftJoin(spaces, eq(spaces.id, spaceRequests.spaceId))
			.leftJoin(users, eq(users.id, spaceRequests.inviterId));
	}

	async removeUserFromSpace(spaceId: string, adminId: string, userId: string) {
		const [adminRole, userRole] = await Promise.all([
			db
				.select({ role: spaceMembers.role })
				.from(spaceMembers)
				.where(
					and(eq(spaceMembers.id, adminId), eq(spaceMembers.spaceId, spaceId)),
				)
				.then((result) => result[0].role),
			db
				.select({ role: spaceMembers.role })
				.from(spaceMembers)
				.where(
					and(eq(spaceMembers.id, userId), eq(spaceMembers.spaceId, spaceId)),
				)
				.then((result) => result[0].role),
		]);

		const roleHierarchy = { owner: 3, editor: 2, member: 1, anonymous: 0 };

		const canRemove =
			roleHierarchy[adminRole] > roleHierarchy[userRole] &&
			userRole !== "owner";

		if (canRemove || userId === adminId) {
			await db
				.delete(spaceMembers)
				.where(
					and(eq(spaceMembers.userId, userId), eq(spaceMembers.id, spaceId)),
				);
			return true;
		}
	}

	async findOwnedSpaces(
		userId: string,
	): Promise<Omit<SpaceType, "password">[]> {
		try {
			const adminSpaces = await db
				.select({
					id: spaces.id,
					name: spaces.name,
					flyUrl: spaces.flyUrl,
					theme: spaces.theme,
					password: spaces.password,
					thumbnail: spaces.thumbnail,
				})
				.from(spaceMembers)
				.innerJoin(spaces, eq(spaceMembers.spaceId, spaces.id))
				.where(
					and(eq(spaceMembers.userId, userId), eq(spaceMembers.role, "owner")),
				);

			return adminSpaces;
		} catch (error) {
			console.error("Error fetching admin spaces:", error);
			return [];
		}
	}

	async findInvitedSpaces(
		userId: string,
	): Promise<Omit<SpaceType, "password">[]> {
		try {
			const memberSpaces = await db
				.select({
					id: spaces.id,
					name: spaces.name,
					flyUrl: spaces.flyUrl,
					theme: spaces.theme,
					password: spaces.password,
					thumbnail: spaces.thumbnail,
				})
				.from(spaceMembers)
				.innerJoin(spaces, eq(spaceMembers.spaceId, spaces.id))
				.where(
					and(
						eq(spaceMembers.userId, userId),
						not(eq(spaceMembers.role, "owner")),
					),
				);

			return memberSpaces;
		} catch (error) {
			console.error("Error fetching non-admin member spaces:", error);
			return [];
		}
	}

	async findSpace(id: string): Promise<SpaceType | null> {
		try {
			const space = await db
				.select({
					id: spaces.id,
					name: spaces.name,
					flyUrl: spaces.flyUrl,
					theme: spaces.theme,
					password: spaces.password,
				})
				.from(spaces)
				.where(eq(spaces.id, id))
				.then((result) => result[0]);
			return space;
		} catch (error) {
			console.log("Body does not have the correct information!");
			return null;
		}
	}

	async findSpaceMembers(spaceId: string): Promise<UserType[] | null> {
		try {
			const spaceMember = await db
				.select()
				.from(spaceMembers)
				.where(eq(spaceMembers.spaceId, spaceId));

			if (!spaceMember.length) return null;
			const spaceMemberInfoPromises = spaceMember.map(async (member) => {
				const spaceUser = await db
					.select()
					.from(users)
					.where(eq(users.id, member.userId))
					.then((result) => result[0]);
				return spaceUser;
			});
			const spaceMemberInfo = await Promise.all(spaceMemberInfoPromises);
			return spaceMemberInfo;
		} catch (error) {
			console.log("Body does not have the correct information!");
			return null;
		}
	}

	async findMySpaceRole(
		spaceId: string,
		userId: string,
	): Promise<string | null> {
		try {
			const role = await db
				.select({ role: spaceMembers.role })
				.from(spaceMembers)
				.where(
					and(
						eq(spaceMembers.spaceId, spaceId),
						eq(spaceMembers.userId, userId),
					),
				)
				.then((result) => result[0].role);
			return role;
		} catch (error) {
			console.log("Body does not have the correct information!");
			return null;
		}
	}

	async editSpace(
		userId: string,
		spaceId: string,
		spaceName: string,
		spaceTheme: ThemesEnumType,
	): Promise<boolean> {
		try {
			const userRole = await db
				.select({ role: spaceMembers.role })
				.from(spaceMembers)
				.where(
					and(
						eq(spaceMembers.spaceId, spaceId),
						eq(spaceMembers.userId, userId),
					),
				)
				.then((result) => result[0].role);

			if (userRole !== "owner") return false;

			await db
				.update(spaces)
				.set({ name: spaceName, theme: spaceTheme })
				.where(eq(spaces.id, spaceId));

			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async editUserRole(
		ownerId: string,
		userId: string,
		spaceId: string,
		role: string,
	): Promise<boolean> {
		try {
			const userRole = await db
				.select()
				.from(spaceMembers)
				.where(
					and(
						eq(spaceMembers.spaceId, spaceId),
						eq(spaceMembers.userId, ownerId),
					),
				)
				.then((result) => result[0].role);

			if (userRole !== "owner") return false;

			if (!Object.values(RoleEnum).includes(role as RolesEnumType))
				return false;
			await db
				.update(spaceMembers)
				.set({ role: role as RolesEnumType })
				.where(
					and(
						eq(spaceMembers.spaceId, spaceId),
						eq(spaceMembers.userId, userId),
					),
				);

			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}
}

export default new SpaceMethods();
