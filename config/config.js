module.exports = {
	development: {
		db: 'mongodb://spottitsandbox:spottitsandbox14@ds061288.mongolab.com:61288/spottit',
		// db: 'mongodb://localhost/spotted',
		app: {
			name: 'Passport Authentication Tutorial'
		},
		facebook: {
			clientID: "clientID",
			clientSecret: "clientSecret",
			callbackURL: "http://localhost:3000/auth/facebook/callback"
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
