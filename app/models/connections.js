var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

ConnectionSchema = mongoose.Schema({
	created : Date,
	users : [{ type: Schema.Types.ObjectId, ref: 'User'}],
	messages : [{ type: Schema.Types.ObjectId, ref: 'Message'}]
});

//TODO: There may be a more efficient way of doing this with mongo commands...
ConnectionSchema.statics.addNumUnread = function(user, callback){
	//assuming messages already populated...
	user.connections.forEach(function(connection){
		connection.unread = 0;
		connection.messages.forEach(function(message){
			if(!message.sender._id.equals(user._id) && !message.read)
				connection.unread +=1;
		});
	});
	callback(user);
}

ConnectionSchema.statics.sendMessage = function(req, res){
    Connection.findOne({_id: req.params.id}, function(error, connection){
    	User.findOne({_id: req.user._id}, function(error, usr){
    	var msg = new Message({
    		body : req.body.body,
    		sender : usr,
    		created : new Date(),
    		read : false		//don't know if this is necessary, 
    							// but leaving it for future purposes
    	});
    	msg.save();
    	connection.messages.push(msg);
    	connection.save();

    	// res.writeHead(200, { 'Content-Type': 'application/json' });
	    res.redirect('/connection/'+req.params.id+'/messages');
    });
    });
    //Should add socket emit here if second user is connected
};

connectionExists = function(connections, id_array, callback){
	console.log(connections);
	id_array.sort();
	for(i=0;i<connections.length;i++){
				conn = connections[i];
				conn.users.sort();
				count = 0;
				for(j=0;j<2;j++){
					console.log(conn.users[j]);
					console.log(id_array[j]);
					if(conn.users[j].equals(id_array[j])){
						count++;
					} 
				}
				if(count == 2) return i;
	}
	return -1;
}

// Had to put the create connections here because of circular dependency problems
//TODO: need to finish this there might be some issues, i.e. need to populate and
// 		then see if they exist...
ConnectionSchema.statics.requestConnection = function(req, res){
	User.findOne({_id : req.user._id}).populate('connections connectionPending')
	.exec(function(err, me){
		User.findOne({_id : req.params.id}, function(err, requested){
			if(err){
			 console.log(err);
			 res.writeHead(500, 'Internal server error.');
			 res.end();
			 return;
			}

			if(!me.connectionPending) me.connectionPending = []
			if(!requested.connectionRequests) requested.connectionRequests = []

			var id_array = [requested._id, me._id];
			if(connectionExists(me.connectionPending, id_array) < 0 &&
				connectionExists(me.connections, id_array) < 0){
				var conn = new Connection({
					created	: new Date(),
					messages : []
				});
				conn.users.push(requested);
				conn.users.push(me);
				me.connectionPending.push(conn);
				requested.connectionRequests.push(conn);

				conn.save();
				me.save();
				requested.save();
	        	res.writeHead(200, { 'Content-Type': 'application/json' });
			}
			else{
	        	res.writeHead(403, 'Request already exists. Forbidden.');	
			}
			//Otherwise have that connection so shouldn't add it again
			//TODO: error handling
	        res.end();
		});
	});
}

ConnectionSchema.statics.acceptConnection = function(req, res){	
	User.findOne({_id : req.user._id}).populate('connectionRequests')
	.exec(function(err, me){
		User.findOne({_id : req.params.id}).populate('connectionPending')
		.exec(function(err, requested){
			if(err){
			 console.log(err);
			 res.writeHead(500, 'Internal server error.');
			 res.end();
			 return;
			}

			if(!me.connectionRequests) me.connectionRequests = []
			if(!requested.connectionPending) requested.connectionPending = []
			if(!me.connections) me.connections = []
			if(!requested.connections) requested.connections = []

			var id_array = [requested._id, me._id];
			var conn = new Connection({
				created : new Date(),
				messages : []
			});
			conn.users.push(requested);
			conn.users.push(me);

			var index = connectionExists(me.connectionRequests, id_array);
	        if (index > -1) {
	          me.connectionRequests.splice(index, 1);
	        }
			me.connections.push(conn);

			var index = connectionExists(requested.connectionPending, id_array);
			if (index > -1) {
	          requested.connectionPending.splice(index, 1);
	        }
			requested.connections.push(conn);

			conn.save();
			me.save();
			requested.save();
			//TODO: error handling
      		res.writeHead(200, { 'Content-Type': 'application/json' });
      		res.end();
		});
	});
}

ConnectionSchema.statics.rejectConnection = function(req, res){
	//TODO: should maybe have rejected list to block users from requesting again?
	User.findOne({_id : req.user._id}).populate('connectionRequests')
	.exec(function(err, me){
		User.findOne({_id : req.params.id}).populate('connectionPending')
		.exec(function(err, requested){
			if(err){
			 console.log(err);
			 res.writeHead(500, 'Internal server error.');
			 res.end();
			 return;
			}

			if(!me.connectionRequests) me.connectionRequests = []
			if(!requested.connectionPending) requested.connectionPending = []
			var id_array = [requested._id, me._id];

			var index = connectionExists(me.connectionRequests, id_array);
	        if (index > -1) {
	          me.connectionRequests.splice(index, 1);
	        }

			var index = connectionExists(requested.connectionPending, id_array);
			if (index > -1) {
	          requested.connectionPending.splice(index, 1);
	        }
	        conn.remove();
			me.save();
			requested.save();
			//TODO: error handling
      		res.writeHead(200, { 'Content-Type': 'application/json' });
      		res.end();
		});
	});
}

var Connection = mongoose.model('Connection', ConnectionSchema);
var Message = mongoose.model('Message');
var User = mongoose.model('User');
module.exports = Connection;