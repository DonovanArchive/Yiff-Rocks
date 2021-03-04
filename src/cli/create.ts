import YiffRocks, { APIError } from "..";

export default function create(url: string, o: Record<string, string>) {
	if (!url) throw new TypeError("Missing url.");
	YiffRocks
		.create(url, o.credit ?? "Yiff-Rocks-CLI", o.code, true)
		.then(res => {
			console.log(res.managementCode === null ? "A shortened version of that url already exists, using that." : "Your short url was successfully created.");
			console.log("Code:", res.code);
			console.log("URL:", res.url);
			console.log("Shortened URL:", res.fullURL);
			console.log("Management Code:", res.managementCode ?? "Unknown");
			console.log("Position:", res.pos);
			console.log("Credit:", res.credit);
		})
		.catch(err => {
			if (err instanceof APIError) {
				switch (err.code) {
					case 409: return console.error("That provided code is already in use.");
					// invalid url, code/credit too long
					// easier to print out what the api gives us rather than parse it
					case 422: return console.error(err.obj);
					case 500: return console.error("Unknown internal server error.");
					case 502: return console.error("We failed to contact our shortening api, please try again later.");
					case 504: return console.error("We hit a timeout error when contacting our api, try again later.");
					default: return console.error("API Error:", err);
				}
			} else console.error("Unknown Error:", err)
		});

}
