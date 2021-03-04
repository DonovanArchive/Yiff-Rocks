#!/usr/bin/env node
import pkg from "../package.json";
import { program } from "commander";
import YiffRocks from "./index";
YiffRocks.setUserAgent(`YiffRocks-CLI/${pkg.version} (https://github.com/FurryBotCo/Yiff-Rocks)`);

program
	.version(pkg.version)
	.arguments("<url>")
	.option("--credit <string>", "the credit name for the shortened url")
	.option("--code <string>", "the code to use for the shortened url")
	.parse(process.argv);

if (process.argv.length === 2) program.help();

const o = program.opts();
const url = program.args[0];
if (!url) throw new TypeError("Missing url.");
YiffRocks
	.create(url, o.credit, o.code, true)
	.then(res => {
		console.log("Your short url was successfully created.");
		console.log("Code:", res.code);
		console.log("URL:", res.fullURL);
		console.log("Management Code:", res.managementCode ?? "None");
	})
	.catch(err => console.log("API Error:", err));
