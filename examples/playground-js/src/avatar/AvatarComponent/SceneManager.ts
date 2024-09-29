// SceneManager.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export class SceneManager {
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.cameraClock = null;
        this.cameraEnd = new THREE.Vector3();
        this.controlsEnd = new THREE.Vector3();
        this.cameraStart = new THREE.Vector3();
        this.controlsStart = new THREE.Vector3();

        this.setupRenderer();
        this.setupCamera();
        this.setupScene();
        this.setupLights();
        this.setupControls();

        this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
        this.resizeObserver.observe(this.container);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(this.options.modelPixelRatio * window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.shadowMap.enabled = false;
        this.container.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(10, this.container.clientWidth / this.container.clientHeight, 0.1, 2000);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();
        this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    }

    setupLights() {
        this.lightAmbient = new THREE.AmbientLight(
            new THREE.Color(this.options.lightAmbientColor),
            this.options.lightAmbientIntensity
        );
        this.lightDirect = new THREE.DirectionalLight(
            new THREE.Color(this.options.lightDirectColor),
            this.options.lightDirectIntensity
        );
        this.lightSpot = new THREE.SpotLight(
            new THREE.Color(this.options.lightSpotColor),
            this.options.lightSpotIntensity,
            0,
            this.options.lightSpotDispersion
        );
        
        this.setLighting();

        // done in showAvatar
        this.scene.add(this.lightAmbient);
        this.scene.add(this.lightDirect);
        this.scene.add(this.lightSpot);
    }


    /**
     * Change light colors and intensities.
     */
    setLighting() {
        opt = this.options || {};

        // Ambient light
        if ( opt.hasOwnProperty("lightAmbientColor") ) {
        this.lightAmbient.color.set( new THREE.Color( opt.lightAmbientColor ) );
        }
        if ( opt.hasOwnProperty("lightAmbientIntensity") ) {
        this.lightAmbient.intensity = opt.lightAmbientIntensity;
        this.lightAmbient.visible = (opt.lightAmbientIntensity !== 0);
        }

        // Directional light
        if ( opt.hasOwnProperty("lightDirectColor") ) {
        this.lightDirect.color.set( new THREE.Color( opt.lightDirectColor ) );
        }
        if ( opt.hasOwnProperty("lightDirectIntensity") ) {
        this.lightDirect.intensity = opt.lightDirectIntensity;
        this.lightDirect.visible = (opt.lightDirectIntensity !== 0);
        }
        if ( opt.hasOwnProperty("lightDirectPhi") && opt.hasOwnProperty("lightDirectTheta") ) {
        this.lightDirect.position.setFromSphericalCoords(2, opt.lightDirectPhi, opt.lightDirectTheta);
        }

        // Spot light
        if ( opt.hasOwnProperty("lightSpotColor") ) {
        this.lightSpot.color.set( new THREE.Color( opt.lightSpotColor ) );
        }
        if ( opt.hasOwnProperty("lightSpotIntensity") ) {
        this.lightSpot.intensity = opt.lightSpotIntensity;
        this.lightSpot.visible = (opt.lightSpotIntensity !== 0);
        }
        if ( opt.hasOwnProperty("lightSpotPhi") && opt.hasOwnProperty("lightSpotTheta") ) {
        this.lightSpot.position.setFromSphericalCoords( 2, opt.lightSpotPhi, opt.lightSpotTheta );
        this.lightSpot.position.add( new THREE.Vector3(0,1.5,0) );
        }
        if ( opt.hasOwnProperty("lightSpotDispersion") ) {
        this.lightSpot.angle = opt.lightSpotDispersion;
        }
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = this.options.cameraZoomEnable;
        this.controls.enableRotate = this.options.cameraRotateEnable;
        this.controls.enablePan = this.options.cameraPanEnable;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 2000;
        this.controls.autoRotateSpeed = 0;
        this.controls.autoRotate = false;
        this.controls.update();
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.controls.update();
        this.render();
    }

  /**
  * Fit 3D object to the view.
  * @param {string} [view=null] Camera view. If null, reset current view
  * @param {Object} [opt=null] Options
  */
  setView(view, opt = null) {
    // IMP: console.log(`setView function called at ${new Date().toISOString()}`);
    if ( view !== 'full' && view !== 'upper' && view !== 'head' && view !== 'mid' ) return;
    if ( !this.armature ) {
      this.options.cameraView = view;
      return;
    }

    this.viewName = view || this.viewName;
    opt = opt || {};

    const fov = this.camera.fov * ( Math.PI / 180 );
    let x = - (opt.cameraX || this.opt.cameraX) * Math.tan( fov / 2 );
    let y = ( 1 - (opt.cameraY || this.opt.cameraY)) * Math.tan( fov / 2 );
    let z = (opt.cameraDistance || this.opt.cameraDistance);
    if ( this.viewName === 'head' ) {
      z += 2;
      y = y * z + 4 * this.avatarHeight / 5;
    } else if ( this.viewName === 'upper' ) {
      z += 4.5;
      y = y * z + 2 * this.avatarHeight / 3;
    } else if ( this.viewName === 'mid' ) {
      z += 8;
      y = y * z + this.avatarHeight / 3;
    } else {
      z += 12;
      y = y * z;
    }
    x = x * z;

    this.controlsEnd = new THREE.Vector3(x, y, 0);
    this.cameraEnd = new THREE.Vector3(x, y, z).applyEuler( new THREE.Euler( (opt.cameraRotateX || opt.cameraRotateX), (opt.cameraRotateY || this.opt.cameraRotateY), 0 ) );

    if ( this.cameraClock === null ) {
      this.controls.target.copy( this.controlsEnd );
      this.camera.position.copy( this.cameraEnd );
    }
    this.controlsStart = this.controls.target.clone();
    this.cameraStart = this.camera.position.clone();
    this.cameraClock = 0;
  }

  updateCamera(dt, easing) {
    if ( this.cameraClock !== null && this.cameraClock < 1000 ) {
      this.cameraClock += dt;
      if ( this.cameraClock > 1000 ) this.cameraClock = 1000;
      let s = new THREE.Spherical().setFromVector3(this.cameraStart);
      let sEnd = new THREE.Spherical().setFromVector3(this.cameraEnd);
      s.phi += easing(this.cameraClock / 1000) * (sEnd.phi - s.phi);
      s.theta += easing(this.cameraClock / 1000) * (sEnd.theta - s.theta);
      s.radius += easing(this.cameraClock / 1000) * (sEnd.radius - s.radius);
      s.makeSafe();
      this.camera.position.setFromSpherical( s );
      if ( this.controlsStart.x !== this.controlsEnd.x ) {
        this.controls.target.copy( this.controlsStart.lerp( this.controlsEnd, easing(this.cameraClock / 1000) ) );
      } else {
        s.setFromVector3(this.controlsStart);
        sEnd.setFromVector3(this.controlsEnd);
        s.phi += easing(this.cameraClock / 1000) * (sEnd.phi - s.phi);
        s.theta += easing(this.cameraClock / 1000) * (sEnd.theta - s.theta);
        s.radius += easing(this.cameraClock / 1000) * (sEnd.radius - s.radius);
        s.makeSafe();
        this.controls.target.setFromSpherical( s );
      }
      this.controls.update();
    }

    // Autorotate
    if ( this.controls.autoRotate ) this.controls.update();
  }
  setArmature(armature) {
    this.armature = armature;
}

