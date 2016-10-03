var oldRequire = require
require = function (name) {
	if (name === 'fs') {
		return {
			readFile: function () { console.log('lol') }
		}
	} else {
		return oldRequire(name)
	}
}

require('fs').readFile()

console.log(require('./package.json').name)
