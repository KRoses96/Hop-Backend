
import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

export default {
	schema: "./src/models/schema.ts",
	out: "./drizzle",
	dialect: "postgresql", // Add this line
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		url: process.env.DATABASE_URL!,
	},
} satisfies Config;