lookAt(x, y, t, currentHeadRotation) {
    // Eyes position
    const rect = this.container.getBoundingClientRect();
    const lEye = this.armature.getObjectByName('LeftEye');
    const rEye = this.armature.getObjectByName('RightEye');
    lEye.updateMatrixWorld(true);
    rEye.updateMatrixWorld(true);
    const plEye = new THREE.Vector3().setFromMatrixPosition(lEye.matrixWorld);
    const prEye = new THREE.Vector3().setFromMatrixPosition(rEye.matrixWorld);
    const pEyes = new THREE.Vector3().addVectors(plEye, prEye).divideScalar(2);
    pEyes.project(this.camera);
    let eyesx = (pEyes.x + 1) / 2 * rect.width + rect.left;
    let eyesy = -(pEyes.y - 1) / 2 * rect.height + rect.top;

    // if coordinate not specified, look at the camera
    if (x === null) x = eyesx;
    if (y === null) y = eyesy;

    let rx = currentHeadRotation.x / (40/24); // Refer to setValue(headRotateX)
    let ry = currentHeadRotation.y / (9/4); // Refer to setValue(headRotateY)
    let camerarx = Math.min(0.4, Math.max(-0.4,this.camera.rotation.x));
    let camerary = Math.min(0.4, Math.max(-0.4,this.camera.rotation.y));

    // Calculate new delta
    let maxx = Math.max(window.innerWidth - eyesx, eyesx);
    let maxy = Math.max(window.innerHeight - eyesy, eyesy);
    let rotx = this.convertRange(y, [eyesy - maxy, eyesy + maxy], [-0.3, 0.6]) - rx + camerarx;
    let roty = this.convertRange(x, [eyesx - maxx, eyesx + maxx], [-0.8, 0.8]) - ry + camerary;
    rotx = Math.min(0.6, Math.max(-0.3, rotx));
    roty = Math.min(0.8, Math.max(-0.8, roty));

    // Randomize head/eyes ratio
    let drotx = (Math.random() - 0.5) / 4;
    let droty = (Math.random() - 0.5) / 4;

    return {
        headRotateX: rotx + drotx,
        headRotateY: roty + droty,
        eyesRotateX: -3 * drotx + 0.1,
        eyesRotateY: -5 * droty,
        duration: t
    };
}

lookAtCamera(t) {
    return this.lookAt(null, null, t);
}



    /**
     * Set autorotate.
     * @param {numeric} speed Autorotate speed, e.g. value 2 = 30 secs per orbit at 60fps.
     */
    setAutoRotateSpeed(speed) {
        this.controls.autoRotateSpeed = speed;
        this.controls.autoRotate = (speed > 0);
    }


    render() {
        this.renderer.render(this.scene, this.camera);
    }
    // Add methods for camera movement, etc.
}