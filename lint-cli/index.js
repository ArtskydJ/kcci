#!/usr/bin/env node

const fs = require('fs')
const glob = require('glob')
const validateFile = require('./validate-file.js')

const noddityRoot = process.argv[2]

if (noddityRoot) {
	console.log(`Linting ${noddityRoot}`)
} else {
	throw new Error('Usage: node lint-cli/index.js <noddityRoot>')
}

glob('**/*.mm?d', { cwd: noddityRoot }, (err, filePaths) => {
	if (err) throw err

	filePaths.forEach(filePath => { // rate limit this?
		fs.readFile(filePath, { encoding: 'utf8' }, (errFs, fileData) => {
			const err = errFs || validateFileData(fileData)
			if (err) {
				console.error(`${err.toString()} (${filePath})`)
				process.exitCode = 1
			}
		})
	})
})
