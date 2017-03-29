module.exports = {
	development: {
		db: 'mongodb://test:test@test.com:61288/test',
		// db: 'mongodb://localhost/spotted',
		app: {
			name: 'Passport Authentication Tutorial'
		},
		facebook: {
			clientID: "asfsfasf",
			clientSecret: "asfasfsfasf",
			callbackURL: "asfasfasfsaf",
			profileFields: ['id', 'emails', 'displayName', 'photos']
  			// profileURL: 'https://graph.facebook.com/me?fields=id,name,email,picture'

		},
		google: {
			clientID: "asfasfsfa",
			clientSecret: "asfsafasf",
			callbackURL: 'asasfasfsf'		}
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
