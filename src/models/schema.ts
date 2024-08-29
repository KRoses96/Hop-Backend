import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", [
	"anonymous",
	"member",
	"editor",
	"owner",
]);

export const themeEnum = pgEnum("theme", ["default"]);

// TABLES
// User Table
export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	username: text("username").unique(),
	nickname: text("nickname"),
	profilePicture: text("profile_picture"),
	createdAt: timestamp("created_at").defaultNow(),
});

// Space Table
export const spaces = pgTable("spaces", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	password: text("password").notNull(),
	flyUrl: text("fly_url").notNull().unique(),
	theme: themeEnum("theme").notNull(),
	thumbnail: text("thumbnail"),
	createdAt: timestamp("created_at").defaultNow(),
});

// RELATIONAL TABLES
// Friends Table
export const friends = pgTable("friends", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	friendId: uuid("friend_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow(),
});

// Space Members Table
export const spaceMembers = pgTable("space_members", {
	id: uuid("id").primaryKey().defaultRandom(),
	spaceId: uuid("space_id")
		.notNull()
		.references(() => spaces.id, { onDelete: "cascade" }),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	role: roleEnum("role").notNull(),
	lastConnection: timestamp("last_connection"),
	createdAt: timestamp("created_at").defaultNow(),
});

// User Status Table
export const userStatus = pgTable("user_status", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: "cascade" }),
	spaceId: uuid("space_id").references(() => spaces.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at").defaultNow(),
});

// Friend Requests Table
export const friendRequests = pgTable("friend_requests", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	friendId: uuid("friend_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow(),
});

// Space Requests Table
export const spaceRequests = pgTable("space_requests", {
	id: uuid("id").primaryKey().defaultRandom(),
	spaceId: uuid("space_id")
		.notNull()
		.references(() => spaces.id, { onDelete: "cascade" }),
	inviterId: uuid("inviter_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	invitedId: uuid("invited_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	role: roleEnum("role").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});
