import pkg from "../package.json";
import * as https from "https";

export interface Result {
	/**
	 * The code of this short url.
	 * @type {string}
	 * @memberof Result
	 */
	code: string;
	/**
	 * The time this short url was created at.
	 * @type {string}
	 * @memberof Result
	 */
	createdAt: string;
	/**
	 * The url this short url leads to.
	 * @type {string}
	 * @memberof Result
	 */
	url: string;
	/**
	 * The position of this short url in creation order.
	 * @type {number}
	 * @memberof Result
	 */
	pos: number;
	/**
	 * The credit for creating this short url.
	 * @type {string}
	 * @memberof Result
	 */
	credit: string;
	/**
	 * The url this short url should be visited at.
	 * @type {string}
	 * @memberof Result
	 */
	fullURL: string;
}

export class APIError extends Error {
	constructor(message: string, obj: object) {
		super(`${message}: ${JSON.stringify(obj, null, "\t")}`);
		this.name = "APIError";
	}
}

/**
 * The main class to access any methods.
 * @class YiffRocks
 * @prop {string} userAgent - The user agent used in requests.
 */
export class YiffRocks {
	static userAgent = `Yiff-Rocks/${pkg.version} (https://github.com/FurryBotCo/Yiff-Rocks)`;
	static setUserAgent(agent: string) { this.userAgent = agent; return this; }

	// Class should not be constructed, use static methods.
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	/**
	 * Shorten a url.
	 * @static
	 * @param {string} url - The url to shorten.
	 * @param {string} [credit] - The credit for shortening the url.
	 * @param {string} [code] - The code to use (overrides random code generation, may result in a 400 already in use error).
	 * @returns {Result}
	 * @memberof YiffRocks
	 * @example YiffRocks.create("https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg");
	 * @example YiffRocks.create("https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg", "Someone");
	 * @example YiffRocks.create("https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg", "Someone", "OwOWhatsThis");
	 */
	static async create(url: string, credit?: string, code?: string) {
		return new Promise<Result>((a, b) => {
			const req = https
				.request({
					method: "POST",
					hostname: "yiff.rocks",
					protocol: "https:",
					path: "/create",
					headers: {
						"User-Agent": this.userAgent,
						"Content-Type": "application/json"
					}
				}, (res) => {
					const data: Buffer[] = [];

					res
						.on("error", (err) => b(err))
						.on("data", (d) => data.push(d))
						.on("end", () => {
							const v = JSON.parse(Buffer.concat(data).toString());
							if (res.statusCode !== 200) b(new APIError(`Non-200 OK Response From API: ${res.statusCode} ${res.statusMessage}`, v.message));
							else return a(v.data);
						});
				});
			req.write(JSON.stringify({
				url,
				credit,
				code
			}));
			req.end();
		});
	}

	/**
	 * Fetch shortened info for a url.
	 * @static
	 * @param {string} url - The url to fetch info for.
	 * @returns {Result}
	 * @memberof YiffRocks
	 * @example YiffRocks.getByURL("https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg");
	 */
	static async getByURL(url: string) {
		// api create method returns the info if the url already exists, or creates it
		//  if it doesn't, so it works
		return this.create(url, "Yiff-Rocks-Node-Module");
	}

	/**
	 * Fetch shortened info for a short code.
	 * @static
	 * @param {string} code - The code to fetch info for.
	 * @returns {Result}
	 * @memberof YiffRocks
	 * @example YiffRocks.getByCode("OwOWhatsThis");
	 */
	static async getByCode(code: string) {
		return new Promise<Result>((a, b) => {
			https
				.request({
					method: "GET",
					hostname: "yiff.rocks",
					protocol: "https:",
					path: `/${code}.json`,
					headers: {
						"User-Agent": this.userAgent
					}
				}, (res) => {
					const data: Buffer[] = [];

					res
						.on("error", (err) => b(err))
						.on("data", (d) => data.push(d))
						.on("end", () => {
							const v = JSON.parse(Buffer.concat(data).toString());
							if (res.statusCode !== 200) b(new APIError(`Non-200 OK Response From API: ${res.statusCode} ${res.statusMessage}`, v.message));
							else return a(v.data);
						});
				})
				.end();
		});
	}
}

export default YiffRocks;

// For JavaScript Stuff
module.exports = YiffRocks;
module.exports.YiffRocks = YiffRocks;
module.exports.APIError = APIError;
