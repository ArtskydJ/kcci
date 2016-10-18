#!/usr/bin/env node

var Ftp = require('jsftp')
require('jsftp-mkdirp')(Ftp)
var dive = require('dive')
var Bagpipe = require('bagpipe')
var fs = require('fs')
var joinPath = require('path').join
var resolvePath = require('path').resolve
var dirname = require('path').dirname
var textMetadataParser = require('text-metadata-parser')

var fromPath = process.cwd()

require('./local-ftp-test-server.js')
var ftpUser = 'joseph'
var ftpPass = '123456'
var ftpHost = '127.0.0.1'
var ftpRootPath = '/'

/*
var fromPath = process.argv[2]
var ftpHost = process.argv[3]
var ftpRootPath = process.argv[4]
if (!fromPath || !ftpHost || !ftpRootPath) {
	console.error('Usage: node copy-deploy.js fromPath ftpHost ftpRootPath')
	console.error('E.g.   node copy-deploy.js /usr/me/git/KayserCommentary ftp.kaysercommentary.com /files')
	process.exit(1)
}
console.log('deploying from', fromPath, 'to', ftpHost + ftpRootPath)
var ftpUser = process.env.FTP_USER || 'joseph'
var ftpPass = process.env.FTP_PASS || '123456'
*/

var ftp = null

setTimeout(function () {
	ftp = new Ftp({
		host: ftpHost
	})

	ftp.auth(ftpUser, ftpPass, function (err) {
		if (err) throw err

		copyAndDeploy(fromPath,  ftpRootPath)
	})
}, 2500)

var bag = new Bagpipe(5)

function copyAndDeploy(fromPath, ftpRootPath) {
	var observed = {}

	dive(fromPath, function handlePath(err, filePath) {
		if (err) {
			console.error('error 1:', err && err.message)
		} else {
			var fullFromPath = resolvePath(process.cwd(), fromPath)

			var relevantPath = filePath.substring(fullFromPath.length)
			var remotePath = joinPath(ftpRootPath, relevantPath)

			observed[remotePath] = true

			bag.push(action, filePath, remotePath)
		}
	}, function onComplete() {
		//deleteEverythingElse(ftpRootPath, observed)
	})
}


function action(filePath, remotePath, done) {
	fs.readFile(filePath, { encoding: 'utf8' }, function(err, data) {
		var publishThisFile = true
		try {
			if (/\.mm?d$/.test(filePath)) {
				var post = textMetadataParser(data)
				publishThisFile = post.metadata.published
			}
		} catch (e) {
			publishThisFile = false
			console.log('error reading', filePath)
			done()
		}

		if (publishThisFile) {
			ftp.mkdirp(dirname(remotePath)).then(function fulfilled() {
				console.log('Copying to', remotePath)
				ftp.put(data, remotePath, function(err) {
					if (err) {
						console.error(err)
					}
					done()
				})
			}, function rejected(err) {
				console.error(err)
				done()
			})
		} else {
			done()
		}
	})
}

function deleteEverythingElse(toPath, observedFile) {
	console.log('trying to delete from', toPath)
	dive(toPath, function(err, filePath) {
		if (!observedFile[filePath]) {
			bag.push(deleteFile, filePath)
		}
	})
}

function deleteFile(path, cb) {
	console.log('deleting', path)
	fs.unlink(path, cb)
}
