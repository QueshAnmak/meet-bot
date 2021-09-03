/**
 * Join a google meet in the browser.
 * @param {} browser - playwright.BrowserContext
 * @param {string} meetLink
 * @returns
 */
async function joinMeet(browser, meetLink) {
	// open google meet
	const meet = await browser.newPage({ deviceScaleFactor: 0.5 });
	await meet.goto(meetLink);

	console.log("Opened google meet.");

	// dismiss popup
	await meet.click('#yDmH0d > div.llhEMd.iWO5td > div > div.g3VIld.vdySc.Up8vH.J9Nfi.iWO5td > div.XfpsVe.J9fJmf > div');

	// join meeting, will wait indefinitely
	await meet.click('div[jsname="Qx7uuf"]', { timeout: 0 });

	// turn off mic and video
	// await meet.click('[aria-label="Turn off microphone (CTRL + D)"]');
	// await meet.click('[aria-label="Turn off camera (CTRL + E)"]');
	
	console.log("Turned mic and camera off.");

	// wait for meet to load
	try {
		await meet.waitForSelector(".SQHmX");
	}
	catch (e) {
		await meet.click('#yDmH0d > div.llhEMd.iWO5td > div > div.g3VIld.vdySc.pMgRYb.Up8vH.J9Nfi.iWO5td > div.XfpsVe.J9fJmf > div')
	}
	finally {
		await meet.waitForSelector(".SQHmX");
	}
	
	console.log("Joined meeting.");
	return meet;
}

/**
 * Changes the state of the meet chatbox to the setState.
 * @param {*} meet
 * @param {'opened'|'closed'|'toggled'} setState
 * @returns
 */
async function setMeetChatBoxState(meet, setState = "opened") {
	
	const VALID_STATES = ["opened", "closed", "toggled"];
	let result;

	// check setState is valid
	if (!VALID_STATES.includes(setState)) result = "Invalid setState!!!";

	// get chatBox element
	const chatBox = await meet.$('button[aria-label="Chat with everyone"]');

	// get current state of chatBox
	const curStateBoolean = await chatBox.getAttribute("aria-pressed");

	let curState;
	if (curStateBoolean === true)
		curState = 'opened';
	else
		curState = 'closed';
	
	// bring chatBox to setState
	if (curState === setState) {
		result = `Chatbox already ${setState}.`;
	} else {
		await chatBox.click();
		result = `${
			setState.charAt(0).toUpperCase() + setState.slice(1)
		} the chatbox.`;
	}

	console.log(result);
	return result;
}

/**
 * Present (screen share) to meet.
 * - ⚠️ The source to be presented must be mentioned in the browser argument "--auto-select-desktop-capture-source=<source>".
 * @param {*} meet
 * @param {boolean} spolight - if set to false, presentation will not be spotlighted.
 * @param {boolean} audio - if set false, presentaion audio will be turned off.
 */
async function presentToMeet(meet, spotlight = true, audio = true) {
	// present tab to meet, whatever it takes
	await forcePresentToMeet(meet);

	// open participants list
	await meet.click('[aria-label="Show everyone"]');
	await meet.waitForSelector('[aria-label="Participants"]');

	// unpin and pin the presentation on meet page to permanently pin it locally
	await (await meet.locator('[aria-label="Participants"]')).click('[aria-label="Unpin your presentation from your main screen."]');
	await (await meet.locator('[aria-label="Participants"]')).click('[aria-label="Unpin your presentation from your main screen."]');

	// to put screen share out of spotlight
	console.log("Checking spotlight.");
	if (spotlight === false) {
		await turnSpotlightOff(meet);
	}

	// removing from spotlight turns audio off, to fix it audio must be turned
	// back on manually
	console.log("Checking audio.");
	if ((audio = true)) {
		let result = await setPresentationAudioState(meet, (setState = "on"));
		console.log(result);
	}

	console.log("Presenting Youtube Music tab.");
} // headless mode not working, fix if possible

