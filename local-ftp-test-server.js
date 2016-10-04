var ftpd = require('ftpd')

var server = new ftpd.FtpServer('127.0.0.1', {
	getInitialCwd: function() {
		return '/'
	},
	getRoot: function() {
		return process.cwd() + '/remote-ftp'
	}
})

server.on('client:connected', function(connection) {
	connection.on('command:user', function(user, success, failure) {
		user === 'joseph' ? success() : failure()
	})

	connection.on('command:pass', function(pass, success, failure) {
		pass === '123456' ? success('joseph') : failure()
	})
})

server.listen(21)
