# Yiff-Rocks
A module for the yiff.rocks url shortener.

This module is used for shortening urls using <a href="https://yiff.rocks">yiff.rocks</a>.

## How To Use:
```js
const YiffRocks = require("yiff-rocks");

// Shorten URL
// see "Result of all functions" for result
// This one should *not* throw an error under normal circumstances
// Warning: Image is NSFW
// This function can take between 1 and 3 parameters
// 1 - URL
// 2 - Credit (You can provide your name here for it to be tracked that you created the short url)// 3 - Code (Override the random generated code, will throw an error if it's already used)

YiffRocks.create(
	"https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg" // URL
);
YiffRocks.create(
	"https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg", // URL
	"Someone" // Credit
);
YiffRocks.create(
	"https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg", // URL
	"Someone", // Credit
	"OwOWhatsThis" // Code
	);

// Get Info By URL
// see "Result of all functions" for result
// This one should *not* throw an error under normal circumstances
// Warning: Image is NSFW
// this function takes 1 parameter
// 1 - URL
YiffRocks.create(
	"https://yiff.media/V2/furry/yiff/gay/2c9249179940a575c45d9835f0d5affe.jpg"
);

// Get Info By Code
// see "Result of all functions" for result
// This one will throw an error if the code is not used
// this function takes 1 parameter
// 1 - Code
YiffRocks.create(
	"OwOWhatsThis"
);
```


## Result of all functions:
If you don't know how to read typescript, just pretend it's an object with all of those properties.
```ts
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
```
