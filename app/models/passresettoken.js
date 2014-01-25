var mongoose = require('mongoose'),
    passreset = require('pass-reset');
// Build the schema/model for token storage
var PassResetTokenSchema = new mongoose.Schema({
key: String,
token: String,
expires: {
        type: Date,
        default: function() {
                return new Date(Date.now() + passreset.expireTimeout());
        }
}
});

var PassResetToken = mongoose.model('PassResetToken', PassResetTokenSchema);
module.exports = PassResetToken;