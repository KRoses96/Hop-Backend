const request = require("supertest");
import { beforeEach, describe, expect, it } from "@jest/globals";
import userMethods from "../models/userMethods";
import * as mock from "./mock";
/*
beforeEach(() => {
	//mock.remakeDB();
});

describe("User method testing", () => {
	describe("Find user by Id", () => {
		it("Get the correct user", async () => {
			const foundUser = await userMethods.findUserById(mock.user.id);
			expect(foundUser).toEqual(mock.user);
		});
	});
});
it("Find user by Id", () => {});
*/
