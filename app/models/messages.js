var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

MessageSchema = mongoose.Schema({
	sender : { type: Schema.Types.ObjectId, ref: 'User'},
	created : Date,
	body : String,
	read : Boolean
});

var Message = mongoose.model('Message', MessageSchema);
module.exports = Message;