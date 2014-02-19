function Gamepad() {
	var gamepad = this;
	gamepad.ANY_PORT = "ANY_PORT";
	gamepad.port = gamepad.ANY_PORT;
	gamepad.anonymous_port = undefined;
	gamepad.connected = false;
	gamepad.data = undefined;
	gamepad.ticking = false;

	gamepad.A = "A_BTN";
	gamepad.B = "B_BTN";
	gamepad.X = "X_BTN";
	gamepad.Y = "Y_BTN";
	gamepad.SEL = "SEL_BTN";
	gamepad.START = "START_BTN";
	gamepad.HOME = "HOME_BTN";
	gamepad.LS = "LS_BTN";
	gamepad.RS = "RS_BTN";
	gamepad.LB = "LB_BTN";
	gamepad.RB = "RB_BTN";

	gamepad.UP = "D_V_UP_BTN";		// treat as a button
	gamepad.DOWN = "D_V_DOWN_BTN";		// treat as a button
	gamepad.LEFT = "D_H_LEFT_BTN";		// treat as a button
	gamepad.RIGHT = "D_H_RIGHT_BTN";	// treat as a button

	gamepad.LT = "LT_AXIS";
	gamepad.RT = "RT_AXIS";
	gamepad.LV = "L_V_AXIS";
	gamepad.LH = "L_H_AXIS";
	gamepad.RV = "R_V_AXIS";
	gamepad.RH = "R_H_AXIS";

	gamepad.button_index_map = {
		"A_BTN": 0,
		"B_BTN": 1,
		"X_BTN": 2,
		"Y_BTN": 3,
		"LB_BTN": 4,
		"RB_BTN": 5,
		"SEL_BTN": 6,
		"START_BTN": 7, 
		"HOME_BTN": 8,
		"LS_BTN": 9,
		"RS_BTN": 10
	};

	gamepad.axis_index_map = {
		"L_H_AXIS": 0,
		"L_V_AXIS": 1,
		"LT_AXIS": 2,
		"R_H_AXIS": 3,
		"R_V_AXIS": 4,
		"RT_AXIS": 5,
		"D_H_LEFT_BTN": 6,
		"D_H_RIGHT_BTN": 6,
		"D_V_UP_BTN": 7,
		"D_V_DOWN_BTN": 7
	};

	gamepad.tick = function() {
		// Placeholder
		console.log("Starting procedure for joystick.");
	};

	gamepad.connect = function() {
		// Verify that current browser has gamepad capability
		if (!navigator || !navigator.webkitGetGamepads || !navigator.webkitGetGamepads()) {
			console.log("This browser does not have Chrome Gamepad capability.");
			return;
		}
		// Start ticking if not ticking (initial
		if (!gamepad.ticking) {
			gamepad.ticking = true;
			gamepad.tick();
			return;
		}
		// connect to a gamepad
		gamepad.data = navigator.webkitGetGamepads();
		for (var i = 0; i < gamepad.data.length; i++) {
			if (gamepad.data[i] !== undefined &&
					(gamepad.port === gamepad.ANY_PORT || gamepad.port == i)) {
				gamepad.connected = true;
				if (gamepad.port === gamepad.ANY_PORT) {
					gamepad.anonymous_port = i;
				}
				break;
			}
		}
	};

	gamepad.disconnect = function() {
		gamepad.connected = false;
		gamepad.ticking = false;
	};

	gamepad.selectGamepad = function(port) {
		gamepad.port = port;
		gamepad.anonymous_port = undefined;
		if (gamepad.data === undefined) {
			gamepad.connected = false;
		} else {
			if (port === gamepad.ANY_PORT || port >= gamepad.data.length) {
				for (var i = 0; i < gamepad.data.length; i++) {
					if (gamepad.data[i] !== undefined) {
						gamepad.anonymous_port = i;
						return gamepad;
					}
				}
				gamepad.connected = false;
			} else if (gamepad.data[port] === undefined) {
				gamepad.connected = false;
			}
		}
		return gamepad;
	};

	gamepad.gatherData = function() {
		var port = gamepad.port;
		if (port === gamepad.ANY_PORT) {
			port = gamepad.anonymous_port;
		}
		gamepad.data = navigator.webkitGetGamepads();
		if (gamepad.data === undefined) {
			gamepad.connected = false;
			return;
		}
	};

	gamepad.isValidButton = function(string) {
		return (string.length >= 4 && string.substring(string.length - 4, string.length) === "_BTN");
	};

	gamepad.isValidAxis = function(string) {
		return (string.length >= 4 && string.substring(string.length - 4, string.length) === "AXIS");
	};

	gamepad.getButton = function(button) {
		if (!gamepad.connected || !gamepad.isValidButton(button)) {
			return 0;
		}

		var data = undefined;
		if (gamepad.port === gamepad.ANY_PORT) {
			data = gamepad.data[gamepad.anonymous_port];
		} else {
			data = gamepad.data[gamepad.port];
		}
		if (data === undefined) {
			gamepad.connected = false;
			return 0;
		}

		if (button[0] !== 'D') {
			return data.buttons[gamepad.button_index_map[button]];
		} else {
			var value = data.axes[gamepad.axis_index_map[button]];
			if (button === gamepad.UP || button === gamepad.LEFT) {
				return value == -1 ? 1 : 0;
			} else if (button === gamepad.DOWN || button === gamepad.RIGHT) {
				return value == 1 ? 1 : 0;
			}
		}
		return 0;
	};

	gamepad.getAxis = function(axis) {
		if (!gamepad.connected || !gamepad.isValidAxis(axis)) {
			return 0;
		}

		var data = undefined;
		if (gamepad.port === gamepad.ANY_PORT) {
			data = gamepad.data[gamepad.anonymous_port];
		} else {
			data = gamepad.data[gamepad.port];
		}

		if (data === undefined) {
			gamepad.connected = false;
			return 0;
		}

		return data.axes[gamepad.axis_index_map[axis]];
	};

	gamepad.scheduleNextTick = function() {
		if (gamepad.ticking) {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(gamepad.tick);
			} else if (window.webkitRequestAnimationFrame) {
				window.webkitRequestAnimationFrame(gamepad.tick);
			}
		}
	};

	gamepad.tick = function() {
		if (gamepad.connected) {
			gamepad.gatherData();
		} else {
			gamepad.connect();
		}
		gamepad.scheduleNextTick();
	};
}

