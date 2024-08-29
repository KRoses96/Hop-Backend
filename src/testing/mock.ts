import { drizzle } from "drizzle-orm/node-postgres";
import { client } from "../models";
import * as schema from "../models/schema";
import { seedDatabase } from "./seed/seed";

// remakeDB
/*
export const remakeDB = async () => {
	try {
		client.connect();
		const db = drizzle(client, { schema });
		await db.delete(schema.users).execute();
		await db.delete(schema.spaces).execute();
		await seedDatabase(db);
	} catch (error) {
		console.log(error);
	}
};

// mockData

export const user = {
	id: "1c9e7422-9fd5-4774-8f5e-78eb43412345",
	username: "Emma",
	profile_picture: "http://example.com/emma.jpg",
	created_at: "2024-08-11 11:30:00",
};
*/
