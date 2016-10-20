#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const glob = require('glob')
const validateFile = require('./validate-file.js')

const argv = minimist(process.argv.slice(2))
const noddityRoot = argv.noddityRoot

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
