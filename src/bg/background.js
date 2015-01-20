////////////////////////////////
//    SET GLOBAL VARIABLES    //
////////////////////////////////

var snooze_loop, alarm_loop, passedMinutes, 
	scriptRunning, 	/* to sync running status with content script */
	minuteSet,		/* minutes for each alarm set in options */
	alarmTime;		/* calculated alarm time in ms */

var minute = 60000;
//var minute = 6000; // just for debugging purposes
var snoozeMinutes = 5;

////////////////////////////////
//       RUN THAT SHIT        //
////////////////////////////////

function init() {

	update();

	if(alarm_loop) scriptRunning = true;
	else scriptRunning = false;

	passedMinutes = 0;
}

function update() {
	syncOptions();

	alarmTime = minuteSet * minute;
	if(minuteSet) {
		console.log('============================')
		console.log('alarm every: ' + minuteSet + ' minutes.');
		console.log('starting ...');
	}
	else {
		console.log('nothing set yet.');
	}
	
}

function run() {
	update();

	alarm_loop = setTimeout(alarm, alarmTime);
	if(alarm_loop) scriptRunning = true;
}

function alarm() {
	createNotification();
	snooze_loop = setInterval(snooze, minute*snoozeMinutes);
}

function snooze() {
	// console.log("snooze started");
	passedMinutes += snoozeMinutes;
	checkNotification();
}

////////////////////////////////
//       HANDLE CLICKS        //
////////////////////////////////

function buttonClicked(notId, button) {
	// buttonIndex: 0 = ok || 1 = shut up
	if (button == 0) {
		clearInterval(snooze_loop);
		clearNotification();
		alarm_loop = setTimeout(alarm, alarmTime);

		// console.log("alarm reseted");
	}
	else if (button == 1) {
		clearInterval(snooze_loop);
		scriptRunning = false;
		// console.log("alarm stopped!");
	}
}

function areaClicked(notId) {
	chrome.notifications.update("popup1", {priority: 0}, callback);
	function callback(wasUpdated){
		//console.log("popup closed: " + wasUpdated);
	}
}


////////////////////////////////
//  HANDLE ALL NOTIFICATIONS  //
////////////////////////////////

function checkNotification() {
	chrome.notifications.update("popup1", {priority: 0}, function(existed){
		if(existed) {
			chrome.notifications.update("popup1", {priority: 2}, function() {
				return updateNotification();
			});
		} else {
			console.log('notification could not be updated');
		}
	});
}

function createNotification() {
	var opt = {
		type: "basic",
		title: "IT'S TIME TO DRINK!",
		message: "Drink some water now.",
		iconUrl: "../icons/popup_icon.png",
		priority: 2,
		buttons: [{
			title: "Ok, done."
		}, {
			title: "Shut up!"
		}]
	};
	chrome.notifications.create("popup1", opt, callback);

	function callback(notID) {
		//console.log("notification " + notID + " created");
	}
}

function updateNotification() {
	var msg = "You should have taken a drink " + passedMinutes + " minutes ago.";
	var opt = {message: msg};

	chrome.notifications.update("popup1", opt, callback);

	function callback(wasUpdated){
		//console.log("popup updated: " + wasUpdated);
	}
}

function clearNotification() {
	chrome.notifications.clear("popup1", callback);
	function callback(deleted){
		//console.log("popup cleared: " + deleted);
	}
}

////////////////////////////////
//       SYNC SETTINGS        //
////////////////////////////////

function syncOptions() {
	chrome.storage.sync.get({minSet: '60'}, function(obj) {
		//console.log('sync callback: ' + obj.minSet + ' minutes set.');
	});
}

////////////////////////////////
//     LAUNCH ON STARTUP      //
////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
	init();
	chrome.notifications.onClicked.addListener(areaClicked);
	chrome.notifications.onButtonClicked.addListener(buttonClicked);
});


////////////////////////////////
//  LISTEN TO OMNIBOX-INPUT   //
////////////////////////////////

chrome.omnibox.onInputEntered.addListener(function(input){
	var i = input.split(" ");

	if(i[0] == "start") console.log("started via omnibox with " + i[1] + " minutes.");
	else if(i[0] == "stop") console.log("stopped via omnibox");
	
});

////////////////////////////////
//  LISTEN TO CONTENTSCRIPT   //
////////////////////////////////

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.run == true) { // playbutton has been clicked -> start background script
    	clearNotification(); // if there is a notification, clear it

    	run(); // start background script
      	sendResponse({running: true}); // send response to content script
  	}
  	else if (request.stop == true) { // stopbutton has been clicked -> stop to run.

		clearNotification(); // clear notification
  		
  		if(snooze_loop) clearInterval(snooze_loop); //else console.log('no snooze_loop defined');
  		if(alarm_loop) clearTimeout(alarm_loop); //else console.log('no alarm_loop defined');
		
		scriptRunning = false;
  		sendResponse({running: false}); // send response to content script
  	}

  	// TELL CONTENTSCRIPT IF COUNTER IS CURRENTLY ACTIVE
  	else if (request.query == 'running') {
  		sendResponse({answer: scriptRunning});
  		//console.log('received query: ' + request.query);
  	}

  	// RECEIVE MINUTES SET IN OPTIONS
  	else if (request.minutes) {
  		sendResponse({answer: scriptRunning});
  		minuteSet = request.minutes;
  		console.log('received minutes: ' + minuteSet);
  	}
});



