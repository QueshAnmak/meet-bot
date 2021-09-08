const { chromium } = require("playwright-core");

(async () =>
{
	// const pathToExtension = 'C:\\Users\\samriddh jain\\Projects\\meet-bot\\app\\mute-new-tabs';
	userDataDir = 'C:\\Users\\samriddh jain\\Projects\\meet-bot\\app\\authorise\\session';
	const browser = await chromium.launchPersistentContext(
		userDataDir,
		{
			headless: false,
			channel: 'chrome',
			// devtools: !spotlight,
			ignoreDefaultArgs: [
				"--disable-component-extensions-with-background-pages",
			],
			args: [
				// `--auto-select-desktop-capture-source=${screenShareSource}`,
				"--use-fake-device-for-media-stream",
				"--use-fake-ui-for-media-stream",
			],
			colorScheme: "dark",
			viewport: null,
			permissions: [], //["camera", "microphone"],
			storageState: "./state.json",
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4595.0 Safari/537.36",
			locale: "en-US",
			timezoneId: "Asia/Kolkata",
		});

	let page = await browser.newPage();
	await page.pause()
	await browser.storageState({path: 'state.json'})
	// console.log("Browser started.");
	// return browserContext;
})();

// async function minimizeBrowser(browser, page)
// {
// 	// Create raw protocol session.
// 	const session = await browser.newCDPSession(page);
// 	const { windowId } = await session.send('Browser.getWindowForTarget');
// 	await session.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
// }

// async function closeBrowser(browser)
// {
// 	// console.log("Closing Browser.");
// 	await browser.close();
// }

// module.exports = {
// 	startBrowser,
// 	minimizeBrowser,
// 	closeBrowser,
// };
