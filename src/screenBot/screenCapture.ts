import { eq } from "drizzle-orm";
import puppeteer from "puppeteer";
import cloudinary from "../cloudinary";
import { spaces, userStatus } from "../models/schema";
import { db } from "../server";

const delay = (ms: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

export const printBot = async () => {
	const spacesToUpdate = await db
		.select()
		.from(userStatus)
		.then((userStats) =>
			userStats.filter((user) => user.spaceId).map((user) => user.spaceId),
		);

	const activeSpaces = await db
		.select()
		.from(spaces)
		.then((spaces) =>
			spaces.filter((space) => spacesToUpdate.includes(space.id)),
		);

	const browser = await puppeteer.launch({
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	for (const space of activeSpaces) {
		try {
			const page = await browser.newPage();
			await page.goto(space.flyUrl);
			await page.setViewport({ width: 1920, height: 1024 });
			await page.locator("text/Connect").click();
			await delay(2000);
			await page.locator("#noVNC_password_input").click();
			await delay(1000);
			await page.keyboard.type(`${space.password}`);
			await delay(500);
			await page.locator("text/Send Password").click();
			await delay(2000);
			await page.screenshot({ path: "src/screenBot/screenshot.png" });
			const pictureLink = await cloudinary.uploader.upload(
				"src/screenBot/screenshot.png",
			);

			await db
				.update(spaces)
				.set({
					thumbnail: pictureLink.url,
				})
				.where(eq(spaces.id, space.id));

			await page.close();
		} catch (error) {
			console.error(error);
		}
	}
};
