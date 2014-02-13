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
	var canJump = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var updatePrevious = {};
	var updateCurrent = {};

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
				if ( canJump === true ) velocity.y += 30;//three equals signs?

				canJump = false;
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
		var previous = scope.updatePrevious;
		var current = scope.updateCurrent;
		var buttons = ["LB", "RB"];
		var axes = ["RV", "RH", "RT", "LV", "LH", "LT"];
		var events = {};

		for (var buttonIndex in buttons) {
			var button = buttons[buttonIndex];
			previous[button] = current[button];
			current[button] = gamepad.getButton(gamepad[button]);
			events[button] = (previous[button] !== current[button]);
		}
		for (var axisIndex in axes) {
			var axis = axes[axisIndex];
			previous[axis] = current[axis];
			current[axis] = gamepad.getAxis(gamepad[axis]);
		}

		/* Filter: the filter is just an equation, where middle values are given more precedence
		   in comparison to lower extraneous values and (sometimes) higher extraneous values.
		   This is implemented in order to prevent movement which one does not want.
		 */
		var filterJoystick = function(s) {
			var x = Math.pow(10, 5 * s); // Logarithmic progression
			var s_sq = Math.pow(x, 2); // Corner behavior
			var y = (s_sq / 1000 + 1) / (s_sq / 10000000 + 1); // Signal application
			y = Math.log(y) / (Math.log(10) * 4); // Logarithmic application
			return y;
		};

		/* Map Camera:
			The camera can be adjusted on the following axes:
			position:
				x >					<< LH
				y ^
				z .					<< LV
			rotation: NORMAL TO ALL THE POSITION VECTORS
				x > N				<< RV
				y ^ N				<< RH
				z . N
		 */
		if ( scope.enabled === false ) {
			return;
		}
		camera.position.x += filterJoystick(current["LH"]) * 12;
		camera.position.z += filterJoystick(current["LV"]) * 12;
		camera.rotation.x -= filterJoystick(current["RV"]) * 0.025;
		camera.rotation.y -= filterJoystick(current["RH"]) * 0.025;

		/*
			Note: velocity is change in position apparently
		 */

		 var absMax = function (x, y) {
		 	return (Math.abs(x) > Math.abs(y)) ? x : y;
		 }

		// TIME UPDATE
		delta *= 0.05;

		// VELOCITY UPDATE
		//velocity.x += ( - velocity.x ) * 0.08 * delta;
		//velocity.z += ( - velocity.z ) * 0.08 * delta;
		//velocity.y -= (0.25 * delta)*0.05;

		// This is the acceleration vector due to gravity.
		velocity.y -= 0.25 * delta;

                //default is velocity = 0.12
		velocity.z += absMax((moveForward ? -0.4 * delta : 0) +
							 (moveBackward ? 0.4 * delta : 0),
							0.4 * delta * filterJoystick(current["LV"]));

		velocity.x += absMax((moveLeft ? -0.4 * delta : 0) +
							 (moveRight ? 0.4 * delta : 0),
							0.4 * delta * filterJoystick(current["LH"]));

		if ( isOnObject === true ) {
			velocity.y = Math.max( 0, velocity.y );
		}

		if ( yawObject.position.y < 10 ) {

			velocity.y = 0;
			yawObject.position.y = 10;

			scope.canJump = true;

		}

		// This is the jump button mapping.
		if ( scope.canJump && events["A"] && current["A"] ) {
			velocity.y = 100; // Impulse of the avatar
			scope.canJump = false; // control the event access for jumping
		}

		// POSITION UPDATE
		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );

		// Reset and get ready for next iteration
		scope.updatePrevious = previous;
		scope.updateCurrent = current;

	};

};
