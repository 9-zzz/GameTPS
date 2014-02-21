/**
 * @author mrdoob / http://mrdoob.com/
 */


THREE.PointerLockControls = function ( camera ) {

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
	var canJump = true;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var previous = {};
	var current = {};
	var y_enabled = true;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

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
				if ( canJump === true ) {
					velocity.y = 30;
					console.log("JUMP");
					canJump = false;
				} else {
					console.log("CANT JUMP");
				}
				console.log("SPACE");
				break;

		}

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
				console.log("SPACE OUT");
				//velocity.y = velocity.y/2;

				//canJump = false;
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
	
	this.disableYMovement = function() {
		y_enabled = false;
	};

	this.enableYMovement = function() {
		y_enabled = true;
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

	/* Goals of this function:
		1) Get the button events of the joystick and do something with it, such as update VELOCITY.
		2) Use the VELOCITY to update the POSITION.
		3) Reset everything and get ready for the next iteration of the update function.
	 */
	/* Specifications of Goals.<Step 1>:
		If the user presses A, then the avatar goes into jump mode, iff he is allowed.
		He is allowed iff he is not currently touching an object.
		For now, this means if he is not already jumping.
		He stops jumping when he touches a surface.
	 */
	this.update = function ( delta , gamePad ) {
		/* Event: When a the state of the input changes from one value to another.
		   Simulation of an Event:
			1) Record the <current value>.
			2) During the next iteration, move that <current value> to <previous value>.
			3) Record the new <current value>.
			4) If <current value> is not the same as <previous value> than an Event has occured.
		 */
		var buttons = ["LB", "RB", "A"];
		var axes = ["RV", "RH", "RT", "LV", "LH", "LT"];
		var buttonDown = {};
		var buttonUp = {};

		for (var buttonIndex in buttons) {
			var button = buttons[buttonIndex];
			previous[button] = current[button];
			current[button] = gamePad.getButton(gamePad[button]);
			buttonDown[button] = (previous[button] !== current[button]) && current[button] == 1;
			buttonUp[button] = (previous[button] !== current[button]) && current[button] == 0;
		}
		for (var axisIndex in axes) {
			var axis = axes[axisIndex];
			previous[axis] = current[axis];
			current[axis] = gamePad.getAxis(gamePad[axis]);
		}

		/* Filter: the filter is just an equation, where middle values are given more precedence
		   in comparison to lower extraneous values and (sometimes) higher extraneous values.
		   This is implemented in order to prevent movement which one does not want.
		 */
		var filterJoystick = function(s) {
			var dir = s < 0 ? -1 : 1;
			s = Math.abs(s);
			var x = Math.pow(10, 5 * s); // Logarithmic progression
			var s_sq = Math.pow(x, 2); // Corner behavior
			var y = (s_sq / 1000 + 1) / (s_sq / 10000000 + 1); // Signal application
			y = Math.log(y) / (Math.log(10) * 4); // Logarithmic application
			return y * dir;
		};

		/*	position:	x >		y ^		z .
			rotation: NORMAL TO ALL THE POSITION VECTORS
		 */
		if ( scope.enabled === false ) {
			return;
		}
		
		// rotate point of view
		pitchObject.rotation.x -= filterJoystick(current["RV"]) * 0.05;
		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
		yawObject.rotation.y -= filterJoystick(current["RH"]) * 0.05;
		// camera.rotation.z = oculusrift; //lol change this
		

		delta *= 0.05;


		// VELOCITY UPDATE
		var max_speed = 2.4;
		var LHMAP = filterJoystick(current["LH"]);
		var LVMAP = filterJoystick(current["LV"]);
		var absMax = function (x, y) {
			return (Math.abs(x) > Math.abs(y)) ? x : y;
		};

		velocity.z = absMax( (moveForward ? -max_speed : 0) + // forward
							 (moveBackward ? max_speed : 0), // backward
							 LVMAP * max_speed); // joystick

		velocity.x = absMax( (moveLeft ? -max_speed : 0) + // left
							 (moveRight ? max_speed : 0), // right
							 LHMAP * max_speed); // joystick

		// gravity
		velocity.y -= 0.4 * delta;
		// hit the floor or object
		if (isOnObject || yawObject.position.y < 15) {
			velocity.y = Math.max(0, velocity.y);
			canJump = true;
		}
		// This is the jump button mapping.
		if ( canJump && buttonDown["A"] ) {
			console.log("A");
			velocity.y = 30; // Impulse of the avatar
			canJump = false; // control the event access for jumping
		}

		// terminal velocity
		var terminalVelocity = 20;
		var velY = {};
		velY.dir = velocity.y < 0 ? -1 : 1;
		velY.mag = Math.abs(velocity.y);
		if (velY.mag > terminalVelocity && velY.dir == -1) {
			velY.mag = terminalVelocity;
		}
		velocity.y = velY.mag * velY.dir;


		// POSITION UPDATE
		yawObject.translateX( velocity.x * delta);
		if (y_enabled) {
			yawObject.translateY( velocity.y  * delta);
		}
		yawObject.translateZ( velocity.z * delta);

	};

};
