//@author mrdoob / http://mrdoob.com/ Modified heavily by me Shahan

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


//########################################################

THREE.PointerLockControls = function ( camera ) {

	var gamePad = new Gamepad();
	gamePad.connect();
	var RB = gamePad.getButton(gamePad.RB);

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

        if(gamePad.getButton(gamePad.A)==1){
		if ( canJump === true ) velocity.y += 20;//three equals signs?
				canJump = false;
	}else{
		velocity.y = velocity.y/2;
		canJump = false;
	}




	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += 20;//three equals signs?
				canJump = false;
				break;

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

			case 32: // space
				velocity.y = velocity.y/2;
				canJump = false;
				break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.isOnObject = function ( boolean ) {

		isOnObject = boolean;
		canJump = boolean;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		}

	}();

	this.update = function ( delta ) {

		if ( scope.enabled === false ) return;

		//delta *= 0.1;
		delta *= 0.05;

		velocity.x += ( - velocity.x ) * 0.08 * delta;
		velocity.z += ( - velocity.z ) * 0.08 * delta;

		//velocity.y -= (0.25 * delta)*0.05;
		velocity.y -= 0.25 * delta;

                //default is velocity = 0.12
		if ( moveForward ) velocity.z -= 0.4 * delta;
		if ( moveBackward ) velocity.z += 0.4 * delta;

		if ( moveLeft ) velocity.x -= 0.4 * delta;
		if ( moveRight ) velocity.x += 0.4 * delta;

		if ( isOnObject === true ) {

			velocity.y = Math.max( 0, velocity.y );

		}

		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );

		if ( yawObject.position.y < 10 ) {

			velocity.y = 0;
			yawObject.position.y = 10;

			canJump = true;

		}

	};

};
