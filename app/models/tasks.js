var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

TaskSchema = mongoose.Schema({
	date : Date,
	description : String,
	complete : Boolean
});

TaskSchema.statics.addTask = function(req, res){
	if(!req.user){
		res.redirect('/login')
		return;
	}
	User.findOne({_id : req.user._id}).populate('tasks').exec(function(err, user){
		if(err){
			res.redirect('/login');
			return;
		}

		 Task.create({
	      user_id: req.user._id,
	      description: req.body.description,
	      date : new Date(),
	      complete : false
	    },
	      function(err, task){
	      //Should show error page
	      if (err) console.log("Error when saving party: ", err);
	      else{
	      	user.tasks.push(task);
	      	user.save();
	      }

	      res.redirect('/tasks');
	    });
	});
}

TaskSchema.statics.markComplete = function(req, res){
	Task.findOne({_id : req.params.task_id}, function(err, task){
		if(err){
			console.log("ERROR: ", err)
			res.redirect('/tasks')
		}

		task.complete = !task.complete;//toggle
		task.save();
		res.redirect('/tasks');
	})
}

var Task = mongoose.model('Task', TaskSchema);
var User      = mongoose.model( 'User' );

module.exports = Task;

