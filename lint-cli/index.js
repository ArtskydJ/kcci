
const denodeify = require('then-denodeify')
const fs = require('fs')
var writeFile = denodeify(fs.writeFile.bind(fs))

const path = require('path')
const glob = denodeify(require('glob'))
const Butler = require('noddity-butler')
const levelmem = require('level-mem')
const Retrieval = require('noddity-fs-retrieval')
const Linkifier = require('noddity-linkifier')
const Validator = require('validate-noddity-post')
const promiseMap = require('p-map')
const promiseEach = require('p-each')

module.exports = async function abc({noddityRoot, outputDir, data={}, template}) {
	const db = levelmem('wheee')
	const retrieval = new Retrieval(noddityRoot)
	const butler = new Butler(retrieval, db)
	const linkifier = new Linkifier('/')

	const validatePost = Validator({
		butler,
		linkifier,
		data,
		template
	})
	const filePaths = await glob('**/*.m?(m)d', { cwd: noddityRoot })

	const validatorResults = await promiseMap(filePaths, validatePost2)

	const errors = validatorResults
		.filter(({error}) => error)

	if (errors.length) {
		errors.forEach(({ error, filePath }) => console.log(filePath, error.message))
		throw new Error(errors.length + ' posts are invalid')
	}

	if (outputDir) {
		const getPost = denodeify(butler.getPost)
		const postsAndMetadata = await promiseMap(validatorResults, async ({ html, filePath }) => {
			const { metadata } = await getPost(filePath)
			return { html, filePath, metadata }
		})
		const postsToPublish = postsAndMetadata.filter(({ metadata }) => {
			console.log(metadata.published)
			return metadata.published} )
		console.log(postsToPublish)

		await promiseMap(postsToPublish, ({ html, filePath }) => {
			var destinationPath = path.join(outputDir, filePath)
			// TODO: run mkdirp before writeFile
			// TODO: make sure the file is not empty
			// TODO: use sindresorhus's promise-each module (not sure of name)
			return writeFile(destinationPath, html)
		})
	}

	function validatePost2(filePath) {
		return validatePost(filePath).then(({error, html}) => ({ error, html, filePath }))
	}
}
