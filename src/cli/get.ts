import YiffRocks, { APIError } from "..";

export default function create(data: string, o: Record<string, string>) {
	if (!data) throw new TypeError("Missing code.");

	YiffRocks
		.getByCode(data)
		// if code fails, try url
		.catch(() =>
			YiffRocks.getByURL(data)
		)
		.then(res => {
			console.log("Successfully found that shortened url, details are listed below.");
			console.log("Code:", res.code);
			console.log("URL:", res.url);
			console.log("Shortened URL:", res.fullURL);
			console.log("Position:", res.pos);
			console.log("Credit:", res.credit);
		})
		.catch(err => {
			if (err instanceof APIError) {
				switch (err.code) {
					case 404: return console.error("Unknown short code/url.");
					case 500: return console.error("Unknown internal server error.");
					case 502: return console.error("We failed to contact our shortening api, please try again later.");
					case 504: return console.error("We hit a timeout error when contacting our api, try again later.");
					default: return console.error("API Error:", err);
				}
			} else console.error("Unknown Error:", err)
		});

}
