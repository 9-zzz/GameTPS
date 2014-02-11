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
		var previous = new Object();
		var current = new Object();

		// STEP 2: Move the current value to previous value
		// NOTE: if this is the first time that this function is updating,
		// then the previous object will still have nothing in it
		for (var itemIndex in current) {
			previous[itemIndex] = current[itemIndex];
		}

		// STEPS 1 and 3: Record the current value
		current["RT"] = gamePad.getAxis(gamePad.RT);
		current["LT"] = gamePad.getAxis(gamePad.LT);
		current["LV"] = gamePad.getAxis(gamePad.LV);//leftStick output
		current["LH"] = gamePad.getAxis(gamePad.LH);
		current["RV"] = gamePad.getAxis(gamePad.RV);//rightStick output
		current["RH"] = gamePad.getAxis(gamePad.RH);
		current["RB"] = gamePad.getButton(gamePad.RB);//left-right-buttons
		current["LB"] = gamePad.getButton(gamePad.LB);

		if(current["LV"] > 0.3 || current["LV"] < -0.3)camera.position.z += LVval * 12;//Leftstick movement
		if(LHval > 0.3 || LHval < -0.3)camera.position.x += LHval * 12;

	if(RVval > 0.1 || RVval < -0.1)camera.rotation.x -= RVval*0.025;//Rightstick movement
	if(RHval > 0.1 || RHval < -0.1)camera.rotation.y -= RHval*0.025;






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
