var running;

////////////////////////////////
// COMMUNICATE W/ BACKGROUND  //
////////////////////////////////

function sendBackgroundQuery(q) {
	chrome.runtime.sendMessage({query: q}, function(response) {
		running = response.answer;
		if(running == true) document.getElementById('playpause').src = '../../icons/svg/dm_pause.svg';
	});
}

////////////////////////////////
//         SETTINGS           //
////////////////////////////////

function save_options() {
	var min = document.getElementById('minutes').value;

	chrome.storage.sync.set({
		minSet: min
	}, function() {
		chrome.runtime.sendMessage({minutes: min}, function(response) { /*sent = response.answer;*/ }) // tell background script set minutes
	})
}

function read_options() {
	chrome.storage.sync.get({
		minSet: '60'
	}, function(options) {
		document.getElementById('minutes').value = options.minSet;
		document.getElementById('counter').innerHTML = options.minSet;
	});
}

////////////////////////////////
//     LAUNCH ON STARTUP      //
////////////////////////////////

onload = function() {

	sendBackgroundQuery('running'); // ask if timer is running
	read_options(); // read settings from local storage

	var flipper = document.getElementById("flip-container");

	document.getElementById('settings').addEventListener('click', function() {
		flipper.className = flipper.className + " hover";
	});

	document.getElementById('saveSettings').addEventListener('click', function() {
		save_options(); // save settings to local storage
		flipper.className = flipper.className.replace(" hover", "");
		read_options(); // restore options set to display changed time on popup
	});

	document.getElementById('runToggle').addEventListener('click', function() {
		if(running == false) {
			chrome.runtime.sendMessage({run: true}, function(response) {
				running = response.running; // tell background script to start timer
			});
			document.getElementById('playpause').src = '../../icons/svg/dm_pause.svg';
		}
		else if (running == true) {
			chrome.runtime.sendMessage({stop: true}, function(response) {
				running = response.running; // tell background script to stop timer
			});
			document.getElementById('playpause').src = '../../icons/svg/dm_play.svg';
		}
	});
}