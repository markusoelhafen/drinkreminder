////////////////////////////////
//    SET GLOBAL VARIABLES    //
////////////////////////////////

var snooze_loop, alarm_loop, passedMinutes, 
	scriptRunning, 	/* to sync running status with content script */
	minuteSet,		/* minutes for each alarm set in options */
	alarmTime;		/* calculated alarm time in ms */

var minute = 60000;
var snoozeMinutes = 5;

////////////////////////////////
//       RUN THAT SHIT        //
////////////////////////////////

function init() {

	syncOptions();

	if(alarm_loop) scriptRunning = true;
	else scriptRunning = false;

	passedMinutes = 0;
}

function update() {
	syncOptions();

	alarmTime = minuteSet * minute;

	if(minuteSet) console.log('============================' + '\n' + ' starting ...');
	else console.log('nothing set yet.');
	
}

function run() {
	update();

	alarm_loop = setTimeout(alarm, alarmTime);
	if(alarm_loop) scriptRunning = true;
}

function stop() {
	clearNotification(); // clear notification  		
  	
  	try{
  		if(snooze_loop) clearInterval(snooze_loop); //else console.log('no snooze_loop defined');
  		if(alarm_loop) clearTimeout(alarm_loop); //else console.log('no alarm_loop defined');
  		scriptRunning = false;
  		console.log('timer stopped'); 
  	}
  	catch(err){
  		console.log('still running?');
  	}
}

function alarm() {
	createNotification(); // timer run out -> send notification form chrome
	snooze_loop = setInterval(snooze, minute*snoozeMinutes); // start snooze timer
}

function snooze() {
	passedMinutes += snoozeMinutes;
	checkNotification();
}

////////////////////////////////
//       HANDLE CLICKS        //
////////////////////////////////

function buttonClicked(notId, button) { // buttonIndex: 0 = ok || 1 = shut up
	if (button == 0) {
		clearInterval(snooze_loop);
		clearNotification();
		alarm_loop = setTimeout(alarm, alarmTime);
	}
	else if (button == 1) {
		stop();
		/*clearInterval(snooze_loop);
		scriptRunning = false;*/
	}
}

function areaClicked(notId) {
	chrome.notifications.update("popup1", {priority: 0}, function cb(areaClicked){} );
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
	//chrome.notifications.create("popup1", opt, callback);
	chrome.notifications.create("popup1", opt, function cb(notID){} );
}

function updateNotification() {
	var msg = "You should have taken a drink " + passedMinutes + " minutes ago.";
	var opt = {message: msg};

	chrome.notifications.update("popup1", opt, function cb(wasUpdated){} );
}

function clearNotification() {
	chrome.notifications.clear("popup1", function cb(deleted){} );
}

////////////////////////////////
//       SYNC SETTINGS        //
////////////////////////////////

function syncOptions() {
	chrome.storage.sync.get({
		minSet: '60'
	}, function(options) {
		minuteSet = options.minSet;
  		console.log('minuteSet: ' + minuteSet);
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

	if(i[0] == "start") run(); // if(i[1]) minuteSet = i[1]; 
	else if(i[0] == "stop") stop();
	
});

////////////////////////////////
//  LISTEN TO CONTENTSCRIPT   //
////////////////////////////////

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.run == true) { // playbutton has been clicked -> start background script
    	clearNotification(); // if there is any notification active, clear it

    	run(); // start background script
      	sendResponse({running: true}); // send response to content script
  	}
  	else if (request.stop == true) { // stopbutton has been clicked -> stop to run.
		stop();
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