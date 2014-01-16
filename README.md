SpotIt
======

See the Spotted events happening near you


To setup just do npm install

To populate your db with some data you can use the test data:

mongoimport --db spotted --collection posts --file test.json

To push to heroku

Then git push heroku release:master for the release branch or just master otherwise

install the heroku toolkit

you might need to get added as a collaborator on the proj if the commit fails so let me know

need to add remote (can google it)

===============================
The Location Algorithm Stuff  ||
===============================

Location:
	- This is like the campus or main location (i.e. McGill Concordia)
	- We initially hard code a range of coordinates for this, but allow the user to correct it via drop down or text box, allowing for misspellings (autocorrect?) with the correction we try to see if the coordinates make sense to be part of the range and then include them (with a small sorrounding region) if yes
	- If unknown try to reverse geocode and get City? Or neighborhood? If can't give city and then allow for the user to change/update it

Sublocation:
	- This is like the class or building
	- Also initially hard code this (at least for McGill), but also allow the user to edit and similarly update the locations stored 
	- If unknown try to reverse geocode and get address

Display:
	- Show regions on map somehow?
	- Figure out what posts need to be displayed in relation to highlighted region
	- Center the map correctly on the user's location
	- Figure out user location and sublocation and add it to posts so when they post it is classified correctly
	