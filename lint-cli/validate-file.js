const parser = require('text-metadata-parser')

// https://github.com/TehShrike/noddity-retrieval/blob/master/index.js#L40-L43
const noddityParserOptions = {
	date: 'date',
	boolean: 'markdown'
}

// I don't particularly *like* that this is synchronous, but it makes its usage way easier to code
module.exports = function validateFileData(fileData) {

	try {
		const post = parser(fileData, noddityParserOptions)
	} catch (e) {
		return new Error(yamlParserError(e))
	}

	if (typeof post !== 'undefined' && post.metadata && post.metadata.date && !dateIsValid(post.metadata.date)) {
		return new Error(`invalid date found: ${post.metadata.date}`)
	}
}

function yamlParserError(e) {
	return `${e.name} near the content:
${e.mark.buffer}`
}

function dateIsValid(date) {
	return date instanceof Date && isFinite(date) && dateIsInValidRange(date)
}

function dateIsInValidRange(date) {
	const earliestDate = new Date('1975-01-01')
	const latestDate = new Date('2020-01-01')
	return date > earliestDate && date < latestDate
}
