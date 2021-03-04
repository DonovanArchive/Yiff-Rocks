#!/usr/bin/env node
import pkg from "../../package.json";
import { program } from "commander";
import YiffRocks from "../index";
YiffRocks.setUserAgent(`YiffRocks-CLI/${pkg.version} (https://github.com/FurryBotCo/Yiff-Rocks)`);

program
	.storeOptionsAsProperties(true)
	.version(pkg.version);

program
	.command("create")
	.storeOptionsAsProperties(true)
	.arguments("<url>")
	.description("Shorten a url.")
	.option("--credit <string>", "the credit name for the shortened url")
	.option("--code <string>", "the code to use for the shortened url")
	.action((url, opts) => require("./create").default(url, opts));

program
	.command("get")
	.arguments("<code>")
	.action((code, opts) => require("./get").default(code, opts));

program
	.command("modify")
	.arguments("<short-code> <management-code>")
	.option("--delete", "Delete the short url.")
	.option("--edit", "Edit the short url")
	.option("--url <string>", "The new url. Edit only.")
	.option("--credit <string>", "The new credit. Edit only.")
	.action((code, mgmt, opts) => require("./modify").default(code, mgmt, opts));


program.parse(process.argv);
if (process.argv.length === 2) program.help();
