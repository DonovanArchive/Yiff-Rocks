import YiffRocks, { APIError } from "..";

export default function create(code: string, mgmt: string, o: Record<string, string>) {
	if (!code) throw new TypeError("Missing code.");
	if (!mgmt) throw new TypeError("Missing management code.");
	if (!o.delete && !o.edit) throw new TypeError("One of --delete or --edit must be provided.");
	if (o.delete) {
		YiffRocks
			.deleteShortURL(code, mgmt)
			.then(() => console.log("That short url was successfully deleted."))
			.catch(err => {
				if (err instanceof APIError) {
					switch (err.code) {
						case 401: return console.error("Invalid management code.");
						case 403: return console.error("That short url cannot be deleted, due to it not having a management code.")
						case 404: return console.error("Unknown short code. Make sure you're providing only the code, and not a url.");
						case 500: return console.error("Unknown internal server error.");
						case 502: return console.error("We failed to contact our shortening api, please try again later.");
						case 504: return console.error("We hit a timeout error when contacting our api, try again later.");
						default: return console.log("API Error:", err);
					}
				} else console.log("Unknown Error:", err)
			});
	} else {
		const j = {} as any;
		if (o.url) j.url = o.url;
		if (o.credit) j.credit = o.credit;
		if (JSON.stringify(j) === "{}") throw new TypeError("One of url or credit is required for edit.");
		YiffRocks.editShortURL(code, mgmt, j)
			.then(res => {
				console.log("Successfully modified that short url.");
				console.log("Code:", res.code);
				console.log("URL:", res.url);
				console.log("Shortened URL:", res.fullURL);
				console.log("Position:", res.pos);
				console.log("Credit:", res.credit);
			})
			.catch(err => {
				if (err instanceof APIError) {
					switch (err.code) {
						case 400: return console.error(err.obj);
						case 401: return console.error("Invalid management code.");
						case 403: return console.error("That short url cannot be modified, due to it not having a management code.")
						case 404: return console.error("Unknown short code. Make sure you're providing only the code, and not a url.");
						case 500: return console.error("Unknown internal server error.");
						case 502: return console.error("We failed to contact our shortening api, please try again later.");
						case 504: return console.error("We hit a timeout error when contacting our api, try again later.");
						default: return console.log("API Error:", err);
					}
				} else console.log("Unknown Error:", err)
			});;
	}

}
