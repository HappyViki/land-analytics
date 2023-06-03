/* code from https://www.freecodecamp.org/news/web-scraping-in-javascript-with-puppeteer/ */
/* delay from https://stackoverflow.com/questions/46919013/puppeteer-wait-n-seconds-before-continuing-to-the-next-line */

const puppeteer = require('puppeteer');
require("dotenv").config();

const getLandData = async (link) => {
	try {

		if (!link.includes("landwatch.com")) {
			throw {
				"error": "wrong website"
			}
		}

		function delay(time) {
			return new Promise(function (resolve) {
				setTimeout(resolve, time)
			});
		}

		const scrapeLandData = async () => {
			const browser = await puppeteer.launch({
				headless: "new",
				defaultViewport: null,
				args: [
					"--disable-setuid-sandbox",
					"--no-sandbox",
					"--single-process",
					"--no-zygote",
				],
				executablePath: process.env.NODE_ENV === "production"
					? process.env.PUPPETEER_EXECUTABLE_PATH
					: puppeteer.executablePath(),
			});

			const page = await browser.newPage();

			await page.goto(link, {
				waitUntil: "domcontentloaded",
			});

			const scrapeTextFromPage = async () => await page.evaluate(() => {
				const landElementList = document.querySelectorAll("._7c2d9");

				return Array.from(landElementList).map((landDataItem) => {
					return {
						title: landDataItem.querySelector("._12a2b")?.innerText,
						location: landDataItem.querySelector(".df867")?.innerText,
						house: landDataItem.querySelector("._0f208")?.innerText,
						seller: landDataItem.querySelector(".bb79d")?.innerText,
						company: landDataItem.querySelector("._812ac")?.innerText,
						link: landDataItem.querySelector("._7c2d9 ._12a2b a")?.href
					};
				});

			});

			let landDataList = [];
			let landDataListPage;
			let noError = true;

			while (noError) {

				await delay(4000);
				landDataListPage = await scrapeTextFromPage();
				landDataList.push(...landDataListPage);

				try {
					await page.click(".b68ea"); /* next button */
				} catch (err) {
					noError = false;
				}
			}
			await browser.close();

			return landDataList;

		};

		return await scrapeLandData();

	} catch (error) {
		console.error(error);

		return error;
	}

};

module.exports = {
	getLandData
};