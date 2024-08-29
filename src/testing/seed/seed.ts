import fs from "node:fs";
import { parse } from "csv-parse";
import * as schema from "../../models/schema";

export const seedDatabase = async (
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	db: { transaction: (arg0: (tx: any) => Promise<void>) => any } | undefined,
) => {
	try {
		if (!db) throw new Error("No Database found");
		const [userData, spacesData, friendsData, spaceMembersData] =
			await Promise.all([
				readCSV("users.csv"),
				readCSV("spaces.csv"),
				readCSV("friends.csv"),
				readCSV("space_members.csv"),
			]);

		await db.transaction(async (tx) => {
			try {
				await tx.insert(schema.users).values(userData);
				await tx.insert(schema.spaces).values(spacesData);
				await tx.insert(schema.friends).values(friendsData);
				await tx.insert(schema.spaceMembers).values(spaceMembersData);
			} catch (err) {
				await tx.rollback();
				const errorMessage = "Failed to insert data into the database";
				console.error(errorMessage);
				console.error(err);
				throw new Error(errorMessage);
			}
		});
		return;
	} catch (error) {
		console.error(error);
		throw new Error(
			"Failed to seed database - ensure you've cleared your current database & have run migrations with `npm run migrate`",
		);
	}
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const readCSV = async (filename: string): Promise<any[]> => {
	const filePath = `src/testing/seed/seed_data/${filename}`;
	try {
		const fileContent = await fs.promises.readFile(filePath, "utf-8");
		return new Promise((resolve, reject) => {
			parse(
				fileContent,
				{
					columns: true,
					skip_empty_lines: true,
					cast: (value, context) => {
						if (
							context.column === "createdAt" ||
							context.column === "lastConnection"
						) {
							return new Date(value);
						}
						return value;
					},
				},
				(err, data) => {
					if (err) reject(err);
					else resolve(data);
				},
			);
		});
	} catch (error) {
		console.error(`Failed to parse CSV file: ${error}`);
		throw error;
	}
};
