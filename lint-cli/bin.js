#!/usr/bin/env node

require('babel-polyfill')
require('babel-register')({
	plugins: [
		'transform-async-to-generator',
	]
})
require('ractive').DEBUG = false
const lintAndSave = require('./index.js')

const noddityRoot = process.argv[2]
const outputDir = process.argv[3]

if (noddityRoot) {
	console.log(`Linting ${noddityRoot}`)
} else {
	throw new Error('Usage: node lint-cli/index.js noddityRootDir [outputDir]')
}

lintAndSave({noddityRoot, outputDir}).catch(error => {
	console.error(error)
	process.exit(1)
})
