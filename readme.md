  _____    _____    _____   _   _   _  __    _____    ______   __  __   _____   _   _   _____    ______   _____  
 |  __ \  |  __ \  |_   _| | \ | | | |/ /   |  __ \  |  ____| |  \/  | |_   _| | \ | | |  __ \  |  ____| |  __ \ 
 | |  | | | |__) |   | |   |  \| | | ' /    | |__) | | |__    | \  / |   | |   |  \| | | |  | | | |__    | |__) |
 | |  | | |  _  /    | |   | . ` | |  <     |  _  /  |  __|   | |\/| |   | |   | . ` | | |  | | |  __|   |  _  / 
 | |__| | | | \ \   _| |_  | |\  | | . \    | | \ \  | |____  | |  | |  _| |_  | |\  | | |__| | | |____  | | \ \ 
 |_____/  |_|  \_\ |_____| |_| \_| |_|\_\   |_|  \_\ |______| |_|  |_| |_____| |_| \_| |_____/  |______| |_|  \_\
                                                                                                                 
                                                                                                                 

Version 0.1.1.1

Drink Reminder is a simple chrome extension to remind you to drink enough during the day.

/ script.js contains all javascript necessary to run the content-script and add functionality to the browser-action, eg. the flyout-window of the extension.
/ script.js initializes everytime the flyout-window is opened. Therefore the timer cant run in the content script but must run in the background.

/ bg.js is running in the background and adds the functionality.
/ bg.js is running the timer