async function forcePresentToMeet(meet) {
	const isItShowtime = await meet.evaluate(async () => {
		const presentButton = document
			.querySelector(".cZG6je")
			.querySelector('[aria-haspopup="menu"]');

		presentButton.click();

		// check if someone else is presenting, cuz then share now popup will appear
		if (
			document
				.querySelector(".cZG6je")
				.querySelector('[aria-haspopup="menu"]')
				.getAttribute("aria-label") !== "Present now"
		) {
			console.log(
				document
					.querySelector(".cZG6je")
					.querySelector('[aria-haspopup="menu"]')
					.getAttribute("aria-label")
			);
			return "Hell yeah!!!";
		}
	});

	await meet.click(
		'li[role="menuitem"]:has-text("A tabBest for video and animation")'
	);

	// if someone else is presenting, then take over as main
	if (isItShowtime === "Hell yeah!!!")
		await meet.click(
			"#yDmH0d > div.llhEMd.iWO5td > div > div.g3VIld.OFqiSb.Up8vH.Whe8ub.J9Nfi.iWO5td > div.XfpsVe.J9fJmf > div.U26fgb.O0WRkf.oG5Srb.HQ8yf.C0oVfc.kHssdc.HvOprf.M9Bg4d > span > span"
		);

	await meet.bringToFront();
	await meet.waitForSelector("text=You're presenting to everyone");

	return "Mission F****** Accomplished!!!";
}

async function turnSpotlightOff(meet) {
	const browser = await meet.context();
	const meetLink = await meet.url();
	const dummyMeet = await joinMeet(browser, meetLink);

	// present tab to meet
	await forcePresentToMeet(dummyMeet);
	await dummyMeet.close();

	console.log(`Turned spotlight off.`);
}

/**
 *
 * @param {*} meet
 * @param {'on'|'off'|'toggle'} setState
 */
async function setPresentationAudioState(meet, setState = "on") {
	const VALID_STATES = ["on", "off", "toggle"];
	// check setState is valid
	if (!VALID_STATES.includes(setState)) return "Invalid setState!!!";

	await meet.waitForSelector('[aria-label$="ute your presentation"]');

	const audioButton = await meet.locator('[aria-label$="ute your presentation"]');

	const curState =
		(await audioButton.getAttribute("aria-label")) ===
		"Mute your presentation"
			? "on"
			: "off";

	console.log(await audioButton.getAttribute("aria-label"));

	if (curState === setState)
		return `Presentation audio is already ${setState}.`;

	else {
		await audioButton.evaluate(() => {document.querySelector('[data-allocation-index="0"]').querySelector('[jsname="LgbsSe"]').click()});
		return `Turned presentation audio ${curState === "on" ? "off" : "on"}.`;
	}
}

/**
 * Gets messages from the meet chat box and passes them to msgProcessor function.
 * - msgProcessor must be asynchronous.
 * - any extra arguments to be passed to msgProcessor must be passed as an object.
 * @param {*} meet
 * @param {Function} msgProcessor - funtion to process the msgs. recieves the string msg as argument.
 * @param {object} msgProcessorArgs - any other arguments to be passed to the msgProcessor.
 */
async function getMsgsFromMeet(meet, msgProcessor, msgProcessorArgs) {

	await meet.waitForSelector('.z38b6[jsname="xySENc"]');
	const divHandle = await meet.$('.z38b6[jsname="xySENc"]');
	let anotherDivHandle;

	const sendForProcessing = async (message) => {
		return await msgProcessor(message, msgProcessorArgs);
	};

	await meet.exposeFunction("sendForProcessing", sendForProcessing);

	console.log('Listening for commands.')

	await divHandle.evaluate((div) => {
		new MutationObserver(async (mutationsList, observer) => {
			anotherDivHandle = mutationsList[0].addedNodes[0];

			if (anotherDivHandle === undefined) return;
			else if (anotherDivHandle.className === "GDhqjd") {
				anotherDivHandle = anotherDivHandle.childNodes[1];
			}

			let message = anotherDivHandle.innerText;

			let result = await sendForProcessing(message);
			console.log(result);
		}).observe(div, { childList: true, subtree: true });
	});
} // add comments @DhairyaBahl

/**
 * Send a message to the chat in the meet.
 * @param {string} msg
 */
async function sendMsgToMeet(meet, msg) {
	msg = "(ツ)  " + msg;
	await meet.fill("textarea", msg);
	await meet.keyboard.press("Enter");
}

// async function (meet) {

// }

module.exports = {
	joinMeet,
	setMeetChatBoxState,
	presentToMeet,
	getMsgsFromMeet,
	sendMsgToMeet,
};
