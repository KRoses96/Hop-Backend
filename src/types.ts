import { z } from "zod";

// Enums
const ThemeEnum = ["default"] as const; // ! Still not fully defined
export const RoleEnum = ["anonymous", "member", "editor", "owner"] as const; // ! Still not fully defined

export const RoleSchema = z.enum(RoleEnum);
export const ThemeSchema = z.enum(ThemeEnum);

// Zod Schemas
export const UserSchema = z.object({
	id: z.string().uuid(),
	username: z.string().min(1).optional().nullable(),
	nickname: z.string().optional().nullable(),
	profilePicture: z.string().optional().nullable(),
});

export const SpaceSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	flyUrl: z.string(),
	theme: z.enum(ThemeEnum),
	password: z.string(), // ! add some more verification later
});

export const FriendSchema = z.object({
	id: z.string().uuid().optional(),
	userId: z.string().uuid(),
	friendId: z.string().uuid(),
});

export const SpaceMemberSchema = z.object({
	id: z.string().uuid().optional(),
	spaceId: z.string().uuid(),
	userId: z.string().uuid(),
	role: z.enum(RoleEnum),
	lastConnection: z.date().optional(),
});

export const SpaceRequestSchema = z.object({
	id: z.string().uuid().optional(),
	spaceId: z.string().uuid(),
	inviterId: z.string().uuid(),
	invitedId: z.string().uuid(),
	role: z.enum(RoleEnum),
});

export const UserStatusSchema = z.object({
	id: z.string().uuid().optional(),
	userId: z.string().uuid(),
	spaceId: z.string().uuid(),
});

export const StackWebhookDataSchema = z.object({
	id: z.string(),
	primary_email_verified: z.boolean(),
	signed_up_at_millis: z.number(),
	has_password: z.boolean(),
	// selected_team: z.object(),
	selected_team_id: z.string(),
	profile_image_url: z.string(),
	// client_metadata: z.object(),
	// server_metadata: z.object(),
});

export const StackWebhookSchema = z.object({
	event: z.string(),
	data: StackWebhookDataSchema,
});

export const FriendRequestSchema = z.object({
	id: z.string().uuid(),
	userId: z.object({
		id: z.string().uuid(),
		profilePicture: z.string(),
		username: z.string(),
	}),
	friendId: z.string().uuid(),
});

// Typescript Types inferred from Zod Schemas
export type UserType = z.infer<typeof UserSchema>;
export type SpaceType = z.infer<typeof SpaceSchema>;
export type FriendType = z.infer<typeof FriendSchema>;
export type SpaceMemberType = z.infer<typeof SpaceMemberSchema>;
export type SpaceRequestType = z.infer<typeof SpaceRequestSchema>;
export type UserStatusType = z.infer<typeof UserStatusSchema>;
export type RolesEnumType = z.infer<typeof RoleSchema>;
export type ThemesEnumType = z.infer<typeof ThemeSchema>;
export type FriendRequestType = z.infer<typeof FriendRequestSchema>;

export type StackWebhookDataType = z.infer<typeof StackWebhookDataSchema>;
export type StackWebhookType = z.infer<typeof StackWebhookSchema>;

export type FriendStatusType = {
	id: string;
	username: string | null;
	nickname: string | null;
	profilePicture: string | null;
	status: string | null | { name: string; id: string };
};

export type CloudinaryUploadResult = {
	secure_url: string;
};
