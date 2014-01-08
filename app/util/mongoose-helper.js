// Taken from the following source:
// https://gist.github.com/joeytwiddle/6129676

// Example usage:
//   deepPopulate(blogPost, "comments comments._creator comments._creator.blogposts", {sort:{title:-1}}, callback);
// Note that the options get passed at *every* level!
// Also note that you must populate the shallower documents before the deeper ones.
module.exports = function (doc, pathListString, options, callback) {
	var listOfPathsToPopulate = pathListString.split(" ");
	function doNext() {
		if (listOfPathsToPopulate.length == 0) {
			// Now all the things underneath the original doc should be populated.  Thanks mongoose!
			callback(null,doc);
		} else {
			var nextPath = listOfPathsToPopulate.shift();
			var pathBits = nextPath.split(".");
			var listOfDocsToPopulate = resolveDocumentzAtPath(doc, pathBits.slice(0,-1));
			if (listOfDocsToPopulate.length > 0) {
				var lastPathBit = pathBits[pathBits.length-1];
				// There is an assumption here, that desendent documents which share the same path will all have the same model!
				// If not, we must make a separate populate request for each doc, which could be slow.
				var model = listOfDocsToPopulate[0].constructor;
				var pathRequest = [{
					path: lastPathBit,
					options: options
				}];
				console.log("Populating field '"+lastPathBit+"' of "+listOfDocsToPopulate.length+" "+model.modelName+"(s)");
				model.populate(listOfDocsToPopulate, pathRequest, function(err,results){
					if (err) return callback(err);
					//console.log("model.populate yielded results:",results);
					doNext();
				});
			} else {
				// There are no docs to populate at this level.
				doNext();
			}
		}
	}
	doNext();
};
 
function resolveDocumentzAtPath(doc, pathBits) {
	if (pathBits.length == 0) {
		return [doc];
	}
	//console.log("Asked to resolve "+pathBits.join(".")+" of a "+doc.constructor.modelName);
	var resolvedSoFar = [];
	var firstPathBit = pathBits[0];
	var resolvedField = doc[firstPathBit];
	if (resolvedField === undefined || resolvedField === null) {
		// There is no document at this location at present
	} else {
		if (Array.isArray(resolvedField)) {
			resolvedSoFar = resolvedSoFar.concat(resolvedField);
		} else {
			resolvedSoFar.push(resolvedField);
		}
	}
	//console.log("Resolving the first field yielded: ",resolvedSoFar);
	var remainingPathBits = pathBits.slice(1);
	if (remainingPathBits.length == 0) {
		return resolvedSoFar;   // A redundant check given the check at the top, but more efficient.
	} else {
		var furtherResolved = [];
		resolvedSoFar.forEach(function(subDoc){
			var deeperResults = resolveDocumentzAtPath(subDoc, remainingPathBits);
			furtherResolved = furtherResolved.concat(deeperResults);
		});
		return furtherResolved;
	}
};
