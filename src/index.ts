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
	 * The time this short url was modified at.
	 * @type {(string | null)}
	 * @memberof Result
	 */
	modifiedAt: string | null;
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
	 * The management code of this short url. This will only be present when creating NEW shortened urls.
	 * 
	 * This will only be returned once, so save it if you plan on using it.
	 * 
	 * This can be used to delete, and modify the shortened url.
	 * @type {(string | null)}
	 * @memberof Result
	 */
	managementCode: string | null;
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

export class ShortURL implements Result {
	code: string;
	createdAt: string;
	modifiedAt: string | null;
	url: string;
	pos: number;
	managementCode: string | null;
	credit: string;
	fullURL: string;
	constructor(info: Result) {
		Object.assign(this, info);
	}


	/**
	 * Delete an existing short url.
	* @returns {Promise<void>}
	 * @memberof ShortURL
	 * @example ShortURL.delete();
	 */
	async delete() {
		if (this.managementCode === null) throw new TypeError("This short url cannot be deleted.");
		return YiffRocks.deleteShortURL(this.code, this.managementCode!)
	}

	/**
	 * Edit an existing short url.
	 * @param {object} update - The data to update
	 * @param {string} [update.url] - The url to change to
	 * @param {string} [update.credit] - The credit to change to
	 * @returns {Promise<ShortURL>}
	 * @memberof ShortURL
	 * @example ShortURL.edit({ url: "https://google.com" });
	 * @example ShortURL.edit({ credit: "OwO" });
	 * @example ShortURL.edit({ url: "https://google.com", credit: "OwO" });
	 */
	async edit(update: Parameters<typeof YiffRocks["editShortURL"]>[2]) {
		if (this.managementCode === null) throw new TypeError("This short url cannot be modified.");
		return YiffRocks.editShortURL(this.code, this.managementCode!, update);
	}
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
	 * @param {string} [credit="Yiff-Rocks-Node-Module"] - The credit for shortening the url.
	 * @param {string} [code] - The code to use (overrides random code generation, may result in a 400 already in use error).
	 * @param {boolean} [editable=true] - If a management code should be returned for editing the short url later.
	 * @returns {Promise<ShortURL>}
	 * @memberof YiffRocks
	 * @example YiffRocks.create("https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg");
	 * @example YiffRocks.create("https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg", "Someone");
	 * @example YiffRocks.create("https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg", "Someone", "OwOWhatsThis");
	 */
	static async create(url: string, credit = "Yiff-Rocks-Node-Module", code?: string, editable = true) {
		return new Promise<ShortURL>((a, b) => {
			const req = https
				.request({
					method: "POST",
					hostname: "yiff.rocks",
					protocol: "https:",
					path: `/create${editable === false ? "?editable=false" : ""}`,
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
							if (res.statusCode !== 200) b(new APIError(`Non-200 OK Response From API: ${res.statusCode} ${res.statusMessage}`, v.error));
							else return a(new ShortURL(v.data));
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
	 * @returns {Promise<ShortURL>}
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
	 * @returns {Promise<ShortURL>}
	 * @memberof YiffRocks
	 * @example YiffRocks.getByCode("OwOWhatsThis");
	 */
	static async getByCode(code: string) {
		return new Promise<ShortURL>((a, b) => {
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
							if (res.statusCode !== 200) b(new APIError(`Non-200 OK Response From API: ${res.statusCode} ${res.statusMessage}`, v.error));
							else return a(new ShortURL(v.data));
						});
				})
				.end();
		});
	}

	/**
	 * Delete an existing short url.
	 * @param {string} code - The code of the short url to delete.
	 * @param {string} managementCode - The management code for the short url. This is returned when the short url is created.
	 * @returns {Promise<void>}
	 * @memberof YiffRocks
	 * @example YiffRocks.deleteShortURL("OwOWhatsThis", "1234");
	 */
	static async deleteShortURL(code: string, managementCode: string) {
		return new Promise<void>((a, b) => {
			https
				.request({
					method: "DELETE",
					hostname: "yiff.rocks",
					protocol: "https:",
					path: `/${code}.json`,
					headers: {
						"User-Agent": this.userAgent,
						"Authorization": managementCode
					}
				}, (res) => {
					const data: Buffer[] = [];

					res
						.on("error", (err) => b(err))
						.on("data", (d) => data.push(d))
						.on("end", () => {
							const v = JSON.parse(Buffer.concat(data).toString());
							if (res.statusCode !== 204) b(new APIError(`Non-204 No Content Response From API: ${res.statusCode} ${res.statusMessage}`, v.error));
							else return a();
						});
				})
				.end();
		});
	}

	/**
	 * Edit an existing short url.
	 * @param {string} code - The code of the short url to edit.
	 * @param {string} managementCode - The management code for the short url. This is returned when the short url is created.
	 * @param {object} update - The data to update
	 * @param {string} [update.url] - The url to change to
	 * @param {string} [update.credit] - The credit to change to
	 * @returns {Promise<ShortURL>}
	 * @memberof YiffRocks
	 * @example YiffRocks.editShortURL("OwOWhatsThis", "1234", { url: "https://google.com" });
	 * @example YiffRocks.editShortURL("OwOWhatsThis", "1234", { credit: "OwO" });
	 * @example YiffRocks.editShortURL("OwOWhatsThis", "1234", { url: "https://google.com", credit: "OwO" });
	 */
	static async editShortURL(code: string, managementCode: string, update: ({
		url: string;
		credit: string;
	}) | {
		url: string;
	} | {
		credit: string;
	}) {
		return new Promise<ShortURL>((a, b) => {
			const req = https
				.request({
					method: "PATCH",
					hostname: "yiff.rocks",
					protocol: "https:",
					path: `/${code}.json`,
					headers: {
						"User-Agent": this.userAgent,
						"Content-Type": "application/json",
						"Authorization": managementCode
					}
				}, (res) => {
					const data: Buffer[] = [];

					res
						.on("error", (err) => b(err))
						.on("data", (d) => data.push(d))
						.on("end", () => {
							const v = JSON.parse(Buffer.concat(data).toString());
							if (res.statusCode !== 200) b(new APIError(`Non-200 OK Response From API: ${res.statusCode} ${res.statusMessage}`, v.error));
							else return a(new ShortURL(v.data));
						});
				});
			req.write(JSON.stringify(update));
			req.end();
		});
	}
}

export default YiffRocks;

// For JavaScript Stuff
module.exports = YiffRocks;
module.exports.YiffRocks = YiffRocks;
module.exports.APIError = APIError;
