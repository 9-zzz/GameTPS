/**
 * @author mrdoob / http://mrdoob.com/
 */


THREE.PointerLockControls = function ( camera ) {


//TIM PREVIOUS CONTROLLER STATE

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

	this.update = function ( delta , gamePad) {



	//gamePad.getButton(gamePad.START)

/*	if (gamePad.getButton(gamePad.A)){ velocity.y += 20;
	}else{
			velocity.y -=3;
	}
*/

	RTval = gamePad.getAxis(gamePad.RT);
	LTval = gamePad.getAxis(gamePad.LT);
	LVval = gamePad.getAxis(gamePad.LV);//leftStick output
	LHval = gamePad.getAxis(gamePad.LH);
	RVval = gamePad.getAxis(gamePad.RV);//rightStick output
	RHval = gamePad.getAxis(gamePad.RH);
	RB = gamePad.getButton(gamePad.RB);//left-right-buttons
	LB = gamePad.getButton(gamePad.LB);

	if(LVval > 0.3 || LVval < -0.3)camera.position.z += LVval * 12;//Leftstick movement
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
