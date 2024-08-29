import { eq } from "drizzle-orm";
import { db } from "../server";
import { users } from "./schema";

class AuthMethods {
	async insertUser(userId: string) {
		try {
			const createdUser = await db
				.insert(users)
				.values({
					id: userId,
				})
				.returning();
			return createdUser[0];
		} catch (error) {
			// Improve error handling here!
			console.error(error);
			throw new Error("Failed to register user!");
		}
	}
	async deleteUser(userId: string) {
		try {
			const deletedUser = await db
				.delete(users)
				.where(eq(users.id, userId))
				.returning();
			return deletedUser[0];
		} catch (error) {
			console.error(error);
			throw new Error("Failed to delete user!");
		}
	}
}

export default new AuthMethods();
