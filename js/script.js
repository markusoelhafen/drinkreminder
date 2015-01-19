var running;

////////////////////////////////
//        INITIALIZE          //
////////////////////////////////

function init() {
	running = false;
	sendBackgroundQuery('running');
	restore_options();
}

////////////////////////////////
// COMMUNICATE W. BACKGROUND  //
////////////////////////////////

function sendBackgroundQuery(q) {
	chrome.runtime.sendMessage({query: q}, function(response) {
		running = response.answer;
		toggleButton();
		
	});
}

function runReminder() {
	chrome.runtime.sendMessage({run: true}, function(response) {
		running = response.running;
		//console.log("running: " + running);
	});
}

function stopReminder() {
	chrome.runtime.sendMessage({stop: true}, function(response) {
		running = response.running;
		//console.log("stopped: " + running);
	});
}

function sendBackgroundMinutes(m) {
	chrome.runtime.sendMessage({minutes: m}, function(response) {
		sent = response.answer;
		//console.log('minutes sent: ' + m);
	})
}

////////////////////////////////
//      FLIP ANIMATION        //
////////////////////////////////

function toggleButton() {
	//var toggle = document.getElementById('runToggle');
	var toggle = document.getElementById('playpause');

	if(running == true) {
		console.log('changing icon');
		toggle.src = '../../icons/svg/dm_pause.svg';
	}
	else if (running == false) {
		console.log('not changing icon');
		toggle.src = '../../icons/svg/dm_play.svg';
	}
}

function openSettings() {
	var flipper = document.getElementById("flip-container");
	flipper.className = flipper.className + " hover";
}
function closeSettings() {
	var flipper = document.getElementById("flip-container");
	flipper.className = flipper.className.replace(" hover", "");
}

////////////////////////////////
//         SETTINGS           //
////////////////////////////////

function save_options() {
	var min = document.getElementById('minutes').value;

	chrome.storage.sync.set({
		minSet: min
	}, function() {
		//console.log('options saved with ' + min + ' minutes.');
	})
}

function restore_options() {
  chrome.storage.sync.get({
    minSet: '60'
  }, function(options) {
    document.getElementById('minutes').value = options.minSet;
    document.getElementById('counter').innerHTML = options.minSet;

    sendBackgroundMinutes(options.minSet); // send minutes to background script
  });
}

////////////////////////////////
//     LAUNCH ON STARTUP      //
////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {

	init();

	document.getElementById('settings').addEventListener('click', function() {
		openSettings(); // flip popup
	});

	document.getElementById('saveSettings').addEventListener('click', function() {
		//console.log("saveSettings triggered");
		save_options(); // save settings to local storage
		closeSettings(); // flip over again
		restore_options(); // restore options set to display changed time on popup
	});

	document.getElementById('runToggle').addEventListener('click', function() {
		//console.log("toggle clicked");
		if(running == false) {
			runReminder();
			running = true;
			return toggleButton();
		}
		else if (running == true) {
			stopReminder();
			running = false;
			return toggleButton();
		}
	});
});