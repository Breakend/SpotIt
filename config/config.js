module.exports = {
	development: {
		db: 'mongodb://spottitsandbox:spottitsandbox14@ds061288.mongolab.com:61288/spottit',
		// db: 'mongodb://localhost/spotted',
		app: {
			name: 'Passport Authentication Tutorial'
		},
		facebook: {
			clientID: "1399029103680176",
			clientSecret: "1604e9a6d6dd3720c865975b09446f3c",
			callbackURL: "http://agile-ridge-8948.herokuapp.com/auth/facebook/callback"
		}
	},
  	production: {
    	db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL,
		app: {
			name: 'Passport Authentication Tutorial'
		},
		facebook: {
			clientID: "clientID",
			clientSecret: "clientSecret",
			callbackURL: "{{production callbackURL}}"
		}
 	}
}
