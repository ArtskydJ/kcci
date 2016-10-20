#!/usr/bin/env node

var dive = require('dive')
var Bagpipe = require('bagpipe')
var fs = require('fs')
var path = require('path')
var textMetadataParser = require('text-metadata-parser')
var mkdirp = require('mkdirp')

var bag = new Bagpipe(5)

if (process.argv && process.argv.length >= 4) {
	console.log('deploying from', process.argv[2], 'to', process.argv[3])
	copyAndDeploy(process.argv[2], process.argv[3])
}

function copyAndDeploy(fromPath, toPath) {
	dive(fromPath, function handlePath(err, filePath) {
		if (err) {
			console.error('error 1:', err && err.message)
		} else {
			var fullFromPath = path.resolve(process.cwd(), fromPath)

			var relevantPath = filePath.substring(fullFromPath.length)
			var fullOutputPath = path.join(path.resolve(process.cwd(), toPath), relevantPath)

			bag.push(copyFile, fullOutputPath, filePath)
		}
	})
}


function copyFile(fullOutputPath, filePath, done) {
	if (/\.mm?d$/.test(filePath)) {
		copyMarkdownFileIfPublished(fullOutputPath, filePath, done)
	} else {
		copyNonMarkdownFile(fullOutputPath, filePath, done)
	}
}

function copyMarkdownFileIfPublished(fullOutputPath, filePath, done) {
	fs.readFile(filePath, { encoding: 'utf8' }, function(err, data) {
		try {
			var post = textMetadataParser(data)

			if (post.metadata.published) {
				mkdirp(path.dirname(fullOutputPath), function(err) {
					if (err) {
						console.error(err)
						done()
					} else {
						console.log('Publishing to', filePath)
						fs.writeFile(fullOutputPath, data, 'utf8', function(err) {
							if (err) {
								console.error(err)
							}
							done()
						})
					}
				})
			} else {
				done()
			}
		} catch (e) {
			console.log('error reading', filePath)
			done()
		}
	})
}

function copyNonMarkdownFile(fullOutputPath, filePath, done) {
	mkdirp(path.dirname(fullOutputPath), function(err) {
		if (err) {
			console.error(err)
			done()
		} else {
			console.log('copying to', fullOutputPath)
			var readStream = fs.createReadStream(filePath)
			readStream.pipe(fs.createWriteStream(fullOutputPath))
			readStream.on('end', done)
		}
	})
}
