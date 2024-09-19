import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import Stats from 'three/examples/jsm/libs/stats.module';


  type TalkingHeadOptions = {
    ttsEndpoint: string | null;
    ttsApikey: string | null;
    ttsTrimStart: number;
    ttsTrimEnd: number;
    ttsLang;
    ttsVoice: string;
    ttsRate: number;
    ttsPitch: number;
    ttsVolume: number;
    mixerGainSpeech: number | null;
    mixerGainBackground: number | null;
    lipsyncLang: string;
    lipsyncModules: string[];
    pcmSampleRate: number;
    modelRoot: string;
    modelPixelRatio: number;
    modelFPS: number;
    modelMovementFactor: number;
    cameraView: string;
    cameraDistance: number;
    cameraX: number;
    cameraY: number;
    cameraRotateX: number;
    cameraRotateY: number;
    cameraRotateEnable: boolean;
    cameraPanEnable: boolean;
    cameraZoomEnable: boolean;
    lightAmbientColor: number;
    lightAmbientIntensity: number;
    lightDirectColor: number;
    lightDirectIntensity: number;
    lightDirectPhi: number;
    lightDirectTheta: number;
    lightSpotIntensity: number;
    lightSpotColor: number;
    lightSpotPhi: number;
    lightSpotTheta: number;
    lightSpotDispersion: number;
    avatarMood: string;
    avatarMute: boolean;
    markedOptions: { mangle: boolean; headerIds: boolean; breaks: boolean };
    statsNode: HTMLElement | null;
    statsStyle: string | null;
  };

/**
* @class Talking Head
* @author Mika Suominen
*/
class TalkingHead {

  private nodeAvatar: HTMLDivElement;
  private opt: TalkingHeadOptions;
  private stats: Stats

  private poseTemplates: any
  private gestureTemplates: any
  private poseDelta: any
  private poseName: any
  private posePropNames: any

  private poseWeightOnLeft: any // Initial weight on left leg
  private gesture: any // Values that override pose properties
  private poseCurrentTemplate: any
  private poseBase: any
  private poseTarget: any
  private poseStraight: any
  private poseAvatar: any

  private avatarHeight: any
  private animMoods: any

  /**
  * Avatar.
  * @typedef {Object} Avatar
  * @property {string} url URL for the GLB file
  * @property {string} [body] Body form 'M' or 'F'
  * @property {string} [lipsyncLang] Lip-sync language, e.g. 'fi', 'en'
  * @property {string} [ttsLang] Text-to-speech language, e.g. "fi-FI"
  * @property {voice} [ttsVoice] Voice name.
  * @property {numeric} [ttsRate] Voice rate.
  * @property {numeric} [ttsPitch] Voice pitch.
  * @property {numeric} [ttsVolume] Voice volume.
  * @property {string} [avatarMood] Initial mood.
  * @property {boolean} [avatarMute] If true, muted.
  */

  /**
  * Loading progress.
  * @callback progressfn
  * @param {string} url URL of the resource
  * @param {Object} event Progress event
  * @param {boolean} event.lengthComputable If false, total is not known
  * @param {number} event.loaded Number of loaded items
  * @param {number} event.total Number of total items
  */

  /**
  * Callback when new subtitles have been written to the DOM node.
  * @callback subtitlesfn
  * @param {Object} node DOM node
  */

  /**
  * Callback when the speech queue processes this marker item.
  * @callback markerfn
  */

  /**
  * Audio object.
  * @typedef {Object} Audio
  * @property {ArrayBuffer|ArrayBuffer[]} audio Audio buffer or array of buffers
  * @property {string[]} words Words
  * @property {number[]} wtimes Starting times of words
  * @property {number[]} wdurations Durations of words
  * @property {string[]} [visemes] Oculus lip-sync viseme IDs
  * @property {number[]} [vtimes] Starting times of visemes
  * @property {number[]} [vdurations] Durations of visemes
  * @property {string[]} [markers] Timed callback functions
  * @property {number[]} [mtimes] Starting times of markers
  */

  /**
  * Lip-sync object.
  * @typedef {Object} Lipsync
  * @property {string[]} visemes Oculus lip-sync visemes
  * @property {number[]} times Starting times in relative units
  * @property {number[]} durations Durations in relative units
  */

  /**
  * @constructor
  * @param {Object} node DOM element of the avatar
  * @param {Object} [opt=null] Global/default options
  */
  constructor(node: HTMLDivElement, opt: Partial<TalkingHeadOptions> | null = null) {
    this.nodeAvatar = node;
    this.opt = {
      ttsEndpoint: null,
      ttsApikey: null,
      ttsTrimStart: 0,
      ttsTrimEnd: 400,
      ttsLang: "fi-FI",
      ttsVoice: "fi-FI-Standard-A",
      ttsRate: 1,
      ttsPitch: 0,
      ttsVolume: 0,
      mixerGainSpeech: null,
      mixerGainBackground: null,
      lipsyncLang: 'fi',
      lipsyncModules: ['fi','en','lt'],
      pcmSampleRate: 22050,
      modelRoot: "Armature",
      modelPixelRatio: 1,
      modelFPS: 30,
      modelMovementFactor: 1,
      cameraView: 'full',
      cameraDistance: 0,
      cameraX: 0,
      cameraY: 0,
      cameraRotateX: 0,
      cameraRotateY: 0,
      cameraRotateEnable: true,
      cameraPanEnable: false,
      cameraZoomEnable: false,
      lightAmbientColor: 0xffffff,
      lightAmbientIntensity: 2,
      lightDirectColor: 0x8888aa,
      lightDirectIntensity: 30,
      lightDirectPhi: 1,
      lightDirectTheta: 2,
      lightSpotIntensity: 0,
      lightSpotColor: 0x3388ff,
      lightSpotPhi: 0.1,
      lightSpotTheta: 4,
      lightSpotDispersion: 1,
      avatarMood: "neutral",
      avatarMute: false,
      markedOptions: { mangle: false, headerIds: false, breaks: true },
      statsNode: null,
      statsStyle: null
    } as TalkingHeadOptions;
    Object.assign(this.opt, opt || {});

    // Statistics
    if ( this.opt.statsNode ) {
      this.stats = new Stats();
      if ( this.opt.statsStyle ) {
        this.stats.dom.style.cssText = this.opt.statsStyle;
      }
      this.opt.statsNode.appendChild( this.stats.dom );
    }

    // Pose templates
    // NOTE: The body weight on each pose should be on left foot
    // for most natural result.
    this.poseTemplates = {
      'side': {
        standing: true,
        props: {
          'Hips.position':{x:0, y:1, z:0}, 'Hips.rotation':{x:-0.003, y:-0.017, z:0.1}, 'Spine.rotation':{x:-0.103, y:-0.002, z:-0.063}, 'Spine1.rotation':{x:0.042, y:-0.02, z:-0.069}, 'Spine2.rotation':{x:0.131, y:-0.012, z:-0.065}, 'Neck.rotation':{x:0.027, y:0.006, z:0}, 'Head.rotation':{x:0.077, y:-0.065, z:0}, 'LeftShoulder.rotation':{x:1.599, y:0.084, z:-1.77}, 'LeftArm.rotation':{x:1.364, y:0.052, z:-0.044}, 'LeftForeArm.rotation':{x:0.002, y:-0.007, z:0.331}, 'LeftHand.rotation':{x:0.104, y:-0.067, z:-0.174}, 'LeftHandThumb1.rotation':{x:0.231, y:0.258, z:0.355}, 'LeftHandThumb2.rotation':{x:-0.106, y:-0.339, z:-0.454}, 'LeftHandThumb3.rotation':{x:-0.02, y:-0.142, z:-0.004}, 'LeftHandIndex1.rotation':{x:0.148, y:0.032, z:-0.069}, 'LeftHandIndex2.rotation':{x:0.326, y:-0.049, z:-0.029}, 'LeftHandIndex3.rotation':{x:0.247, y:-0.053, z:-0.073}, 'LeftHandMiddle1.rotation':{x:0.238, y:-0.057, z:-0.089}, 'LeftHandMiddle2.rotation':{x:0.469, y:-0.036, z:-0.081}, 'LeftHandMiddle3.rotation':{x:0.206, y:-0.015, z:-0.017}, 'LeftHandRing1.rotation':{x:0.187, y:-0.118, z:-0.157}, 'LeftHandRing2.rotation':{x:0.579, y:0.02, z:-0.097}, 'LeftHandRing3.rotation':{x:0.272, y:0.021, z:-0.063}, 'LeftHandPinky1.rotation':{x:0.405, y:-0.182, z:-0.138}, 'LeftHandPinky2.rotation':{x:0.613, y:0.128, z:-0.144}, 'LeftHandPinky3.rotation':{x:0.268, y:0.094, z:-0.081}, 'RightShoulder.rotation':{x:1.541, y:0.192, z:1.775}, 'RightArm.rotation':{x:1.273, y:-0.352, z:-0.067}, 'RightForeArm.rotation':{x:-0.011, y:-0.031, z:-0.357}, 'RightHand.rotation':{x:-0.008, y:0.312, z:-0.028}, 'RightHandThumb1.rotation':{x:0.23, y:-0.258, z:-0.355}, 'RightHandThumb2.rotation':{x:-0.107, y:0.339, z:0.454}, 'RightHandThumb3.rotation':{x:-0.02, y:0.142, z:0.004}, 'RightHandIndex1.rotation':{x:0.148, y:-0.031, z:0.069}, 'RightHandIndex2.rotation':{x:0.326, y:0.049, z:0.029}, 'RightHandIndex3.rotation':{x:0.247, y:0.053, z:0.073}, 'RightHandMiddle1.rotation':{x:0.237, y:0.057, z:0.089}, 'RightHandMiddle2.rotation':{x:0.469, y:0.036, z:0.081}, 'RightHandMiddle3.rotation':{x:0.206, y:0.015, z:0.017}, 'RightHandRing1.rotation':{x:0.204, y:0.086, z:0.135}, 'RightHandRing2.rotation':{x:0.579, y:-0.02, z:0.098}, 'RightHandRing3.rotation':{x:0.272, y:-0.021, z:0.063}, 'RightHandPinky1.rotation':{x:0.404, y:0.182, z:0.137}, 'RightHandPinky2.rotation':{x:0.613, y:-0.128, z:0.144}, 'RightHandPinky3.rotation':{x:0.268, y:-0.094, z:0.081}, 'LeftUpLeg.rotation':{x:0.096, y:0.209, z:2.983}, 'LeftLeg.rotation':{x:-0.053, y:0.042, z:-0.017}, 'LeftFoot.rotation':{x:1.091, y:0.15, z:0.026}, 'LeftToeBase.rotation':{x:0.469, y:-0.07, z:-0.015}, 'RightUpLeg.rotation':{x:-0.307, y:-0.219, z:2.912}, 'RightLeg.rotation':{x:-0.359, y:0.164, z:0.015}, 'RightFoot.rotation':{x:1.035, y:0.11, z:0.005}, 'RightToeBase.rotation':{x:0.467, y:0.07, z:0.015}
        }
      },

      'hip':{
        standing: true,
        props: {
          'Hips.position':{x:0,y:1,z:0}, 'Hips.rotation':{x:-0.036,y:0.09,z:0.135}, 'Spine.rotation':{x:0.076,y:-0.035,z:0.01}, 'Spine1.rotation':{x:-0.096,y:0.013,z:-0.094}, 'Spine2.rotation':{x:-0.014,y:0.002,z:-0.097}, 'Neck.rotation':{x:0.034,y:-0.051,z:-0.075}, 'Head.rotation':{x:0.298,y:-0.1,z:0.154}, 'LeftShoulder.rotation':{x:1.694,y:0.011,z:-1.68}, 'LeftArm.rotation':{x:1.343,y:0.177,z:-0.153}, 'LeftForeArm.rotation':{x:-0.049,y:0.134,z:0.351}, 'LeftHand.rotation':{x:0.057,y:-0.189,z:-0.026}, 'LeftHandThumb1.rotation':{x:0.368,y:-0.066,z:0.438}, 'LeftHandThumb2.rotation':{x:-0.156,y:0.029,z:-0.369}, 'LeftHandThumb3.rotation':{x:0.034,y:-0.009,z:0.016}, 'LeftHandIndex1.rotation':{x:0.157,y:-0.002,z:-0.171}, 'LeftHandIndex2.rotation':{x:0.099,y:0,z:0}, 'LeftHandIndex3.rotation':{x:0.1,y:0,z:0}, 'LeftHandMiddle1.rotation':{x:0.222,y:-0.019,z:-0.16}, 'LeftHandMiddle2.rotation':{x:0.142,y:0,z:0}, 'LeftHandMiddle3.rotation':{x:0.141,y:0,z:0}, 'LeftHandRing1.rotation':{x:0.333,y:-0.039,z:-0.174}, 'LeftHandRing2.rotation':{x:0.214,y:0,z:0}, 'LeftHandRing3.rotation':{x:0.213,y:0,z:0}, 'LeftHandPinky1.rotation':{x:0.483,y:-0.069,z:-0.189}, 'LeftHandPinky2.rotation':{x:0.312,y:0,z:0}, 'LeftHandPinky3.rotation':{x:0.309,y:0,z:0}, 'RightShoulder.rotation':{x:1.597,y:0.012,z:1.816}, 'RightArm.rotation':{x:0.618,y:-1.274,z:-0.266}, 'RightForeArm.rotation':{x:-0.395,y:-0.097,z:-1.342}, 'RightHand.rotation':{x:-0.816,y:-0.057,z:-0.976}, 'RightHandThumb1.rotation':{x:0.42,y:0.23,z:-1.172}, 'RightHandThumb2.rotation':{x:-0.027,y:0.361,z:0.122}, 'RightHandThumb3.rotation':{x:0.076,y:0.125,z:-0.371}, 'RightHandIndex1.rotation':{x:-0.158,y:-0.045,z:0.033}, 'RightHandIndex2.rotation':{x:0.391,y:0.051,z:0.025}, 'RightHandIndex3.rotation':{x:0.317,y:0.058,z:0.07}, 'RightHandMiddle1.rotation':{x:0.486,y:0.066,z:0.014}, 'RightHandMiddle2.rotation':{x:0.718,y:0.055,z:0.07}, 'RightHandMiddle3.rotation':{x:0.453,y:0.019,z:0.013}, 'RightHandRing1.rotation':{x:0.591,y:0.241,z:0.11}, 'RightHandRing2.rotation':{x:1.014,y:0.023,z:0.097}, 'RightHandRing3.rotation':{x:0.708,y:0.008,z:0.066}, 'RightHandPinky1.rotation':{x:1.02,y:0.305,z:0.051}, 'RightHandPinky2.rotation':{x:1.187,y:-0.028,z:0.191}, 'RightHandPinky3.rotation':{x:0.872,y:-0.031,z:0.121}, 'LeftUpLeg.rotation':{x:-0.095,y:-0.058,z:-3.338}, 'LeftLeg.rotation':{x:-0.366,y:0.287,z:-0.021}, 'LeftFoot.rotation':{x:1.131,y:0.21,z:0.176}, 'LeftToeBase.rotation':{x:0.739,y:-0.068,z:-0.001}, 'RightUpLeg.rotation':{x:-0.502,y:0.362,z:3.153}, 'RightLeg.rotation':{x:-1.002,y:0.109,z:0.008}, 'RightFoot.rotation':{x:0.626,y:-0.097,z:-0.194}, 'RightToeBase.rotation':{x:1.33,y:0.288,z:-0.078}
        }
      },

      'turn':{
        standing: true,
        props: {
          'Hips.position':{x:0,y:1,z:0}, 'Hips.rotation':{x:-0.07,y:-0.604,z:-0.004}, 'Spine.rotation':{x:-0.007,y:0.003,z:0.071}, 'Spine1.rotation':{x:-0.053,y:0.024,z:-0.06}, 'Spine2.rotation':{x:0.074,y:0.013,z:-0.068}, 'Neck.rotation':{x:0.03,y:0.186,z:-0.077}, 'Head.rotation':{x:0.045,y:0.243,z:-0.086}, 'LeftShoulder.rotation':{x:1.717,y:-0.085,z:-1.761}, 'LeftArm.rotation':{x:1.314,y:0.07,z:-0.057}, 'LeftForeArm.rotation':{x:-0.151,y:0.714,z:0.302}, 'LeftHand.rotation':{x:-0.069,y:0.003,z:-0.118}, 'LeftHandThumb1.rotation':{x:0.23,y:0.258,z:0.354}, 'LeftHandThumb2.rotation':{x:-0.107,y:-0.338,z:-0.455}, 'LeftHandThumb3.rotation':{x:-0.015,y:-0.142,z:0.002}, 'LeftHandIndex1.rotation':{x:0.145,y:0.032,z:-0.069}, 'LeftHandIndex2.rotation':{x:0.323,y:-0.049,z:-0.028}, 'LeftHandIndex3.rotation':{x:0.249,y:-0.053,z:-0.074}, 'LeftHandMiddle1.rotation':{x:0.235,y:-0.057,z:-0.088}, 'LeftHandMiddle2.rotation':{x:0.468,y:-0.036,z:-0.081}, 'LeftHandMiddle3.rotation':{x:0.203,y:-0.015,z:-0.017}, 'LeftHandRing1.rotation':{x:0.185,y:-0.118,z:-0.157}, 'LeftHandRing2.rotation':{x:0.578,y:0.02,z:-0.097}, 'LeftHandRing3.rotation':{x:0.27,y:0.021,z:-0.063}, 'LeftHandPinky1.rotation':{x:0.404,y:-0.182,z:-0.138}, 'LeftHandPinky2.rotation':{x:0.612,y:0.128,z:-0.144}, 'LeftHandPinky3.rotation':{x:0.267,y:0.094,z:-0.081}, 'RightShoulder.rotation':{x:1.605,y:0.17,z:1.625}, 'RightArm.rotation':{x:1.574,y:-0.655,z:0.388}, 'RightForeArm.rotation':{x:-0.36,y:-0.849,z:-0.465}, 'RightHand.rotation':{x:0.114,y:0.416,z:-0.069}, 'RightHandThumb1.rotation':{x:0.486,y:0.009,z:-0.492}, 'RightHandThumb2.rotation':{x:-0.073,y:-0.01,z:0.284}, 'RightHandThumb3.rotation':{x:-0.054,y:-0.006,z:0.209}, 'RightHandIndex1.rotation':{x:0.245,y:-0.014,z:0.052}, 'RightHandIndex2.rotation':{x:0.155,y:0,z:0}, 'RightHandIndex3.rotation':{x:0.153,y:0,z:0}, 'RightHandMiddle1.rotation':{x:0.238,y:0.004,z:0.028}, 'RightHandMiddle2.rotation':{x:0.15,y:0,z:0}, 'RightHandMiddle3.rotation':{x:0.149,y:0,z:0}, 'RightHandRing1.rotation':{x:0.267,y:0.012,z:0.007}, 'RightHandRing2.rotation':{x:0.169,y:0,z:0}, 'RightHandRing3.rotation':{x:0.167,y:0,z:0}, 'RightHandPinky1.rotation':{x:0.304,y:0.018,z:-0.021}, 'RightHandPinky2.rotation':{x:0.192,y:0,z:0}, 'RightHandPinky3.rotation':{x:0.19,y:0,z:0}, 'LeftUpLeg.rotation':{x:-0.001,y:-0.058,z:-3.238}, 'LeftLeg.rotation':{x:-0.29,y:0.058,z:-0.021}, 'LeftFoot.rotation':{x:1.288,y:0.168,z:0.183}, 'LeftToeBase.rotation':{x:0.363,y:-0.09,z:-0.01}, 'RightUpLeg.rotation':{x:-0.100,y:0.36,z:3.062}, 'RightLeg.rotation':{x:-0.67,y:-0.304,z:0.043}, 'RightFoot.rotation':{x:1.195,y:-0.159,z:-0.294}, 'RightToeBase.rotation':{x:0.737,y:0.164,z:-0.002}
        }
      },

      'bend':{
        bend: true, standing: true,
        props: {
          'Hips.position':{x:-0.007, y:0.943, z:-0.001}, 'Hips.rotation':{x:1.488, y:-0.633, z:1.435}, 'Spine.rotation':{x:-0.126, y:0.007, z:-0.057}, 'Spine1.rotation':{x:-0.134, y:0.009, z:0.01}, 'Spine2.rotation':{x:-0.019, y:0, z:-0.002}, 'Neck.rotation':{x:-0.159, y:0.572, z:-0.108}, 'Head.rotation':{x:-0.064, y:0.716, z:-0.257}, 'RightShoulder.rotation':{x:1.625, y:-0.043, z:1.382}, 'RightArm.rotation':{x:0.746, y:-0.96, z:-1.009}, 'RightForeArm.rotation':{x:-0.199, y:-0.528, z:-0.38}, 'RightHand.rotation':{x:-0.261, y:-0.043, z:-0.027}, 'RightHandThumb1.rotation':{x:0.172, y:-0.138, z:-0.445}, 'RightHandThumb2.rotation':{x:-0.158, y:0.327, z:0.545}, 'RightHandThumb3.rotation':{x:-0.062, y:0.138, z:0.152}, 'RightHandIndex1.rotation':{x:0.328, y:-0.005, z:0.132}, 'RightHandIndex2.rotation':{x:0.303, y:0.049, z:0.028}, 'RightHandIndex3.rotation':{x:0.241, y:0.046, z:0.077}, 'RightHandMiddle1.rotation':{x:0.309, y:0.074, z:0.089}, 'RightHandMiddle2.rotation':{x:0.392, y:0.036, z:0.081}, 'RightHandMiddle3.rotation':{x:0.199, y:0.014, z:0.019}, 'RightHandRing1.rotation':{x:0.239, y:0.143, z:0.091}, 'RightHandRing2.rotation':{x:0.275, y:-0.02, z:0.097}, 'RightHandRing3.rotation':{x:0.248, y:-0.023, z:0.061}, 'RightHandPinky1.rotation':{x:0.211, y:0.154, z:0.029}, 'RightHandPinky2.rotation':{x:0.348, y:-0.128, z:0.144}, 'RightHandPinky3.rotation':{x:0.21, y:-0.091, z:0.065}, 'LeftShoulder.rotation':{x:1.626, y:-0.027, z:-1.367}, 'LeftArm.rotation':{x:1.048, y:0.737, z:0.712}, 'LeftForeArm.rotation':{x:-0.508, y:0.879, z:0.625}, 'LeftHand.rotation':{x:0.06, y:-0.243, z:-0.079}, 'LeftHandThumb1.rotation':{x:0.187, y:-0.072, z:0.346}, 'LeftHandThumb2.rotation':{x:-0.066, y:0.008, z:-0.256}, 'LeftHandThumb3.rotation':{x:-0.085, y:0.014, z:-0.334}, 'LeftHandIndex1.rotation':{x:-0.1, y:0.016, z:-0.058}, 'LeftHandIndex2.rotation':{x:0.334, y:0, z:0}, 'LeftHandIndex3.rotation':{x:0.281, y:0, z:0}, 'LeftHandMiddle1.rotation':{x:-0.056, y:0, z:0}, 'LeftHandMiddle2.rotation':{x:0.258, y:0, z:0}, 'LeftHandMiddle3.rotation':{x:0.26, y:0, z:0}, 'LeftHandRing1.rotation':{x:-0.067, y:-0.002, z:0.008}, 'LeftHandRing2.rotation':{x:0.259, y:0, z:0}, 'LeftHandRing3.rotation':{x:0.276, y:0, z:0}, 'LeftHandPinky1.rotation':{x:-0.128, y:-0.007, z:0.042}, 'LeftHandPinky2.rotation':{x:0.227, y:0, z:0}, 'LeftHandPinky3.rotation':{x:0.145, y:0, z:0}, 'RightUpLeg.rotation':{x:-1.507, y:0.2, z:-3.043}, 'RightLeg.rotation':{x:-0.689, y:-0.124, z:0.017}, 'RightFoot.rotation':{x:0.909, y:0.008, z:-0.093}, 'RightToeBase.rotation':{x:0.842, y:0.075, z:-0.008}, 'LeftUpLeg.rotation':{x:-1.449, y:-0.2, z:3.018}, 'LeftLeg.rotation':{x:-0.74, y:-0.115, z:-0.008}, 'LeftFoot.rotation':{x:1.048, y:-0.058, z:0.117}, 'LeftToeBase.rotation':{x:0.807, y:-0.067, z:0.003}
        }
      },

      'back':{
        standing: true,
        props: {
          'Hips.position':{x:0,y:1,z:0}, 'Hips.rotation':{x:-0.732,y:-1.463,z:-0.637}, 'Spine.rotation':{x:-0.171,y:0.106,z:0.157}, 'Spine1.rotation':{x:-0.044,y:0.138,z:-0.059}, 'Spine2.rotation':{x:0.082,y:0.133,z:-0.074}, 'Neck.rotation':{x:0.39,y:0.591,z:-0.248}, 'Head.rotation':{x:-0.001,y:0.596,z:-0.057}, 'LeftShoulder.rotation':{x:1.676,y:0.007,z:-1.892}, 'LeftArm.rotation':{x:-5.566,y:1.188,z:-0.173}, 'LeftForeArm.rotation':{x:-0.673,y:-0.105,z:1.702}, 'LeftHand.rotation':{x:-0.469,y:-0.739,z:0.003}, 'LeftHandThumb1.rotation':{x:0.876,y:0.274,z:0.793}, 'LeftHandThumb2.rotation':{x:0.161,y:-0.23,z:-0.172}, 'LeftHandThumb3.rotation':{x:0.078,y:0.027,z:0.156}, 'LeftHandIndex1.rotation':{x:-0.085,y:-0.002,z:0.009}, 'LeftHandIndex2.rotation':{x:0.176,y:0,z:-0.002}, 'LeftHandIndex3.rotation':{x:-0.036,y:0.001,z:-0.035}, 'LeftHandMiddle1.rotation':{x:0.015,y:0.144,z:-0.076}, 'LeftHandMiddle2.rotation':{x:0.378,y:-0.007,z:-0.077}, 'LeftHandMiddle3.rotation':{x:-0.141,y:-0.001,z:0.031}, 'LeftHandRing1.rotation':{x:0.039,y:0.02,z:-0.2}, 'LeftHandRing2.rotation':{x:0.25,y:-0.002,z:-0.073}, 'LeftHandRing3.rotation':{x:0.236,y:0.006,z:-0.075}, 'LeftHandPinky1.rotation':{x:0.172,y:-0.033,z:-0.275}, 'LeftHandPinky2.rotation':{x:0.216,y:0.043,z:-0.054}, 'LeftHandPinky3.rotation':{x:0.325,y:0.078,z:-0.13}, 'RightShoulder.rotation':{x:2.015,y:-0.168,z:1.706}, 'RightArm.rotation':{x:0.203,y:-1.258,z:-0.782}, 'RightForeArm.rotation':{x:-0.658,y:-0.133,z:-1.401}, 'RightHand.rotation':{x:-1.504,y:0.375,z:-0.005}, 'RightHandThumb1.rotation':{x:0.413,y:-0.158,z:-1.121}, 'RightHandThumb2.rotation':{x:-0.142,y:-0.008,z:0.209}, 'RightHandThumb3.rotation':{x:-0.091,y:0.021,z:0.142}, 'RightHandIndex1.rotation':{x:-0.167,y:0.014,z:-0.072}, 'RightHandIndex2.rotation':{x:0.474,y:0.009,z:0.051}, 'RightHandIndex3.rotation':{x:0.115,y:0.006,z:0.047}, 'RightHandMiddle1.rotation':{x:0.385,y:0.019,z:0.144}, 'RightHandMiddle2.rotation':{x:0.559,y:0.035,z:0.101}, 'RightHandMiddle3.rotation':{x:0.229,y:0,z:0.027}, 'RightHandRing1.rotation':{x:0.48,y:0.026,z:0.23}, 'RightHandRing2.rotation':{x:0.772,y:0.038,z:0.109}, 'RightHandRing3.rotation':{x:0.622,y:0.039,z:0.106}, 'RightHandPinky1.rotation':{x:0.767,y:0.288,z:0.353}, 'RightHandPinky2.rotation':{x:0.886,y:0.049,z:0.122}, 'RightHandPinky3.rotation':{x:0.662,y:0.044,z:0.113}, 'LeftUpLeg.rotation':{x:-0.206,y:-0.268,z:-3.343}, 'LeftLeg.rotation':{x:-0.333,y:0.757,z:-0.043}, 'LeftFoot.rotation':{x:1.049,y:0.167,z:0.287}, 'LeftToeBase.rotation':{x:0.672,y:-0.069,z:-0.004}, 'RightUpLeg.rotation':{x:0.055,y:-0.226,z:3.037}, 'RightLeg.rotation':{x:-0.559,y:0.39,z:-0.001}, 'RightFoot.rotation':{x:1.2,y:0.133,z:0.085}, 'RightToeBase.rotation':{x:0.92,y:0.093,z:-0.013}
        }
      },

      'straight':{
        standing: true,
        props: {
          'Hips.position':{x:0, y:0.989, z:0.001}, 'Hips.rotation':{x:0.047, y:0.007, z:-0.007}, 'Spine.rotation':{x:-0.143, y:-0.007, z:0.005}, 'Spine1.rotation':{x:-0.043, y:-0.014, z:0.012}, 'Spine2.rotation':{x:0.072, y:-0.013, z:0.013}, 'Neck.rotation':{x:0.048, y:-0.003, z:0.012}, 'Head.rotation':{x:0.05, y:-0.02, z:-0.017}, 'LeftShoulder.rotation':{x:1.62, y:-0.166, z:-1.605}, 'LeftArm.rotation':{x:1.275, y:0.544, z:-0.092}, 'LeftForeArm.rotation':{x:0, y:0, z:0.302}, 'LeftHand.rotation':{x:-0.225, y:-0.154, z:0.11}, 'LeftHandThumb1.rotation':{x:0.435, y:-0.044, z:0.457}, 'LeftHandThumb2.rotation':{x:-0.028, y:0.002, z:-0.246}, 'LeftHandThumb3.rotation':{x:-0.236, y:-0.025, z:0.113}, 'LeftHandIndex1.rotation':{x:0.218, y:0.008, z:-0.081}, 'LeftHandIndex2.rotation':{x:0.165, y:-0.001, z:-0.017}, 'LeftHandIndex3.rotation':{x:0.165, y:-0.001, z:-0.017}, 'LeftHandMiddle1.rotation':{x:0.235, y:-0.011, z:-0.065}, 'LeftHandMiddle2.rotation':{x:0.182, y:-0.002, z:-0.019}, 'LeftHandMiddle3.rotation':{x:0.182, y:-0.002, z:-0.019}, 'LeftHandRing1.rotation':{x:0.316, y:-0.017, z:0.008}, 'LeftHandRing2.rotation':{x:0.253, y:-0.003, z:-0.026}, 'LeftHandRing3.rotation':{x:0.255, y:-0.003, z:-0.026}, 'LeftHandPinky1.rotation':{x:0.336, y:-0.062, z:0.088}, 'LeftHandPinky2.rotation':{x:0.276, y:-0.004, z:-0.028}, 'LeftHandPinky3.rotation':{x:0.276, y:-0.004, z:-0.028}, 'RightShoulder.rotation':{x:1.615, y:0.064, z:1.53}, 'RightArm.rotation':{x:1.313, y:-0.424, z:0.131}, 'RightForeArm.rotation':{x:0, y:0, z:-0.317}, 'RightHand.rotation':{x:-0.158, y:-0.639, z:-0.196}, 'RightHandThumb1.rotation':{x:0.44, y:0.048, z:-0.549}, 'RightHandThumb2.rotation':{x:-0.056, y:-0.008, z:0.274}, 'RightHandThumb3.rotation':{x:-0.258, y:0.031, z:-0.095}, 'RightHandIndex1.rotation':{x:0.169, y:-0.011, z:0.105}, 'RightHandIndex2.rotation':{x:0.134, y:0.001, z:0.011}, 'RightHandIndex3.rotation':{x:0.134, y:0.001, z:0.011}, 'RightHandMiddle1.rotation':{x:0.288, y:0.014, z:0.092}, 'RightHandMiddle2.rotation':{x:0.248, y:0.003, z:0.02}, 'RightHandMiddle3.rotation':{x:0.249, y:0.003, z:0.02}, 'RightHandRing1.rotation':{x:0.369, y:0.019, z:0.006}, 'RightHandRing2.rotation':{x:0.321, y:0.004, z:0.026}, 'RightHandRing3.rotation':{x:0.323, y:0.004, z:0.026}, 'RightHandPinky1.rotation':{x:0.468, y:0.085, z:-0.03}, 'RightHandPinky2.rotation':{x:0.427, y:0.007, z:0.034}, 'RightHandPinky3.rotation':{x:0.142, y:0.001, z:0.012}, 'LeftUpLeg.rotation':{x:-0.077, y:-0.058, z:3.126}, 'LeftLeg.rotation':{x:-0.252, y:0.001, z:-0.018}, 'LeftFoot.rotation':{x:1.315, y:-0.064, z:0.315}, 'LeftToeBase.rotation':{x:0.577, y:-0.07, z:-0.009}, 'RightUpLeg.rotation':{x:-0.083, y:-0.032, z:3.124}, 'RightLeg.rotation':{x:-0.272, y:-0.003, z:0.021}, 'RightFoot.rotation':{x:1.342, y:0.076, z:-0.222}, 'RightToeBase.rotation':{x:0.44, y:0.069, z:0.016}
        }
      },

      'wide':{
        standing: true,
        props: {
          'Hips.position':{x:0, y:1.017, z:0.016}, 'Hips.rotation':{x:0.064, y:-0.048, z:0.059}, 'Spine.rotation':{x:-0.123, y:0, z:-0.018}, 'Spine1.rotation':{x:0.014, y:0.003, z:-0.006}, 'Spine2.rotation':{x:0.04, y:0.003, z:-0.007}, 'Neck.rotation':{x:0.101, y:0.007, z:-0.035}, 'Head.rotation':{x:-0.091, y:-0.049, z:0.105}, 'RightShoulder.rotation':{x:1.831, y:0.017, z:1.731}, 'RightArm.rotation':{x:-1.673, y:-1.102, z:-3.132}, 'RightForeArm.rotation':{x:0.265, y:0.23, z:-0.824}, 'RightHand.rotation':{x:-0.52, y:0.345, z:-0.061}, 'RightHandThumb1.rotation':{x:0.291, y:0.056, z:-0.428}, 'RightHandThumb2.rotation':{x:0.025, y:0.005, z:0.166}, 'RightHandThumb3.rotation':{x:-0.089, y:0.009, z:0.068}, 'RightHandIndex1.rotation':{x:0.392, y:-0.015, z:0.11}, 'RightHandIndex2.rotation':{x:0.391, y:0.001, z:0.004}, 'RightHandIndex3.rotation':{x:0.326, y:0, z:0.003}, 'RightHandMiddle1.rotation':{x:0.285, y:0.068, z:0.081}, 'RightHandMiddle2.rotation':{x:0.519, y:0.004, z:0.011}, 'RightHandMiddle3.rotation':{x:0.252, y:0, z:0.001}, 'RightHandRing1.rotation':{x:0.207, y:0.133, z:0.146}, 'RightHandRing2.rotation':{x:0.597, y:0.004, z:0.004}, 'RightHandRing3.rotation':{x:0.292, y:0.002, z:0.012}, 'RightHandPinky1.rotation':{x:0.338, y:0.182, z:0.136}, 'RightHandPinky2.rotation':{x:0.533, y:0.002, z:0.004}, 'RightHandPinky3.rotation':{x:0.194, y:0, z:0.002}, 'LeftShoulder.rotation':{x:1.83, y:-0.063, z:-1.808}, 'LeftArm.rotation':{x:-1.907, y:1.228, z:-2.959}, 'LeftForeArm.rotation':{x:-0.159, y:0.268, z:0.572}, 'LeftHand.rotation':{x:0.069, y:-0.498, z:-0.025}, 'LeftHandThumb1.rotation':{x:0.738, y:0.123, z:0.178}, 'LeftHandThumb2.rotation':{x:-0.26, y:0.028, z:-0.477}, 'LeftHandThumb3.rotation':{x:-0.448, y:0.093, z:-0.661}, 'LeftHandIndex1.rotation':{x:1.064, y:0.005, z:-0.13}, 'LeftHandIndex2.rotation':{x:1.55, y:-0.143, z:-0.136}, 'LeftHandIndex3.rotation':{x:0.722, y:-0.076, z:-0.127}, 'LeftHandMiddle1.rotation':{x:1.095, y:-0.091, z:0.006}, 'LeftHandMiddle2.rotation':{x:1.493, y:-0.174, z:-0.151}, 'LeftHandMiddle3.rotation':{x:0.651, y:-0.031, z:-0.087}, 'LeftHandRing1.rotation':{x:1.083, y:-0.224, z:0.072}, 'LeftHandRing2.rotation':{x:1.145, y:-0.107, z:-0.195}, 'LeftHandRing3.rotation':{x:1.208, y:-0.134, z:-0.158}, 'LeftHandPinky1.rotation':{x:0.964, y:-0.383, z:0.128}, 'LeftHandPinky2.rotation':{x:1.457, y:-0.146, z:-0.159}, 'LeftHandPinky3.rotation':{x:1.019, y:-0.102, z:-0.141}, 'RightUpLeg.rotation':{x:-0.221, y:-0.233, z:2.87}, 'RightLeg.rotation':{x:-0.339, y:-0.043, z:-0.041}, 'RightFoot.rotation':{x:1.081, y:0.177, z:0.114}, 'RightToeBase.rotation':{x:0.775, y:0, z:0}, 'LeftUpLeg.rotation':{x:-0.185, y:0.184, z:3.131}, 'LeftLeg.rotation':{x:-0.408, y:0.129, z:0.02}, 'LeftFoot.rotation':{x:1.167, y:-0.002, z:-0.007}, 'LeftToeBase.rotation':{x:0.723, y:0, z:0}
        }
      },

      'oneknee':{
        kneeling: true,
        props: {
          'Hips.position':{x:-0.005, y:0.415, z:-0.017}, 'Hips.rotation':{x:-0.25, y:0.04, z:-0.238}, 'Spine.rotation':{x:0.037, y:0.043, z:0.047}, 'Spine1.rotation':{x:0.317, y:0.103, z:0.066}, 'Spine2.rotation':{x:0.433, y:0.109, z:0.054}, 'Neck.rotation':{x:-0.156, y:-0.092, z:0.059}, 'Head.rotation':{x:-0.398, y:-0.032, z:0.018}, 'RightShoulder.rotation':{x:1.546, y:0.119, z:1.528}, 'RightArm.rotation':{x:0.896, y:-0.247, z:-0.512}, 'RightForeArm.rotation':{x:0.007, y:0, z:-1.622}, 'RightHand.rotation':{x:1.139, y:-0.853, z:0.874}, 'RightHandThumb1.rotation':{x:0.176, y:0.107, z:-0.311}, 'RightHandThumb2.rotation':{x:-0.047, y:-0.003, z:0.12}, 'RightHandThumb3.rotation':{x:0, y:0, z:0}, 'RightHandIndex1.rotation':{x:0.186, y:0.005, z:0.125}, 'RightHandIndex2.rotation':{x:0.454, y:0.005, z:0.015}, 'RightHandIndex3.rotation':{x:0, y:0, z:0}, 'RightHandMiddle1.rotation':{x:0.444, y:0.035, z:0.127}, 'RightHandMiddle2.rotation':{x:0.403, y:-0.006, z:-0.04}, 'RightHandMiddle3.rotation':{x:0, y:0, z:0}, 'RightHandRing1.rotation':{x:0.543, y:0.074, z:0.121}, 'RightHandRing2.rotation':{x:0.48, y:-0.018, z:-0.063}, 'RightHandRing3.rotation':{x:0, y:0, z:0}, 'RightHandPinky1.rotation':{x:0.464, y:0.086, z:0.113}, 'RightHandPinky2.rotation':{x:0.667, y:-0.06, z:-0.128}, 'RightHandPinky3.rotation':{x:0, y:0, z:0}, 'LeftShoulder.rotation':{x:1.545, y:-0.116, z:-1.529}, 'LeftArm.rotation':{x:0.799, y:0.631, z:0.556}, 'LeftForeArm.rotation':{x:-0.002, y:0.007, z:0.926}, 'LeftHand.rotation':{x:-0.508, y:0.439, z:0.502}, 'LeftHandThumb1.rotation':{x:0.651, y:-0.035, z:0.308}, 'LeftHandThumb2.rotation':{x:-0.053, y:0.008, z:-0.11}, 'LeftHandThumb3.rotation':{x:0, y:0, z:0}, 'LeftHandIndex1.rotation':{x:0.662, y:-0.053, z:-0.116}, 'LeftHandIndex2.rotation':{x:0.309, y:-0.004, z:-0.02}, 'LeftHandIndex3.rotation':{x:0, y:0, z:0}, 'LeftHandMiddle1.rotation':{x:0.501, y:-0.062, z:-0.12}, 'LeftHandMiddle2.rotation':{x:0.144, y:-0.002, z:0.016}, 'LeftHandMiddle3.rotation':{x:0, y:0, z:0}, 'LeftHandRing1.rotation':{x:0.397, y:-0.029, z:-0.143}, 'LeftHandRing2.rotation':{x:0.328, y:0.01, z:0.059}, 'LeftHandRing3.rotation':{x:0, y:0, z:0}, 'LeftHandPinky1.rotation':{x:0.194, y:0.008, z:-0.164}, 'LeftHandPinky2.rotation':{x:0.38, y:0.031, z:0.128}, 'LeftHandPinky3.rotation':{x:0, y:0, z:0}, 'RightUpLeg.rotation':{x:-1.594, y:-0.251, z:2.792}, 'RightLeg.rotation':{x:-2.301, y:-0.073, z:0.055}, 'RightFoot.rotation':{x:1.553, y:-0.207, z:-0.094}, 'RightToeBase.rotation':{x:0.459, y:0.069, z:0.016}, 'LeftUpLeg.rotation':{x:-0.788, y:-0.236, z:-2.881}, 'LeftLeg.rotation':{x:-2.703, y:0.012, z:-0.047}, 'LeftFoot.rotation':{x:2.191, y:-0.102, z:0.019}, 'LeftToeBase.rotation':{x:1.215, y:-0.027, z:0.01}
        }
      },

      'kneel':{
        kneeling: true, lying: true,
        props: {
          'Hips.position':{x:0, y:0.532, z:-0.002}, 'Hips.rotation':{x:0.018, y:-0.008, z:-0.017}, 'Spine.rotation':{x:-0.139, y:-0.01, z:0.002}, 'Spine1.rotation':{x:0.002, y:-0.002, z:0.001}, 'Spine2.rotation':{x:0.028, y:-0.002, z:0.001}, 'Neck.rotation':{x:-0.007, y:0, z:-0.002}, 'Head.rotation':{x:-0.02, y:-0.008, z:-0.004}, 'LeftShoulder.rotation':{x:1.77, y:-0.428, z:-1.588}, 'LeftArm.rotation':{x:0.911, y:0.343, z:0.083}, 'LeftForeArm.rotation':{x:0, y:0, z:0.347}, 'LeftHand.rotation':{x:0.033, y:-0.052, z:-0.105}, 'LeftHandThumb1.rotation':{x:0.508, y:-0.22, z:0.708}, 'LeftHandThumb2.rotation':{x:-0.323, y:-0.139, z:-0.56}, 'LeftHandThumb3.rotation':{x:-0.328, y:0.16, z:-0.301}, 'LeftHandIndex1.rotation':{x:0.178, y:0.248, z:0.045}, 'LeftHandIndex2.rotation':{x:0.236, y:-0.002, z:-0.019}, 'LeftHandIndex3.rotation':{x:-0.062, y:0, z:0.005}, 'LeftHandMiddle1.rotation':{x:0.123, y:-0.005, z:-0.019}, 'LeftHandMiddle2.rotation':{x:0.589, y:-0.014, z:-0.045}, 'LeftHandMiddle3.rotation':{x:0.231, y:-0.002, z:-0.019}, 'LeftHandRing1.rotation':{x:0.196, y:-0.008, z:-0.091}, 'LeftHandRing2.rotation':{x:0.483, y:-0.009, z:-0.038}, 'LeftHandRing3.rotation':{x:0.367, y:-0.005, z:-0.029}, 'LeftHandPinky1.rotation':{x:0.191, y:-0.269, z:-0.246}, 'LeftHandPinky2.rotation':{x:0.37, y:-0.006, z:-0.029}, 'LeftHandPinky3.rotation':{x:0.368, y:-0.005, z:-0.029}, 'RightShoulder.rotation':{x:1.73, y:0.434, z:1.715}, 'RightArm.rotation':{x:0.841, y:-0.508, z:-0.155}, 'RightForeArm.rotation':{x:0, y:0, z:-0.355}, 'RightHand.rotation':{x:0.091, y:0.137, z:0.197}, 'RightHandThumb1.rotation':{x:0.33, y:0.051, z:-0.753}, 'RightHandThumb2.rotation':{x:-0.113, y:0.075, z:0.612}, 'RightHandThumb3.rotation':{x:-0.271, y:-0.166, z:0.164}, 'RightHandIndex1.rotation':{x:0.073, y:0.001, z:-0.093}, 'RightHandIndex2.rotation':{x:0.338, y:0.006, z:0.034}, 'RightHandIndex3.rotation':{x:0.131, y:0.001, z:0.013}, 'RightHandMiddle1.rotation':{x:0.13, y:0.005, z:-0.017}, 'RightHandMiddle2.rotation':{x:0.602, y:0.018, z:0.058}, 'RightHandMiddle3.rotation':{x:-0.031, y:0, z:-0.003}, 'RightHandRing1.rotation':{x:0.351, y:0.019, z:0.045}, 'RightHandRing2.rotation':{x:0.19, y:0.002, z:0.019}, 'RightHandRing3.rotation':{x:0.21, y:0.002, z:0.021}, 'RightHandPinky1.rotation':{x:0.256, y:0.17, z:0.118}, 'RightHandPinky2.rotation':{x:0.451, y:0.01, z:0.045}, 'RightHandPinky3.rotation':{x:0.346, y:0.006, z:0.035}, 'LeftUpLeg.rotation':{x:-0.06, y:0.1, z:-2.918}, 'LeftLeg.rotation':{x:-1.933, y:-0.01, z:0.011}, 'LeftFoot.rotation':{x:0.774, y:-0.162, z:-0.144}, 'LeftToeBase.rotation':{x:1.188, y:0, z:0}, 'RightUpLeg.rotation':{x:-0.099, y:-0.057, z:2.922}, 'RightLeg.rotation':{x:-1.93, y:0.172, z:-0.02}, 'RightFoot.rotation':{x:0.644, y:0.251, z:0.212}, 'RightToeBase.rotation':{x:0.638, y:-0.034, z:-0.001}
        }
      },

      'sitting': {
        sitting: true, lying: true,
        props: {
          'Hips.position':{x:0, y:0.117, z:0.005}, 'Hips.rotation':{x:-0.411, y:-0.049, z:0.056}, 'Spine.rotation':{x:0.45, y:-0.039, z:-0.116}, 'Spine1.rotation':{x:0.092, y:-0.076, z:0.08}, 'Spine2.rotation':{x:0.073, y:0.035, z:0.066}, 'Neck.rotation':{x:0.051, y:0.053, z:-0.079}, 'Head.rotation':{x:-0.169, y:0.009, z:0.034}, 'LeftShoulder.rotation':{x:1.756, y:-0.037, z:-1.301}, 'LeftArm.rotation':{x:-0.098, y:0.016, z:1.006}, 'LeftForeArm.rotation':{x:-0.089, y:0.08, z:0.837}, 'LeftHand.rotation':{x:0.262, y:-0.399, z:0.3}, 'LeftHandThumb1.rotation':{x:0.149, y:-0.043, z:0.452}, 'LeftHandThumb2.rotation':{x:0.032, y:0.006, z:-0.162}, 'LeftHandThumb3.rotation':{x:-0.086, y:-0.005, z:-0.069}, 'LeftHandIndex1.rotation':{x:0.145, y:0.032, z:-0.069}, 'LeftHandIndex2.rotation':{x:0.325, y:-0.001, z:-0.004}, 'LeftHandIndex3.rotation':{x:0.253, y:0, z:-0.003}, 'LeftHandMiddle1.rotation':{x:0.186, y:-0.051, z:-0.091}, 'LeftHandMiddle2.rotation':{x:0.42, y:-0.003, z:-0.011}, 'LeftHandMiddle3.rotation':{x:0.153, y:0.001, z:-0.001}, 'LeftHandRing1.rotation':{x:0.087, y:-0.19, z:-0.078}, 'LeftHandRing2.rotation':{x:0.488, y:-0.004, z:-0.005}, 'LeftHandRing3.rotation':{x:0.183, y:-0.001, z:-0.012}, 'LeftHandPinky1.rotation':{x:0.205, y:-0.262, z:0.051}, 'LeftHandPinky2.rotation':{x:0.407, y:-0.002, z:-0.004}, 'LeftHandPinky3.rotation':{x:0.068, y:0, z:-0.002}, 'RightShoulder.rotation':{x:1.619, y:-0.139, z:1.179}, 'RightArm.rotation':{x:0.17, y:-0.037, z:-1.07}, 'RightForeArm.rotation':{x:-0.044, y:-0.056, z:-0.665}, 'RightHand.rotation':{x:0.278, y:0.454, z:-0.253}, 'RightHandThumb1.rotation':{x:0.173, y:0.089, z:-0.584}, 'RightHandThumb2.rotation':{x:-0.003, y:-0.004, z:0.299}, 'RightHandThumb3.rotation':{x:-0.133, y:-0.002, z:0.235}, 'RightHandIndex1.rotation':{x:0.393, y:-0.023, z:0.108}, 'RightHandIndex2.rotation':{x:0.391, y:0.001, z:0.004}, 'RightHandIndex3.rotation':{x:0.326, y:0, z:0.003}, 'RightHandMiddle1.rotation':{x:0.285, y:0.062, z:0.086}, 'RightHandMiddle2.rotation':{x:0.519, y:0.003, z:0.011}, 'RightHandMiddle3.rotation':{x:0.252, y:-0.001, z:0.001}, 'RightHandRing1.rotation':{x:0.207, y:0.122, z:0.155}, 'RightHandRing2.rotation':{x:0.597, y:0.004, z:0.005}, 'RightHandRing3.rotation':{x:0.292, y:0.001, z:0.012}, 'RightHandPinky1.rotation':{x:0.338, y:0.171, z:0.149}, 'RightHandPinky2.rotation':{x:0.533, y:0.002, z:0.004}, 'RightHandPinky3.rotation':{x:0.194, y:0, z:0.002}, 'LeftUpLeg.rotation':{x:-1.957, y:0.083, z:-2.886}, 'LeftLeg.rotation':{x:-1.46, y:0.123, z:0.005}, 'LeftFoot.rotation':{x:-0.013, y:0.016, z:0.09}, 'LeftToeBase.rotation':{x:0.744, y:0, z:0}, 'RightUpLeg.rotation':{x:-1.994, y:0.125, z:2.905}, 'RightLeg.rotation':{x:-1.5, y:-0.202, z:-0.006}, 'RightFoot.rotation':{x:-0.012, y:-0.065, z:0.081}, 'RightToeBase.rotation':{x:0.758, y:0, z:0}
        }
      }
    };

    // Gestures
    // NOTE: For one hand gestures, use left left
    this.gestureTemplates = {
      'handup': {
        'LeftShoulder.rotation':{x:[1.5,2,1,2], y:[0.2,0.4,1,2], z:[-1.5,-1.3,1,2]}, 'LeftArm.rotation':{x:[1.5,1.7,1,2], y:[-0.6,-0.4,1,2], z:[1,1.2,1,2]}, 'LeftForeArm.rotation':{x:-0.815, y:[-0.4,0,1,2], z:1.575}, 'LeftHand.rotation':{x:-0.529, y:-0.2, z:0.022}, 'LeftHandThumb1.rotation':{x:0.745, y:-0.526, z:0.604}, 'LeftHandThumb2.rotation':{x:-0.107, y:-0.01, z:-0.142}, 'LeftHandThumb3.rotation':{x:0, y:0.001, z:0}, 'LeftHandIndex1.rotation':{x:-0.126, y:-0.035, z:-0.087}, 'LeftHandIndex2.rotation':{x:0.255, y:0.007, z:-0.085}, 'LeftHandIndex3.rotation':{x:0, y:0, z:0}, 'LeftHandMiddle1.rotation':{x:-0.019, y:-0.128, z:-0.082}, 'LeftHandMiddle2.rotation':{x:0.233, y:0.019, z:-0.074}, 'LeftHandMiddle3.rotation':{x:0, y:0, z:0}, 'LeftHandRing1.rotation':{x:0.005, y:-0.241, z:-0.122}, 'LeftHandRing2.rotation':{x:0.261, y:0.021, z:-0.076}, 'LeftHandRing3.rotation':{x:0, y:0, z:0}, 'LeftHandPinky1.rotation':{x:0.059, y:-0.336, z:-0.2}, 'LeftHandPinky2.rotation':{x:0.153, y:0.019, z:0.001}, 'LeftHandPinky3.rotation':{x:0, y:0, z:0}
      },
      'index': {
        'LeftShoulder.rotation':{x:[1.5,2,1,2], y:[0.2,0.4,1,2], z:[-1.5,-1.3,1,2]}, 'LeftArm.rotation':{x:[1.5,1.7,1,2], y:[-0.6,-0.4,1,2], z:[1,1.2,1,2]}, 'LeftForeArm.rotation':{x:-0.815, y:[-0.4,0,1,2], z:1.575}, 'LeftHand.rotation':{x:-0.276, y:-0.506, z:-0.208}, 'LeftHandThumb1.rotation':{x:0.579, y:0.228, z:0.363}, 'LeftHandThumb2.rotation':{x:-0.027, y:-0.04, z:-0.662}, 'LeftHandThumb3.rotation':{x:0, y:0.001, z:0}, 'LeftHandIndex1.rotation':{x:0, y:-0.105, z:0.225}, 'LeftHandIndex2.rotation':{x:0.256, y:-0.103, z:-0.213}, 'LeftHandIndex3.rotation':{x:0, y:0, z:0}, 'LeftHandMiddle1.rotation':{x:1.453, y:0.07, z:0.021}, 'LeftHandMiddle2.rotation':{x:1.599, y:0.062, z:0.07}, 'LeftHandMiddle3.rotation':{x:0, y:0, z:0}, 'LeftHandRing1.rotation':{x:1.528, y:-0.073, z:0.052}, 'LeftHandRing2.rotation':{x:1.386, y:0.044, z:0.053}, 'LeftHandRing3.rotation':{x:0, y:0, z:0}, 'LeftHandPinky1.rotation':{x:1.65, y:-0.204, z:0.031}, 'LeftHandPinky2.rotation':{x:1.302, y:0.071, z:0.085}, 'LeftHandPinky3.rotation':{x:0, y:0, z:0}
      },
      'ok': {
        'LeftShoulder.rotation':{x:[1.5,2,1,2], y:[0.2,0.4,1,2], z:[-1.5,-1.3,1,2]}, 'LeftArm.rotation':{x:[1.5,1.7,1,1], y:[-0.6,-0.4,1,2], z:[1,1.2,1,2]}, 'LeftForeArm.rotation':{x:-0.415, y:[-0.4,0,1,2], z:1.575}, 'LeftHand.rotation':{x:-0.476, y:-0.506, z:-0.208}, 'LeftHandThumb1.rotation':{x:0.703, y:0.445, z:0.899}, 'LeftHandThumb2.rotation':{x:-0.312, y:-0.04, z:-0.938}, 'LeftHandThumb3.rotation':{x:-0.37, y:0.024, z:-0.393}, 'LeftHandIndex1.rotation':{x:0.8, y:-0.086, z:-0.091}, 'LeftHandIndex2.rotation':{x:1.123, y:-0.046, z:-0.074}, 'LeftHandIndex3.rotation':{x:0.562, y:-0.013, z:-0.043}, 'LeftHandMiddle1.rotation':{x:-0.019, y:-0.128, z:-0.082}, 'LeftHandMiddle2.rotation':{x:0.233, y:0.019, z:-0.074}, 'LeftHandMiddle3.rotation':{x:0, y:0, z:0}, 'LeftHandRing1.rotation':{x:0.005, y:-0.241, z:-0.122}, 'LeftHandRing2.rotation':{x:0.261, y:0.021, z:-0.076}, 'LeftHandRing3.rotation':{x:0, y:0, z:0}, 'LeftHandPinky1.rotation':{x:0.059, y:-0.336, z:-0.2}, 'LeftHandPinky2.rotation':{x:0.153, y:0.019, z:0.001}, 'LeftHandPinky3.rotation':{x:0, y:0, z:0}
      },
      'thumbup': {
        'LeftShoulder.rotation':{x:[1.5,2,1,2], y:[0.2,0.4,1,2], z:[-1.5,-1.3,1,2]}, 'LeftArm.rotation':{x:[1.5,1.7,1,2], y:[-0.6,-0.4,1,2], z:[1,1.2,1,2]}, 'LeftForeArm.rotation':{x:-0.415, y:0.206, z:1.575}, 'LeftHand.rotation':{x:-0.276, y:-0.506, z:-0.208}, 'LeftHandThumb1.rotation':{x:0.208, y:-0.189, z:0.685}, 'LeftHandThumb2.rotation':{x:0.129, y:-0.285, z:-0.163}, 'LeftHandThumb3.rotation':{x:-0.047, y:0.068, z:0.401}, 'LeftHandIndex1.rotation':{x:1.412, y:-0.102, z:-0.152}, 'LeftHandIndex2.rotation':{x:1.903, y:-0.16, z:-0.114}, 'LeftHandIndex3.rotation':{x:0.535, y:-0.017, z:-0.062}, 'LeftHandMiddle1.rotation':{x:1.424, y:-0.103, z:-0.12}, 'LeftHandMiddle2.rotation':{x:1.919, y:-0.162, z:-0.114}, 'LeftHandMiddle3.rotation':{x:0.44, y:-0.012, z:-0.051}, 'LeftHandRing1.rotation':{x:1.619, y:-0.127, z:-0.053}, 'LeftHandRing2.rotation':{x:1.898, y:-0.16, z:-0.115}, 'LeftHandRing3.rotation':{x:0.262, y:-0.004, z:-0.031}, 'LeftHandPinky1.rotation':{x:1.661, y:-0.131, z:-0.016}, 'LeftHandPinky2.rotation':{x:1.715, y:-0.067, z:-0.13}, 'LeftHandPinky3.rotation':{x:0.627, y:-0.023, z:-0.071}
      },
      'thumbdown': {
        'LeftShoulder.rotation':{x:[1.5,2,1,2], y:[0.2,0.4,1,2], z:[-1.5,-1.3,1,2]}, 'LeftArm.rotation':{x:[1.5,1.7,1,2], y:[-0.6,-0.4,1,2], z:[1,1.2,1,2]}, 'LeftForeArm.rotation':{x:-2.015, y:0.406, z:1.575}, 'LeftHand.rotation':{x:-0.176, y:-0.206, z:-0.208}, 'LeftHandThumb1.rotation':{x:0.208, y:-0.189, z:0.685}, 'LeftHandThumb2.rotation':{x:0.129, y:-0.285, z:-0.163}, 'LeftHandThumb3.rotation':{x:-0.047, y:0.068, z:0.401}, 'LeftHandIndex1.rotation':{x:1.412, y:-0.102, z:-0.152}, 'LeftHandIndex2.rotation':{x:1.903, y:-0.16, z:-0.114}, 'LeftHandIndex3.rotation':{x:0.535, y:-0.017, z:-0.062}, 'LeftHandMiddle1.rotation':{x:1.424, y:-0.103, z:-0.12}, 'LeftHandMiddle2.rotation':{x:1.919, y:-0.162, z:-0.114}, 'LeftHandMiddle3.rotation':{x:0.44, y:-0.012, z:-0.051}, 'LeftHandRing1.rotation':{x:1.619, y:-0.127, z:-0.053}, 'LeftHandRing2.rotation':{x:1.898, y:-0.16, z:-0.115}, 'LeftHandRing3.rotation':{x:0.262, y:-0.004, z:-0.031}, 'LeftHandPinky1.rotation':{x:1.661, y:-0.131, z:-0.016}, 'LeftHandPinky2.rotation':{x:1.715, y:-0.067, z:-0.13}, 'LeftHandPinky3.rotation':{x:0.627, y:-0.023, z:-0.071}
      },
      'side': {
        'LeftShoulder.rotation':{x:1.755, y:-0.035, z:-1.63}, 'LeftArm.rotation':{x:1.263, y:-0.955, z:1.024}, 'LeftForeArm.rotation':{x:0, y:0, z:0.8}, 'LeftHand.rotation':{x:-0.36, y:-1.353, z:-0.184}, 'LeftHandThumb1.rotation':{x:0.137, y:-0.049, z:0.863}, 'LeftHandThumb2.rotation':{x:-0.293, y:0.153, z:-0.193}, 'LeftHandThumb3.rotation':{x:-0.271, y:-0.17, z:0.18}, 'LeftHandIndex1.rotation':{x:-0.018, y:0.007, z:0.28}, 'LeftHandIndex2.rotation':{x:0.247, y:-0.003, z:-0.025}, 'LeftHandIndex3.rotation':{x:0.13, y:-0.001, z:-0.013}, 'LeftHandMiddle1.rotation':{x:0.333, y:-0.015, z:0.182}, 'LeftHandMiddle2.rotation':{x:0.313, y:-0.005, z:-0.032}, 'LeftHandMiddle3.rotation':{x:0.294, y:-0.004, z:-0.03}, 'LeftHandRing1.rotation':{x:0.456, y:-0.028, z:-0.092}, 'LeftHandRing2.rotation':{x:0.53, y:-0.014, z:-0.052}, 'LeftHandRing3.rotation':{x:0.478, y:-0.012, z:-0.047}, 'LeftHandPinky1.rotation':{x:0.647, y:-0.049, z:-0.184}, 'LeftHandPinky2.rotation':{x:0.29, y:-0.004, z:-0.029}, 'LeftHandPinky3.rotation':{x:0.501, y:-0.013, z:-0.049}
      },
      'shrug': {
        'Neck.rotation':{x:[-0.3,0.3,1,2], y:[-0.3,0.3,1,2], z:[-0.1,0.1]}, 'Head.rotation':{x:[-0.3,0.3], y:[-0.3,0.3], z:[-0.1,0.1]}, 'RightShoulder.rotation':{x:1.732, y:-0.058, z:1.407}, 'RightArm.rotation':{x:1.305, y:0.46, z:0.118}, 'RightForeArm.rotation':{x:[0,2.0], y:[-1,0.2], z:-1.637}, 'RightHand.rotation':{x:-0.048, y:0.165, z:-0.39}, 'RightHandThumb1.rotation':{x:1.467, y:0.599, z:-1.315}, 'RightHandThumb2.rotation':{x:-0.255, y:-0.123, z:0.119}, 'RightHandThumb3.rotation':{x:0, y:-0.002, z:0}, 'RightHandIndex1.rotation':{x:-0.293, y:-0.066, z:-0.112}, 'RightHandIndex2.rotation':{x:0.181, y:0.007, z:0.069}, 'RightHandIndex3.rotation':{x:0, y:0, z:0}, 'RightHandMiddle1.rotation':{x:-0.063, y:-0.041, z:0.032}, 'RightHandMiddle2.rotation':{x:0.149, y:0.005, z:0.05}, 'RightHandMiddle3.rotation':{x:0, y:0, z:0}, 'RightHandRing1.rotation':{x:0.152, y:-0.03, z:0.132}, 'RightHandRing2.rotation':{x:0.194, y:0.007, z:0.058}, 'RightHandRing3.rotation':{x:0, y:0, z:0}, 'RightHandPinky1.rotation':{x:0.306, y:-0.015, z:0.257}, 'RightHandPinky2.rotation':{x:0.15, y:-0.003, z:-0.003}, 'RightHandPinky3.rotation':{x:0, y:0, z:0}, 'LeftShoulder.rotation':{x:1.713, y:0.141, z:-1.433}, 'LeftArm.rotation':{x:1.136, y:-0.422, z:-0.416}, 'LeftForeArm.rotation':{x:1.42, y:0.123, z:1.506}, 'LeftHand.rotation':{x:0.073, y:-0.138, z:0.064}, 'LeftHandThumb1.rotation':{x:1.467, y:-0.599, z:1.314}, 'LeftHandThumb2.rotation':{x:-0.255, y:0.123, z:-0.119}, 'LeftHandThumb3.rotation':{x:0, y:0.001, z:0}, 'LeftHandIndex1.rotation':{x:-0.293, y:0.066, z:0.112}, 'LeftHandIndex2.rotation':{x:0.181, y:-0.007, z:-0.069}, 'LeftHandIndex3.rotation':{x:0, y:0, z:0}, 'LeftHandMiddle1.rotation':{x:-0.062, y:0.041, z:-0.032}, 'LeftHandMiddle2.rotation':{x:0.149, y:-0.005, z:-0.05}, 'LeftHandMiddle3.rotation':{x:0, y:0, z:0}, 'LeftHandRing1.rotation':{x:0.152, y:0.03, z:-0.132}, 'LeftHandRing2.rotation':{x:0.194, y:-0.007, z:-0.058}, 'LeftHandRing3.rotation':{x:0, y:0, z:0}, 'LeftHandPinky1.rotation':{x:0.306, y:0.015, z:-0.257}, 'LeftHandPinky2.rotation':{x:0.15, y:0.003, z:0.003}, 'LeftHandPinky3.rotation':{x:0, y:0, z:0}
      },
      'namaste': {
        'RightShoulder.rotation':{x:1.758, y:0.099, z:1.604}, 'RightArm.rotation':{x:0.862, y:-0.292, z:-0.932}, 'RightForeArm.rotation':{x:0.083, y:0.066, z:-1.791}, 'RightHand.rotation':{x:-0.52, y:-0.001, z:-0.176}, 'RightHandThumb1.rotation':{x:0.227, y:0.418, z:-0.776}, 'RightHandThumb2.rotation':{x:-0.011, y:-0.003, z:0.171}, 'RightHandThumb3.rotation':{x:-0.041, y:-0.001, z:-0.013}, 'RightHandIndex1.rotation':{x:-0.236, y:0.003, z:-0.028}, 'RightHandIndex2.rotation':{x:0.004, y:0, z:0.001}, 'RightHandIndex3.rotation':{x:0.002, y:0, z:0}, 'RightHandMiddle1.rotation':{x:-0.236, y:0.003, z:-0.028}, 'RightHandMiddle2.rotation':{x:0.004, y:0, z:0.001}, 'RightHandMiddle3.rotation':{x:0.002, y:0, z:0}, 'RightHandRing1.rotation':{x:-0.236, y:0.003, z:-0.028}, 'RightHandRing2.rotation':{x:0.004, y:0, z:0.001}, 'RightHandRing3.rotation':{x:0.002, y:0, z:0}, 'RightHandPinky1.rotation':{x:-0.236, y:0.003, z:-0.028}, 'RightHandPinky2.rotation':{x:0.004, y:0, z:0.001}, 'RightHandPinky3.rotation':{x:0.002, y:0, z:0}, 'LeftShoulder.rotation':{x:1.711, y:-0.002, z:-1.625}, 'LeftArm.rotation':{x:0.683, y:0.334, z:0.977}, 'LeftForeArm.rotation':{x:0.086, y:-0.066, z:1.843}, 'LeftHand.rotation':{x:-0.595, y:-0.229, z:0.096}, 'LeftHandThumb1.rotation':{x:0.404, y:-0.05, z:0.537}, 'LeftHandThumb2.rotation':{x:-0.02, y:0.004, z:-0.154}, 'LeftHandThumb3.rotation':{x:-0.049, y:0.002, z:-0.019}, 'LeftHandIndex1.rotation':{x:-0.113, y:-0.001, z:0.014}, 'LeftHandIndex2.rotation':{x:0.003, y:0, z:0}, 'LeftHandIndex3.rotation':{x:0.002, y:0, z:0}, 'LeftHandMiddle1.rotation':{x:-0.113, y:-0.001, z:0.014}, 'LeftHandMiddle2.rotation':{x:0.004, y:0, z:0}, 'LeftHandMiddle3.rotation':{x:0.002, y:0, z:0}, 'LeftHandRing1.rotation':{x:-0.113, y:-0.001, z:0.014}, 'LeftHandRing2.rotation':{x:0.003, y:0, z:0}, 'LeftHandRing3.rotation':{x:0.002, y:0, z:0}, 'LeftHandPinky1.rotation':{x:-0.122, y:-0.001, z:-0.057}, 'LeftHandPinky2.rotation':{x:0.012, y:0.001, z:0.07}, 'LeftHandPinky3.rotation':{x:0.002, y:0, z:0}
      }
    }


    // Pose deltas
    // NOTE: In this object (x,y,z) are always Euler rotations despite the name!!
    // NOTE: This object should include all the used delta properties.
    this.poseDelta = {
      props: {
        'Hips.quaternion':{x:0, y:0, z:0},'Spine.quaternion':{x:0, y:0, z:0},
        'Spine1.quaternion':{x:0, y:0, z:0}, 'Neck.quaternion':{x:0, y:0, z:0},
        'Head.quaternion':{x:0, y:0, z:0}, 'Spine1.scale':{x:0, y:0, z:0},
        'Neck.scale':{x:0, y:0, z:0}, 'LeftArm.scale':{x:0, y:0, z:0},
        'RightArm.scale':{x:0, y:0, z:0}
      }
    };
    // Add legs, arms and hands
    ['Left','Right'].forEach( x => {
      ['Leg','UpLeg','Arm','ForeArm','Hand'].forEach( y => {
        this.poseDelta.props[x+y+'.quaternion'] = {x:0, y:0, z:0};
      });
      ['HandThumb', 'HandIndex','HandMiddle','HandRing', 'HandPinky'].forEach( y => {
        this.poseDelta.props[x+y+'1.quaternion'] = {x:0, y:0, z:0};
        this.poseDelta.props[x+y+'2.quaternion'] = {x:0, y:0, z:0};
        this.poseDelta.props[x+y+'3.quaternion'] = {x:0, y:0, z:0};
      });
    })

    // Dynamically pick up all the property names that we need in the code
    const names = new Set();
    Object.values(this.poseTemplates).forEach( x => {
      Object.keys( this.propsToThreeObjects(x.props) ).forEach( y => names.add(y) );
    });
    Object.keys( this.poseDelta.props ).forEach( x => {
      names.add(x)
    });
    this.posePropNames = [...names];

    // Use "side" as the first pose, weight on left leg
    this.poseName = "side"; // First pose
    this.poseWeightOnLeft = true; // Initial weight on left leg
    this.gesture = null; // Values that override pose properties
    this.poseCurrentTemplate = this.poseTemplates[this.poseName];
    this.poseBase = this.poseFactory( this.poseCurrentTemplate );
    this.poseTarget = this.poseFactory( this.poseCurrentTemplate );
    this.poseStraight = this.propsToThreeObjects( this.poseTemplates["straight"].props ); // Straight pose used as a reference
    this.poseAvatar = null; // Set when avatar has been loaded

    // Avatar height in meters
    // NOTE: The actual value is calculated based on the eye level on avatar load
    this.avatarHeight = 1.7;


    // Animation templates
    //
    // baseline: Describes morph target baseline. Values can be either float or
    //           an array [start,end,skew] describing a probability distribution.
    // speech  : Describes voice rate, pitch and volume as deltas to the values
    //           set as options.
    // anims   : Animations for breathing, pose, etc. To be used animation
    //           sequence is selected in the following order:
    //           1. State (idle, talking)
    //           2. Mood (moodX, moodY)
    //           3. Pose (poseX, poseY)
    //           5. View (full, upper, head)
    //           6. Body form ('M','F')
    //           7. Alt (sequence of objects with propabilities p. If p is not
    //              specified, the remaining part is shared equivally among
    //              the rest.)
    //           8. Current object
    // object  : delay, delta times dt and values vs.
    //
    this.animMoods = {
      'neutral' : {
        baseline: { eyesLookDown: 0.1 },
        speech: { deltaRate: 0, deltaPitch: 0, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1200,500,1000 ], vs: { chestInhale: [0.5,0.5,0] } },
          { name: 'pose', alt: [
            { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
            { p: 0.4, delay: [5000,20000], vs: { pose: ['hip'] },
              'M': { delay: [5000,20000], vs: { pose: ['wide'] } }
            },
            { delay: [5000,20000], vs: { pose: ['straight'] } }
          ]},
          { name: 'head',
            idle: { delay: [0,1000], dt: [ [200,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.3,0.3]], headRotateZ: [[-0.08,0.08]] } },
            talking: { dt: [ [0,1000,0] ], vs: { headRotateX: [[-0.05,0.15,1,2]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.1,0.1]] } }
          },
          { name: 'eyes', delay: [200,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', alt: [
            { p: 0.85, delay: [1000,8000,1,2], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
            { delay: [1000,4000,1,2], dt: [50,[100,200],100,[10,400,0],50,[100,200],100], vs: { eyeBlinkLeft: [1,1,0,0,1,1,0], eyeBlinkRight: [1,1,0,0,1,1,0] } }
          ]},
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'happy' : {
        baseline: { mouthSmile: 0.2, eyesLookDown: 0.1 },
        speech: { deltaRate: 0, deltaPitch: 0.1, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1200,500,1000 ], vs: { chestInhale: [0.5,0.5,0] } },
          { name: 'pose',
            idle: {
              alt: [
                { p: 0.6, delay: [5000,20000], vs: { pose: ['side'] } },
                { p: 0.2, delay: [5000,20000], vs: { pose: ['hip'] },
                  'M': { delay: [5000,20000], vs: { pose: ['side'] } }
                },
                { p: 0.1, delay: [5000,20000], vs: { pose: ['straight'] } },
                { delay: [5000,10000], vs: { pose: ['wide'] } },
                { delay: [1000,3000], vs: { pose: ['turn'] } },
              ]
            },
            talking: {
              alt: [
                { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
                { p: 0.4, delay: [5000,20000], vs: { pose: ['straight'] } },
                { delay: [5000,20000], vs: { pose: ['hip'] },
                  'M': { delay: [5000,20000], vs: { pose: ['wide'] } }
                },
              ]
            }
          },
          { name: 'head',
            idle: { dt: [ [1000,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.3,0.3]], headRotateZ: [[-0.08,0.08]] } },
            talking: { dt: [ [0,1000,0] ], vs: { headRotateX: [[-0.05,0.15,1,2]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.1,0.1]] } }
          },
          { name: 'eyes', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', alt: [
            { p: 0.85, delay: [1000,8000,1,2], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
            { delay: [1000,4000,1,2], dt: [50,[100,200],100,[10,400,0],50,[100,200],100], vs: { eyeBlinkLeft: [1,1,0,0,1,1,0], eyeBlinkRight: [1,1,0,0,1,1,0] } }
          ]},
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthLeft: [[0,0.3,2]], mouthSmile: [[0,0.2,3]], mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'angry' : {
        baseline: { eyesLookDown: 0.1, browDownLeft: 0.6, browDownRight: 0.6, jawForward: 0.3, mouthFrownLeft: 0.7, mouthFrownRight: 0.7, mouthRollLower: 0.2, mouthShrugLower: 0.3, handFistLeft: 1, handFistRight: 1 },
        speech: { deltaRate: -0.2, deltaPitch: 0.2, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.7,0.7,0] } },
          { name: 'pose', alt: [
            { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
            { p: 0.4, delay: [5000,20000], vs: { pose: ['straight'] } },
            { p: 0.2, delay: [5000,20000], vs: { pose: ['hip'] },
              'M': { delay: [5000,20000], vs: { pose: ['wide'] } }
            },
          ]},
          { name: 'head',
            idle: { delay: [100,500], dt: [ [200,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.2,0.2]], headRotateZ: [[-0.08,0.08]] } },
            talking: { dt: [ [0,1000,0] ], vs: { headRotateX: [[-0.05,0.15,1,2]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.1,0.1]] } }
          },
          { name: 'eyes', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', alt: [
            { p: 0.85, delay: [1000,8000,1,2], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
            { delay: [1000,4000,1,2], dt: [50,[100,200],100,[10,400,0],50,[100,200],100], vs: { eyeBlinkLeft: [1,1,0,0,1,1,0], eyeBlinkRight: [1,1,0,0,1,1,0] } }
          ]},
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'sad' : {
        baseline: { eyesLookDown: 0.2, browDownRight: 0.1, browInnerUp: 0.6, browOuterUpRight: 0.2, eyeSquintLeft: 0.7, eyeSquintRight: 0.7, mouthFrownLeft: 0.8, mouthFrownRight: 0.8, mouthLeft: 0.2, mouthPucker: 0.5, mouthRollLower: 0.2, mouthRollUpper: 0.2, mouthShrugLower: 0.2, mouthShrugUpper: 0.2, mouthStretchLeft: 0.4 },
        speech: { deltaRate: -0.2, deltaPitch: -0.2, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.3,0.3,0] } },
          { name: 'pose', alt: [
            { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
            { p: 0.4, delay: [5000,20000], vs: { pose: ['straight'] } },
            { delay: [5000,10000], vs: { pose: ['side'] },
              full: { delay: [5000,10000], vs: { pose: ['oneknee'] } }
            },
          ]},
          { name: 'head',
            idle: { delay: [100,500], dt: [ [200,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.2,0.2]], headRotateZ: [[-0.08,0.08]] } },
            talking: { dt: [ [0,1000,0] ], vs: { headRotateX: [[-0.05,0.15,1,2]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.1,0.1]] } }
          },
          { name: 'eyes', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', alt: [
            { p: 0.85, delay: [1000,8000,1,2], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
            { delay: [1000,4000,1,2], dt: [50,[100,200],100,[10,400,0],50,[100,200],100], vs: { eyeBlinkLeft: [1,1,0,0,1,1,0], eyeBlinkRight: [1,1,0,0,1,1,0] } }
          ]},
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'fear' : {
        baseline: { browInnerUp: 0.7, eyeSquintLeft: 0.5, eyeSquintRight: 0.5, eyeWideLeft: 0.6, eyeWideRight: 0.6, mouthClose: 0.1, mouthFunnel: 0.3, mouthShrugLower: 0.5, mouthShrugUpper: 0.5 },
        speech: { deltaRate: -0.2, deltaPitch: 0, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.7,0.7,0] } },
          { name: 'pose', alt: [
            { p: 0.8, delay: [5000,20000], vs: { pose: ['side'] } },
            { delay: [5000,20000], vs: { pose: ['straight'] } },
            { delay: [5000,10000], vs: { pose: ['wide'] } },
            { delay: [5000,10000], vs: { pose: ['side'] },
              full: { delay: [5000,10000], vs: { pose: ['oneknee'] } }
            },
          ]},
          { name: 'head',
            idle: { delay: [100,500], dt: [ [200,3000] ], vs: { headRotateX: [[-0.06,0.12]], headRotateY: [[-0.7,0.7]], headRotateZ: [[-0.1,0.1]] } },
            talking: { dt: [ [0,1000,0] ], vs: { headRotateX: [[-0.05,0.15,1,2]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.1,0.1]] } }
          },
          { name: 'eyes', delay: [100,2000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-1,1]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', alt: [
            { p: 0.85, delay: [1000,8000,1,2], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
            { delay: [1000,4000,1,2], dt: [50,[100,200],100,[10,400,0],50,[100,200],100], vs: { eyeBlinkLeft: [1,1,0,0,1,1,0], eyeBlinkRight: [1,1,0,0,1,1,0] } }
          ]},
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'disgust' : {
        baseline: { browDownLeft: 0.7, browDownRight: 0.1, browInnerUp: 0.3, eyeSquintLeft: 1, eyeSquintRight: 1, eyeWideLeft: 0.5, eyeWideRight: 0.5, eyesRotateX: 0.05, mouthLeft: 0.4, mouthPressLeft: 0.3, mouthRollLower: 0.3, mouthShrugLower: 0.3, mouthShrugUpper: 0.8, mouthUpperUpLeft: 0.3, noseSneerLeft: 1, noseSneerRight: 0.7 },
        speech: { deltaRate: -0.2, deltaPitch: 0, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.5,0.5,0] } },
          { name: 'pose', alt: [
            { delay: [5000,10000], vs: { pose: ['side'] } },
          ]},
          { name: 'head',
            idle: { delay: [100,500], dt: [ [200,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.2,0.2]], headRotateZ: [[-0.08,0.08]] } },
            talking: { dt: [ [0,1000,0] ], vs: { headRotateX: [[-0.05,0.15,1,2]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.1,0.1]] } }
          },
          { name: 'eyes', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', alt: [
            { p: 0.85, delay: [1000,8000,1,2], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
            { delay: [1000,4000,1,2], dt: [50,[100,200],100,[10,400,0],50,[100,200],100], vs: { eyeBlinkLeft: [1,1,0,0,1,1,0], eyeBlinkRight: [1,1,0,0,1,1,0] } }
          ]},
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'love' : {
        baseline: { browInnerUp: 0.4, browOuterUpLeft: 0.2, browOuterUpRight: 0.2, mouthSmile: 0.2, eyeBlinkLeft: 0.6, eyeBlinkRight: 0.6, eyeWideLeft: 0.7, eyeWideRight: 0.7, headRotateX: 0.1, mouthDimpleLeft: 0.1, mouthDimpleRight: 0.1, mouthPressLeft: 0.2, mouthShrugUpper: 0.2, mouthUpperUpLeft: 0.1, mouthUpperUpRight: 0.1 },
        speech: { deltaRate: -0.1, deltaPitch: -0.7, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1500,500,1500 ], vs: { chestInhale: [0.8,0.8,0] } },
          { name: 'pose', alt: [
            { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
            { p: 0.2, delay: [5000,20000], vs: { pose: ['straight'] } },
            { p: 0.2, delay: [5000,20000], vs: { pose: ['hip'] },
              'M': { delay: [5000,20000], vs: { pose: ['side'] } }
            },
            { delay: [5000,10000], vs: { pose: ['side'] },
              full: { delay: [5000,10000], vs: { pose: ['kneel'] } }
            },
            { delay: [1000,3000], vs: { pose: ['turn'] },
              'M': { delay: [1000,3000], vs: { pose: ['wide'] } }
            },
            { delay: [1000,3000], vs: { pose: ['back'] },
              'M': { delay: [1000,3000], vs: { pose: ['wide'] } }
            },
            { delay: [5000,20000], vs: { pose: ['side'] },
              'M': { delay: [5000,20000], vs: { pose: ['side'] } },
              full: { delay: [5000,20000], vs: { pose: ['bend'] } }
            },
            { delay: [1000,3000], vs: { pose: ['side'] },
              full: { delay: [5000,10000], vs: { pose: ['oneknee'] } }
            },
          ]},
          { name: 'head',
            idle: { dt: [ [1000,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.3,0.3]], headRotateZ: [[-0.08,0.08]] } },
            talking: { dt: [ [0,1000,0] ], vs: { headRotateX: [[-0.05,0.15,1,2]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.1,0.1]] } }
          },
          { name: 'eyes', delay: [300,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', alt: [
            { p: 0.85, delay: [2000,8000,1,2], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
            { delay: [2000,4000,1,2], dt: [50,[100,200],100,[10,400,0],50,[100,200],100], vs: { eyeBlinkLeft: [1,1,0,0,1,1,0], eyeBlinkRight: [1,1,0,0,1,1,0] } }
          ]},
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthLeft: [[0,0.3,2]], mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [500,1000],[1000,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0.3,0.6]], browOuterUpLeft: [[0.1,0.3]], browOuterUpRight: [[0.1,0.3]] } }
        ]
      },
      'sleep' : {
        baseline: { eyeBlinkLeft: 1, eyeBlinkRight: 1, eyesClosed: 0.6 },
        speech: { deltaRate: 0, deltaPitch: -0.2, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.6,0.6,0] } },
          { name: 'pose', alt: [
            { delay: [5000,20000], vs: { pose: ['side'] } }
          ]},
          { name: 'head', delay: [1000,5000], dt: [ [2000,10000] ], vs: { headRotateX: [[0,0.4]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.04,0.04]] } },
          { name: 'eyes', delay: 10010, dt: [], vs: {} },
          { name: 'blink', delay: 10020, dt: [], vs: {} },
          { name: 'mouth', delay: 10030, dt: [], vs: {} },
          { name: 'misc', delay: 10040, dt: [], vs: {} }
        ]
      }
    };
    this.moodName = this.opt.avatarMood || "neutral";
    this.mood = this.animMoods[ this.moodName ];
    if ( !this.mood ) {
      this.moodName = "neutral";
      this.mood = this.animMoods["neutral"];
    }
    this.randomized = [
      'mouthDippleLeft','mouthDippleRight', 'mouthLeft', 'mouthPress',
      'mouthStretchLeft', 'mouthStretchRight', 'mouthShrugLower',
      'mouthShrugUpper', 'noseSneerLeft', 'noseSneerRight', 'mouthRollLower',
      'mouthRollUpper', 'browDownLeft', 'browDownRight', 'browOuterUpLeft',
      'browOuterUpRight', 'cheekPuff', 'cheekSquintLeft', 'cheekSquintRight'
    ];

    // Animation templates for emojis
    this.animEmojis = {

      '😐': { dt: [300,2000], vs: { pose: ['straight'], browInnerUp: [0.4], eyeWideLeft: [0.7], eyeWideRight: [0.7], mouthPressLeft: [0.6], mouthPressRight: [0.6], mouthRollLower: [0.3], mouthStretchLeft: [1], mouthStretchRight: [1] } },
      '😶': { link:  '😐' },
      '😏': { dt: [300,2000], vs: { browDownRight: [0.1], browInnerUp: [0.7], browOuterUpRight: [0.2], eyeLookInRight: [0.7], eyeLookOutLeft: [0.7], eyeSquintLeft: [1], eyeSquintRight: [0.8], eyesRotateY: [0.7], mouthLeft: [0.4], mouthPucker: [0.4], mouthShrugLower: [0.3], mouthShrugUpper: [0.2], mouthSmile: [0.2], mouthSmileLeft: [0.4], mouthSmileRight: [0.2], mouthStretchLeft: [0.5], mouthUpperUpLeft: [0.6], noseSneerLeft: [0.7] } },
      '🙂': { dt: [300,2000], vs: { mouthSmile: [0.5] } },
      '🙃': { link:  '🙂' },
      '😊': { dt: [300,1000,1000], vs: { browInnerUp: [0.6], eyeSquintLeft: [1], eyeSquintRight: [1], mouthSmile: [0.7], noseSneerLeft: [0.7], noseSneerRight: [0.7]} },
      '😇': { link:  '😊' },
      '😀': { dt: [300,2000], vs: { browInnerUp: [0.6], jawOpen: [0.1], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthOpen: [0.3], mouthPressLeft: [0.3], mouthPressRight: [0.3], mouthRollLower: [0.4], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] }},
      '😃': { dt: [300,2000], vs: { browInnerUp: [0.6], eyeWideLeft: [0.7], eyeWideRight: [0.7], jawOpen: [0.1], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthOpen: [0.3], mouthPressLeft: [0.3], mouthPressRight: [0.3], mouthRollLower: [0.4], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '😄': { dt: [300,2000], vs: { browInnerUp: [0.3], eyeSquintLeft: [1], eyeSquintRight: [1], jawOpen: [0.2], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthOpen: [0.3], mouthPressLeft: [0.3], mouthPressRight: [0.3], mouthRollLower: [0.4], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '😁': { dt: [300,2000], vs: { browInnerUp: [0.3], eyeSquintLeft: [1], eyeSquintRight: [1], jawOpen: [0.3], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthPressLeft: [0.5], mouthPressRight: [0.5], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '😆': { dt: [300,2000], vs: { browInnerUp: [0.3], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.6], jawOpen: [0.3], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthPressLeft: [0.5], mouthPressRight: [0.5], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '😝': { dt: [300,100,1500,500,500], vs: { browInnerUp: [0.8], eyesClosed: [1], jawOpen: [0.7], mouthFunnel: [0.5], mouthSmile: [1], tongueOut: [0,1,1,0] } },
      '😋': { link:  '😝' }, '😛': { link:  '😝' }, '😛': { link:  '😝' }, '😜': { link:  '😝' }, '🤪': { link:  '😝' },
      '😂': { dt: [300,2000], vs: { browInnerUp: [0.3], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.6], jawOpen: [0.3], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthPressLeft: [0.5], mouthPressRight: [0.5], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '🤣': { link:  '😂' }, '😅': { link:  '😂' },
      '😉': { dt: [500,200,500,500], vs: { mouthSmile: [0.5], mouthOpen: [0.2], mouthSmileLeft: [0,0.5,0], eyeBlinkLeft: [0,0.7,0], eyeBlinkRight: [0,0,0], headRotateX: [0.05,0.05,0.05,0], headRotateZ: [-0.05,-0.05,-0.05,0], browDownLeft: [0,0.7,0], cheekSquintLeft: [0,0.7,0], eyeSquintLeft: [0,1,0], eyesClosed: [0] } },

      '😭': { dt: [1000,1000], vs: { browInnerUp: [1], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.1], jawOpen: [0], mouthFrownLeft: [1], mouthFrownRight: [1], mouthOpen: [0.5], mouthPucker: [0.5], mouthUpperUpLeft: [0.6], mouthUpperUpRight: [0.6] } },
      '🥺': { dt: [1000,1000], vs: { browDownLeft: [0.2], browDownRight: [0.2], browInnerUp: [1], eyeWideLeft: [0.9], eyeWideRight: [0.9], eyesClosed: [0.1], mouthClose: [0.2], mouthFrownLeft: [1], mouthFrownRight: [1], mouthPressLeft: [0.4], mouthPressRight: [0.4], mouthPucker: [1], mouthRollLower: [0.6], mouthRollUpper: [0.2], mouthUpperUpLeft: [0.8], mouthUpperUpRight: [0.8] } },
      '😞': { dt: [1000,1000], vs: { browInnerUp: [0.7], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.5], headRotateX: [0.3], mouthClose: [0.2], mouthFrownLeft: [1], mouthFrownRight: [1], mouthPucker: [1], mouthRollLower: [1], mouthShrugLower: [0.2], mouthUpperUpLeft: [0.8], mouthUpperUpRight: [0.8] } },
      '😔': { dt: [1000,1000], vs: { browInnerUp: [1], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.5], headRotateX: [0.3], mouthClose: [0.2], mouthFrownLeft: [1], mouthFrownRight: [1], mouthPressLeft: [0.4], mouthPressRight: [0.4], mouthPucker: [1], mouthRollLower: [0.6], mouthRollUpper: [0.2], mouthUpperUpLeft: [0.8], mouthUpperUpRight: [0.8] } },
      '😳': { dt: [1000,1000], vs: { browInnerUp: [1], eyeWideLeft: [0.5], eyeWideRight: [0.5], eyesRotateY: [0.05], eyesRotateX: [0.05], mouthClose: [0.2], mouthFunnel: [0.5], mouthPucker: [0.4], mouthRollLower: [0.4], mouthRollUpper: [0.4] } },
      '☹️': { dt: [500,1500], vs: { mouthFrownLeft: [1], mouthFrownRight: [1], mouthPucker: [0.1], mouthRollLower: [0.8] } },

      '😚': { dt: [500,1000,1000], vs: { browInnerUp: [0.6], eyeBlinkLeft: [1], eyeBlinkRight: [1], eyeSquintLeft: [1], eyeSquintRight: [1], mouthPucker: [0,0.5], noseSneerLeft: [0,0.7], noseSneerRight: [0,0.7], viseme_U: [0,1] } },
      '😘': { dt: [500,500,200,500], vs: { browInnerUp: [0.6], eyeBlinkLeft: [0,0,1,0], eyeBlinkRight: [0], eyesRotateY: [0], headRotateY: [0], headRotateX: [0,0.05,0.05,0], headRotateZ: [0,-0.05,-0.05,0], eyeSquintLeft: [1], eyeSquintRight: [1], mouthPucker: [0,0.5,0], noseSneerLeft: [0,0.7], noseSneerRight: [0.7], viseme_U: [0,1] } },
      '🥰': { dt: [1000,1000], vs: { browInnerUp: [0.6], eyeSquintLeft: [1], eyeSquintRight: [1], mouthSmile: [0.7], noseSneerLeft: [0.7], noseSneerRight: [0.7] } },
      '😍': { dt: [1000,1000], vs: { browInnerUp: [0.6], jawOpen: [0.1], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthOpen: [0.3], mouthPressLeft: [0.3], mouthPressRight: [0.3], mouthRollLower: [0.4], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '🤩': { link:  '😍' },

      '😡': { dt: [1000,1500], vs: { browDownLeft: [1], browDownRight: [1], eyesLookUp: [0.2], jawForward: [0.3], mouthFrownLeft: [1], mouthFrownRight: [1], headRotateX: [0.15] } },
      '😠': { dt: [1000,1500], vs: { browDownLeft: [1], browDownRight: [1], eyesLookUp: [0.2], jawForward: [0.3], mouthFrownLeft: [1], mouthFrownRight: [1], headRotateX: [0.15] } },
      '🤬': { link:  '😠' },
      '😒': { dt: [1000,1000], vs: { browDownRight: [0.1], browInnerUp: [0.7], browOuterUpRight: [0.2], eyeLookInRight: [0.7], eyeLookOutLeft: [0.7], eyeSquintLeft: [1], eyeSquintRight: [0.8], eyesRotateY: [0.7], mouthFrownLeft: [1], mouthFrownRight: [1], mouthLeft: [0.2], mouthPucker: [0.5], mouthRollLower: [0.2], mouthRollUpper: [0.2], mouthShrugLower: [0.2], mouthShrugUpper: [0.2], mouthStretchLeft: [0.5] } },

      '😱': { dt: [500,1500], vs: { browInnerUp: [0.8], eyeWideLeft: [0.5], eyeWideRight: [0.5], jawOpen: [0.7], mouthFunnel: [0.5] } },
      '😬': { dt: [500,1500], vs: { browDownLeft: [1], browDownRight: [1], browInnerUp: [1], mouthDimpleLeft: [0.5], mouthDimpleRight: [0.5], mouthLowerDownLeft: [1], mouthLowerDownRight: [1], mouthPressLeft: [0.4], mouthPressRight: [0.4], mouthPucker: [0.5], mouthSmile: [0.1], mouthSmileLeft: [0.2], mouthSmileRight: [0.2], mouthStretchLeft: [1], mouthStretchRight: [1], mouthUpperUpLeft: [1], mouthUpperUpRight: [1] } },
      '🙄': { dt: [500,1500], vs: { browInnerUp: [0.8], eyeWideLeft: [1], eyeWideRight: [1], eyesRotateX: [-0.8], headRotateX: [0.15], mouthPucker: [0.5], mouthRollLower: [0.6], mouthRollUpper: [0.5], mouthShrugLower: [0], mouthSmile: [0] } },
      '🤔': { dt: [500,1500], vs: {
        browDownLeft: [1], browOuterUpRight: [1], eyeSquintLeft: [0.6],
        mouthFrownLeft: [0.7], mouthFrownRight: [0.7], mouthLowerDownLeft: [0.3],
        mouthPressRight: [0.4], mouthPucker: [0.1], mouthRight: [0.5], mouthRollLower: [0.5],
        mouthRollUpper: [0.2], handRight: [{ x: 0.1, y: 0.1, z:0.1, d:1000 }, { d:1000 }],
        handFistRight: [0.1]
      } },
      '👀': { dt: [500,1500], vs: { eyesRotateY: [-0.8] } },

      '😴': { dt: [5000,5000], vs:{ eyeBlinkLeft: [1], eyeBlinkRight: [1], headRotateX: [0.2], headRotateZ: [0.1] } },

      '✋': { dt: [300,2000], vs:{ mouthSmile: [0.5], gesture: [["handup",2,true],null] } },
      '🤚': { dt: [300,2000], vs:{ mouthSmile: [0.5], gesture: [["handup",2],null] } },
      '👋': { link:  '✋' },
      '👍': { dt: [300,2000], vs:{ mouthSmile: [0.5], gesture: [["thumbup",2],null] } },
      '👎': { dt: [300,2000], vs:{ browDownLeft: [1], browDownRight: [1], eyesLookUp: [0.2], jawForward: [0.3], mouthFrownLeft: [1], mouthFrownRight: [1], headRotateX: [0.15], gesture: [["thumbdown",2],null] } },
      '👌': { dt: [300,2000], vs:{ mouthSmile: [0.5], gesture: [["ok",2],null] } },
      '🤷‍♂️': { dt: [1000,1500], vs:{ gesture: [["shrug",2],null] } },
      '🤷‍♀️': { link: '🤷‍♂️' },
      '🤷': { link: '🤷‍♂️' },
      '🙏': { dt: [1500,300,1000], vs:{ eyeBlinkLeft: [0,1], eyeBlinkRight: [0,1], headRotateX: [0], headRotateZ: [0.1], gesture: [["namaste",2],null] } },

      'yes': { dt: [[200,500],[200,500],[200,500],[200,500]], vs:{ headRotateX: [[0.1,0.2],0.1,[0.1,0.2],0], headRotateZ: [[-0.2,0.2]] } },
      'no': { dt: [[200,500],[200,500],[200,500],[200,500],[200,500]], vs:{ headRotateY: [[-0.1,-0.05],[0.05,0.1],[-0.1,-0.05],[0.05,0.1],0], headRotateZ: [[-0.2,0.2]] } }

    };

    // Baseline/fixed morph targets
    this.animBaseline = {};
    this.animFixed = {};

    // Anim queues
    this.animQueue = [];
    this.animClips = [];
    this.animPoses = [];

    // Clock
    this.animFrameDur = 1000/ this.opt.modelFPS;
    this.animClock = 0;
    this.animSlowdownRate = 1;
    this.animTimeLast = 0;
    this.easing = this.sigmoidFactory(5); // Ease in and out

    // Lip-sync extensions, import dynamically
    this.lipsync = {};
    // this.opt.lipsyncModules.forEach( x => this.lipsyncGetProcessor(x) );
    this.visemeNames = [
      'aa', 'E', 'I', 'O', 'U', 'PP', 'SS', 'TH', 'DD', 'FF', 'kk',
      'nn', 'RR', 'CH', 'sil'
    ];


    // Audio context and playlist
    this.audioCtx = new AudioContext();
    this.audioSpeechSource = this.audioCtx.createBufferSource();
    this.audioBackgroundSource = this.audioCtx.createBufferSource();
    this.audioBackgroundGainNode = this.audioCtx.createGain();
    this.audioSpeechGainNode = this.audioCtx.createGain();
    this.audioReverbNode = this.audioCtx.createConvolver();
    this.setReverb(null); // Set dry impulse as default
    this.audioBackgroundGainNode.connect(this.audioReverbNode);
    this.audioSpeechGainNode.connect(this.audioReverbNode);
    this.audioReverbNode.connect(this.audioCtx.destination);
    this.setMixerGain( this.opt.mixerGainSpeech, this.opt.mixerGainBackground ); // Volume
    this.audioPlaylist = [];

    // Create a lookup table for base64 decoding
    const b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    this.b64Lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (let i = 0; i < b64Chars.length; i++) this.b64Lookup[b64Chars.charCodeAt(i)] = i;

    // Speech queue
    this.stateName = 'idle';
    this.speechQueue = [];
    this.isSpeaking = false;

    // Setup 3D Animation
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio( this.opt.modelPixelRatio * window.devicePixelRatio );
    this.renderer.setSize(this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = false;
    this.nodeAvatar.appendChild( this.renderer.domElement );
    this.camera = new THREE.PerspectiveCamera( 10, this.nodeAvatar.clientWidth / this.nodeAvatar.clientHeight, 0.1, 2000 );
    this.scene = new THREE.Scene();
    this.lightAmbient = new THREE.AmbientLight(
      new THREE.Color( this.opt.lightAmbientColor ),
      this.opt.lightAmbientIntensity
    );
    this.lightDirect = new THREE.DirectionalLight(
      new THREE.Color( this.opt.lightDirectColor ),
      this.opt.lightDirectIntensity
    );
    this.lightSpot = new THREE.SpotLight(
      new THREE.Color( this.opt.lightSpotColor ),
      this.opt.lightSpotIntensity,
      0,
      this.opt.lightSpotDispersion
    );
    // this.setLighting( this.opt );
    const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    pmremGenerator.compileEquirectangularShader();
    this.scene.environment = pmremGenerator.fromScene( new RoomEnvironment() ).texture;
    this.resizeobserver = new ResizeObserver(this.onResize.bind(this));
    this.resizeobserver.observe(this.nodeAvatar);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableZoom = this.opt.cameraZoomEnable;
    this.controls.enableRotate = this.opt.cameraRotateEnable;
    this.controls.enablePan = this.opt.cameraPanEnable;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 2000;
    this.controls.autoRotateSpeed = 0;
    this.controls.autoRotate = false;
    this.controls.update();
    this.cameraClock = null;

    // IK Mesh
    this.ikMesh = new THREE.SkinnedMesh();
    const ikSetup = {
      'LeftShoulder': null, 'LeftArm': 'LeftShoulder', 'LeftForeArm': 'LeftArm',
      'LeftHand': 'LeftForeArm', 'LeftHandMiddle1': 'LeftHand',
      'RightShoulder': null, 'RightArm': 'RightShoulder', 'RightForeArm': 'RightArm',
      'RightHand': 'RightForeArm', 'RightHandMiddle1': 'RightHand'
    };
    const ikBones = [];
    Object.entries(ikSetup).forEach( (e,i) => {
      const bone = new THREE.Bone();
      bone.name = e[0];
      if ( e[1] ) {
        this.ikMesh.getObjectByName(e[1]).add(bone);
      } else {
        this.ikMesh.add(bone);
      }
      ikBones.push(bone);
    });
    this.ikMesh.bind( new THREE.Skeleton( ikBones ) );

  }

  /**
  * Convert a Base64 MP3 chunk to ArrayBuffer.
  * @param {string} chunk Base64 encoded chunk
  * @return {ArrayBuffer} ArrayBuffer
  */
  b64ToArrayBuffer(chunk) {
    // Calculate the needed total buffer length
    let bufLen = 3 * chunk.length / 4;
    if (chunk[chunk.length - 1] === '=') {
      bufLen--;
      if (chunk[chunk.length - 2] === '=') {
        bufLen--;
      }
    }

    // Create the ArrayBuffer
    const arrBuf = new ArrayBuffer(bufLen);
    const arr = new Uint8Array(arrBuf);
    let i, p = 0, c1, c2, c3, c4;

    // Populate the buffer
    for (i = 0; i < chunk.length; i += 4) {
      c1 = this.b64Lookup[chunk.charCodeAt(i)];
      c2 = this.b64Lookup[chunk.charCodeAt(i+1)];
      c3 = this.b64Lookup[chunk.charCodeAt(i+2)];
      c4 = this.b64Lookup[chunk.charCodeAt(i+3)];
      arr[p++] = (c1 << 2) | (c2 >> 4);
      arr[p++] = ((c2 & 15) << 4) | (c3 >> 2);
      arr[p++] = ((c3 & 3) << 6) | (c4 & 63);
    }

    return arrBuf;
  }

  /**
  * Concatenate an array of ArrayBuffers.
  * @param {ArrayBuffer[]} bufs Array of ArrayBuffers
  * @return {ArrayBuffer} Concatenated ArrayBuffer
  */
  concatArrayBuffers(bufs) {
    let len = 0;
    for( let i=0; i<bufs.length; i++ ) {
      len += bufs[i].byteLength;
    }
    let buf = new ArrayBuffer(len);
    let arr = new Uint8Array(buf);
    let p = 0;
    for( let i=0; i<bufs.length; i++ ) {
      arr.set( new Uint8Array(bufs[i]), p);
      p += bufs[i].byteLength;
    }
    return buf;
  }


  /**
  * Convert PCM buffer to AudioBuffer.
  * NOTE: Only signed 16bit little endian supported.
  * @param {ArrayBuffer} buf PCM buffer
  * @return {AudioBuffer} AudioBuffer
  */
  pcmToAudioBuffer(buf) {
    const arr = new Int16Array(buf);
    const floats = new Float32Array(arr.length);
    for( let i=0; i<arr.length; i++ ) {
      floats[i] = (arr[i] >= 0x8000) ? -(0x10000 - arr[i]) / 0x8000 : arr[i] / 0x7FFF;
    }
    const audio = this.audioCtx.createBuffer(1, floats.length, this.opt.pcmSampleRate );
    audio.copyToChannel( floats, 0 , 0 );
    return audio;
  }


  /**
  * Convert internal notation to THREE objects.
  * NOTE: All rotations are converted to quaternions.
  * @param {Object} p Pose
  * @return {Object} A new pose object.
  */
  propsToThreeObjects(p) {
    // IMP: console.log(`propsToThreeObjects called at ${new Date().toISOString()}`);
    const r = {};
    for( let [key,val] of Object.entries(p) ) {
      const ids = key.split('.');
      let v;
      let x = Array.isArray(val.x) ? this.gaussianRandom(...val.x) : val.x;
      let y = Array.isArray(val.y) ? this.gaussianRandom(...val.y) : val.y;
      let z = Array.isArray(val.z) ? this.gaussianRandom(...val.z) : val.z;

      if ( ids[1] === 'position' || ids[1] === 'scale' ) {
        v = new THREE.Vector3(x,y,z);
      } else if ( ids[1] === 'rotation' ) {
        key = ids[0] + '.quaternion';
        v = new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z,'XYZ')).normalize();
      } else if ( ids[1] === 'quaternion' ) {
        v = new THREE.Quaternion(x,y,z,val.w).normalize();
      }

      if (v) {
        r[key] = v;
      }
    }

    return r;
  }


  /**
  * Clear 3D object.
  * @param {Object} obj Object
  */
  clearThree(obj){
    // IMP: console.log(`clearThree called at ${new Date().toISOString()}`);
    while( obj.children.length ){
      this.clearThree(obj.children[0]);
      obj.remove(obj.children[0]);
    }
    if ( obj.geometry ) obj.geometry.dispose();

    if ( obj.material ) {
      Object.keys(obj.material).forEach( x => {
        if ( obj.material[x] && obj.material[x] !== null && typeof obj.material[x].dispose === 'function' ) {
          obj.material[x].dispose();
        }
      });
      obj.material.dispose();
    }
  }

  /**
  * Loader for 3D avatar model.
  * @param {string} avatar Avatar object with 'url' property to GLTF/GLB file.
  * @param {progressfn} [onprogress=null] Callback for progress
  */
  async showAvatar(avatar: any, onprogress=null ) {
    console.log("Called showAvatar with ", avatar)
    // Check the avatar parameter
    if ( !avatar || !avatar.hasOwnProperty('url') ) {
      throw new Error("Invalid parameter. The avatar must have at least 'url' specified.");
    }

    // Loader
    const loader = new GLTFLoader();
    let gltf = await loader.loadAsync( avatar.url, onprogress );

    // Check the gltf
    const required = [ this.opt.modelRoot ];
    this.posePropNames.forEach( x => required.push( x.split('.')[0] ) );
    required.forEach( x => {
      if ( !gltf.scene.getObjectByName(x) ) {
        throw new Error('Avatar object ' + x + ' not found');
      }
    });

    this.stop();
    this.avatar = avatar;

    // Clear previous scene, if avatar was previously loaded
    this.mixer = null;
    if ( this.armature ) {
      this.clearThree( this.scene );
    }

    // Avatar full-body
    this.armature = gltf.scene.getObjectByName( this.opt.modelRoot );
    this.armature.scale.setScalar(1);

    // Morph targets
    this.morphs = [];
    this.armature.traverse( x => {
      if ( x.morphTargetInfluences && x.morphTargetInfluences.length &&
        x.morphTargetDictionary ) {
        this.morphs.push(x);
      }

      // Workaround for #40, hands culled from the rendering process
      x.frustumCulled = false;
    });
    if ( this.morphs.length === 0 ) {
      throw new Error('Blend shapes not found');
    }

    // Morph target keys
    let keys = new Set();
    keys.add("handFistLeft").add("handFistRight");
    this.morphs.forEach( x => {
      Object.keys(x.morphTargetDictionary).forEach( y => keys.add(y) );
    });
    this.morphsTargetKeys = [...keys];

    // Objects for needed properties
    this.poseAvatar = { props: {} };
    this.posePropNames.forEach( x => {
      const ids = x.split('.');
      const o = this.armature.getObjectByName(ids[0]);
      this.poseAvatar.props[x] = o[ids[1]];
      if ( this.poseBase.props.hasOwnProperty(x) ) {
        this.poseAvatar.props[x].copy( this.poseBase.props[x] );
      } else {
        this.poseBase.props[x] = this.poseAvatar.props[x].clone();
      }

      // Make sure the target has the delta properties, because we need it as a basis
      if ( this.poseDelta.props.hasOwnProperty(x) && !this.poseTarget.props.hasOwnProperty(x) ) {
        this.poseTarget.props[x] = this.poseAvatar.props[x].clone();
      }

      // Take target pose
      this.poseTarget.props[x].t = this.animClock;
      this.poseTarget.props[x].d = 2000;
    });

    // Reset IK bone positions
    this.ikMesh.traverse( x => {
      if (x.isBone) {
        x.position.copy( this.armature.getObjectByName(x.name).position );
      }
    });

    // Add avatar to scene
    this.scene.add(gltf.scene);

    // Add lights
    this.scene.add( this.lightAmbient );
    this.scene.add( this.lightDirect );
    this.scene.add( this.lightSpot );
    this.lightSpot.target = this.armature.getObjectByName('Head');

    // Estimate avatar height based on eye level
    const plEye = new THREE.Vector3();
    this.armature.getObjectByName('LeftEye').getWorldPosition(plEye);
    this.avatarHeight = plEye.y + 0.2;

    // Set pose, view and start animation
    if ( !this.viewName ) this.setView( this.opt.cameraView );
    this.setMood( this.avatar.avatarMood || this.moodName || this.opt.avatarMood );
    this.start();

  }

  /**
  * Get view names.
  * @return {string[]} Supported view names.
  */
  getViewNames() {
    // IMP: console.log(`getViewNames called at ${new Date().toISOString()}`);
    return ['full', 'mid', 'upper', 'head'];
  }

  /**
  * Get current view.
  * @return {string} View name.
  */
  getView() {
    // IMP: console.log(`getView called at ${new Date().toISOString()}`);
    return this.viewName;
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
      this.opt.cameraView = view;
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

  /**
  * Change light colors and intensities.
  * @param {Object} opt Options
  */
  // setLighting(opt) {
  //   console.log(`setLighting function called at ${new Date().toISOString()}`);
  //   opt = opt || {};

  //   // Ambient light
  //   if ( opt.hasOwnProperty("lightAmbientColor") ) {
  //     this.lightAmbient.color.set( new THREE.Color( opt.lightAmbientColor ) );
  //   }
  //   if ( opt.hasOwnProperty("lightAmbientIntensity") ) {
  //     this.lightAmbient.intensity = opt.lightAmbientIntensity;
  //     this.lightAmbient.visible = (opt.lightAmbientIntensity !== 0);
  //   }

  //   // Directional light
  //   if ( opt.hasOwnProperty("lightDirectColor") ) {
  //     this.lightDirect.color.set( new THREE.Color( opt.lightDirectColor ) );
  //   }
  //   if ( opt.hasOwnProperty("lightDirectIntensity") ) {
  //     this.lightDirect.intensity = opt.lightDirectIntensity;
  //     this.lightDirect.visible = (opt.lightDirectIntensity !== 0);
  //   }
  //   if ( opt.hasOwnProperty("lightDirectPhi") && opt.hasOwnProperty("lightDirectTheta") ) {
  //     this.lightDirect.position.setFromSphericalCoords(2, opt.lightDirectPhi, opt.lightDirectTheta);
  //   }

  //   // Spot light
  //   if ( opt.hasOwnProperty("lightSpotColor") ) {
  //     this.lightSpot.color.set( new THREE.Color( opt.lightSpotColor ) );
  //   }
  //   if ( opt.hasOwnProperty("lightSpotIntensity") ) {
  //     this.lightSpot.intensity = opt.lightSpotIntensity;
  //     this.lightSpot.visible = (opt.lightSpotIntensity !== 0);
  //   }
  //   if ( opt.hasOwnProperty("lightSpotPhi") && opt.hasOwnProperty("lightSpotTheta") ) {
  //     this.lightSpot.position.setFromSphericalCoords( 2, opt.lightSpotPhi, opt.lightSpotTheta );
  //     this.lightSpot.position.add( new THREE.Vector3(0,1.5,0) );
  //   }
  //   if ( opt.hasOwnProperty("lightSpotDispersion") ) {
  //     this.lightSpot.angle = opt.lightSpotDispersion;
  //   }
  // }

  /**
  * Render scene.
  */
  render() {
    // console.log(`render function called at ${new Date().toISOString()}`);
    if ( this.isRunning ) {

      // Set limits to eyelids
      const blinkl = this.getValue("eyeBlinkLeft");
      const blinkr = this.getValue("eyeBlinkRight");
      const lookdown = this.getValue("eyesLookDown") / 2;
      const limitl = lookdown + this.getValue("browDownLeft") / 2;
      const limitr = lookdown + this.getValue("browDownRight") / 2;
      this.setValue( "eyeBlinkLeft", Math.max(blinkl,limitl) );
      this.setValue( "eyeBlinkRight", Math.max(blinkr,limitr) );

      this.renderer.render( this.scene, this.camera );

      // Restore eyelid values
      this.setValue( "eyeBlinkLeft", blinkl );
      this.setValue( "eyeBlinkRight", blinkr );

    }
  }

  /**
  * Resize avatar.
  */
  onResize() {
    // IMP: console.log(`onResize function called at ${new Date().toISOString()}`);
    this.camera.aspect = this.nodeAvatar.clientWidth / this.nodeAvatar.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight );
    this.controls.update();
    this.renderer.render( this.scene, this.camera );
  }

  /**
  * Update avatar pose.
  * @param {number} t High precision timestamp in ms.
  */
  updatePoseBase(t) {
    // console.log(`updatePoseBase function called at ${new Date(t).toISOString()}`);
    for( const [key,v] of Object.entries(this.poseTarget.props) ) {
      const o = this.poseAvatar.props[key];
      if (o) {
        const alpha = (t - v.t) / v.d;
        if ( alpha > 1 || !this.poseBase.props.hasOwnProperty(key) ) {
          o.copy(v);
        } else {
          if ( o.isQuaternion ) {
            o.copy( this.poseBase.props[key].slerp(v, this.easing(alpha) ));
          } else if ( o.isVector3 ) {
            o.copy( this.poseBase.props[key].lerp(v, this.easing(alpha) ));
          }
        }
      }
    }
  }

  /**
  * Update avatar pose deltas
  */
  updatePoseDelta() {
    // console.log(`updatePoseDelta function called at ${new Date().toISOString()}`);
    for( const [key,d] of Object.entries(this.poseDelta.props) ) {
      const e = new THREE.Euler(d.x,d.y,d.z);
      const o = this.poseAvatar.props[key];
      if ( o.isQuaternion ) {
        const q = new THREE.Quaternion().setFromEuler(e).normalize();
        o.multiply(q);
      } else if ( o.isVector3 ) {
        o.add( e );
      }
    }
  }

  /**
  * Get given pose as a string.
  * @param {Object} pose Pose
  * @param {number} [prec=1000] Precision used in values
  * @return {string} Pose as a string
  */
  getPoseString(pose,prec=1000){
    // IMP: console.log(`getPoseString function called at ${new Date().toISOString()}`);
    let s = '{';
    Object.entries(pose).forEach( (x,i) => {
      const ids = x[0].split('.');
      if ( ids[1] === 'position' || ids[1] === 'rotation' || ids[1] === 'quaternion' ) {
        const key = (ids[1] === 'quaternion' ? (ids[0]+'.rotation') : x[0]);
        const val = (x[1].isQuaternion ? new THREE.Euler().setFromQuaternion(x[1]) : x[1]);
        s += (i?", ":"") + "'" + key + "':{";
        s += 'x:' + Math.round(val.x * prec) / prec;
        s += ', y:' + Math.round(val.y * prec) / prec;
        s += ', z:' + Math.round(val.z * prec) / prec;
        s += '}';
      }
    });
    s += '}';
    return s;
  }


  /**
  * Return pose template property taking into account mirror pose and gesture.
  * @param {string} key Property key
  * @return {Quaternion|Vector3} Position or rotation
  */
  getPoseTemplateProp(key) {
    // IMP: console.log(`getPoseTemplateProp function called at ${new Date().toISOString()}`);

    const ids = key.split('.');
    let target = ids[0] + '.' + (ids[1] === 'rotation' ? 'quaternion' : ids[1]);

    if ( this.gesture && this.gesture.hasOwnProperty(target) ) {
      return this.gesture[target].clone();
    } else {
      let source = ids[0] + '.' + (ids[1] === 'quaternion' ? 'rotation' : ids[1]);
      if ( !this.poseWeightOnLeft ) {
        if ( source.startsWith('Left') ) {
          source = 'Right' + source.substring(4);
          target = 'Right' + target.substring(4);
        } else if ( source.startsWith('Right') ) {
          source = 'Left' + source.substring(5);
          target = 'Left' + target.substring(5);
        }
      }

      // Get value
      let q;
      if ( this.poseTarget.template.props.hasOwnProperty(target) ) {
        const o = {};
        o[target] = this.poseTarget.template.props[target];
        q = this.propsToThreeObjects( o )[target];
      } else if ( this.poseTarget.template.props.hasOwnProperty(source) ) {
        const o = {};
        o[source] = this.poseTarget.template.props[source];
        q = this.propsToThreeObjects( o )[target];
      }

      // Mirror
      if ( q && !this.poseWeightOnLeft && q.isQuaternion ) {
        q.x *= -1;
        q.w *= -1;
      }

      return q;
    }
  }

  /**
  * Change body weight from current leg to another.
  * @param {Object} p Pose properties
  * @return {Object} Mirrored pose.
  */
  mirrorPose(p) {
    // IMP: console.log(`mirrorPose function called at ${new Date().toISOString()}`);
    const r = {};
    for( let [key,v] of Object.entries(p) ) {

      // Create a mirror image
      if ( v.isQuaternion ) {
        if ( key.startsWith('Left') ) {
          key = 'Right' + key.substring(4);
        } else if ( key.startsWith('Right') ) {
          key = 'Left' + key.substring(5);
        }
        v.x *= -1;
        v.w *= -1;
      }

      r[key] = v.clone();

      // Custom properties
      r[key].t = v.t;
      r[key].d = v.d;
    }
    return r;
  }

  /**
  * Create a new pose.
  * @param {Object} template Pose template
  * @param {numeric} [ms=2000] Transition duration in ms
  * @return {Object} A new pose object.
  */
  poseFactory(template, ms=2000) {
    // IMP: console.log(`poseFactory function called at ${new Date().toISOString()}`);

    // Pose object
    const o = {
      template: template,
      props: this.propsToThreeObjects( template.props )
    };

    for( const [p,v] of Object.entries(o.props) ) {

      // Restrain movement when standing
      if ( this.opt.modelMovementFactor < 1 && template.standing &&
        (p === 'Hips.quaternion' || p === 'Spine.quaternion' ||
        p === 'Spine1.quaternion' || p === 'Spine2.quaternion' ||
        p === 'Neck.quaternion' || p === 'LeftUpLeg.quaternion' ||
        p === 'LeftLeg.quaternion' || p === 'RightUpLeg.quaternion' ||
        p === 'RightLeg.quaternion') ) {
        const ref = this.poseStraight[p];
        const angle = v.angleTo( ref );
        v.rotateTowards( ref, (1 - this.opt.modelMovementFactor) * angle );
      }

      // Custom properties
      v.t = this.animClock; // timestamp
      v.d = ms; // Transition duration

    }
    return o;
  }

  /**
  * Set a new pose and start transition timer.
  * @param {Object} template Pose template, if null update current pose
  * @param {number} [ms=2000] Transition time in milliseconds
  */
  setPoseFromTemplate(template, ms=2000) {
    // IMP: console.log(`setPoseFromTemplate function called at ${new Date().toISOString()}`);

    // Special cases
    const isIntermediate = template && this.poseTarget && this.poseTarget.template && ((this.poseTarget.template.standing && template.lying) || (this.poseTarget.template.lying && template.standing));
    const isSameTemplate = template && (template === this.poseCurrentTemplate);
    const isWeightOnLeft = this.poseWeightOnLeft;
    let duration = isIntermediate ? 1000 : ms;

    // New pose template
    if ( isIntermediate) {
      this.poseCurrentTemplate = this.poseTemplates['oneknee'];
      setTimeout( () => {
        this.setPoseFromTemplate(template,ms);
      }, duration);
    } else {
      this.poseCurrentTemplate = template || this.poseCurrentTemplate;
    }

    // Set target
    this.poseTarget = this.poseFactory(this.poseCurrentTemplate, duration);
    this.poseWeightOnLeft = true;

    // Mirror properties, if necessary
    if ( (!isSameTemplate && !isWeightOnLeft) || (isSameTemplate && isWeightOnLeft ) ) {
      this.poseTarget.props = this.mirrorPose(this.poseTarget.props);
      this.poseWeightOnLeft = !this.poseWeightOnLeft;
    }

    // Gestures
    if ( this.gesture ) {
      for( let [p,v] of Object.entries(this.gesture) ) {
        if ( this.poseTarget.props.hasOwnProperty(p) ) {
          this.poseTarget.props[p].copy(v);
          this.poseTarget.props[p].t = v.t;
          this.poseTarget.props[p].d = v.d;
        }
      }
    }

    // Make sure deltas are included in the target
    Object.keys(this.poseDelta.props).forEach( key => {
      if ( !this.poseTarget.props.hasOwnProperty(key) ) {
        this.poseTarget.props[key] = this.poseBase.props[key].clone();
        this.poseTarget.props[key].t = this.animClock;
        this.poseTarget.props[key].d = duration;
      }
    });

  }

  /**
  * Get morph target value.
  * @param {string} mt Morph target
  * @return {number} Value
  */
  getValue(mt) {
    // console.log(`getValue function called at ${new Date().toISOString()}`);
    if ( mt === 'headRotateX' ) {
      return this.poseDelta.props['Head.quaternion'].x;
    } else if ( mt === 'headRotateY' ) {
      return this.poseDelta.props['Head.quaternion'].y;
    } else if ( mt === 'headRotateZ' ) {
      return this.poseDelta.props['Head.quaternion'].z;
    } else if ( mt.startsWith('handFist') ) {
      const side = mt.substring(8);
      return this.poseDelta.props[side+'HandMiddle1.quaternion'].x;
    } else if ( mt === 'chestInhale' ) {
      return this.poseDelta.props['Spine1.scale'].x * 20;
    } else {
      for( let m of this.morphs ) {
        const ndx = m.morphTargetDictionary[mt];
        if ( ndx !== undefined ) {
          return m.morphTargetInfluences[ndx];
        }
      }
      return 0;
    }
  }


  /**
  * Set morph target value.
  * @param {string} mt Morph target
  * @param {number} v Value
  */
  setValue(mt,v) {
    // console.log(`setValue function called at ${new Date().toISOString()}`);
    if ( mt === 'headRotateX' ) {
      this.poseDelta.props['Head.quaternion'].x = v;
      this.poseDelta.props['Spine1.quaternion'].x =v/2;
      this.poseDelta.props['Spine.quaternion'].x = v/8;
      this.poseDelta.props['Hips.quaternion'].x = v/24;
    } else if ( mt === 'headRotateY' ) {
      this.poseDelta.props['Head.quaternion'].y = v;
      this.poseDelta.props['Spine1.quaternion'].y = v/2;
      this.poseDelta.props['Spine.quaternion'].y = v/2;
      this.poseDelta.props['Hips.quaternion'].y = v/4;
      this.poseDelta.props['LeftUpLeg.quaternion'].y = v/2;
      this.poseDelta.props['RightUpLeg.quaternion'].y = v/2;
      this.poseDelta.props['LeftLeg.quaternion'].y = v/4;
      this.poseDelta.props['RightLeg.quaternion'].y = v/4;
    } else if ( mt === 'headRotateZ' ) {
      this.poseDelta.props['Head.quaternion'].z = v;
      this.poseDelta.props['Spine1.quaternion'].z = v/12;
      this.poseDelta.props['Spine.quaternion'].z = v/12;
      this.poseDelta.props['Hips.quaternion'].z = v/24;
    } else if ( mt.startsWith('handFist') ) {
      const side = mt.substring(8);
      ['HandThumb', 'HandIndex','HandMiddle',
      'HandRing', 'HandPinky'].forEach( (x,i) => {
        if ( i === 0 ) {
          this.poseDelta.props[side+x+'1.quaternion'].x = 0;
          this.poseDelta.props[side+x+'2.quaternion'].z = (side === 'Left' ? -1 : 1) * v;
          this.poseDelta.props[side+x+'3.quaternion'].z = (side === 'Left' ? -1 : 1) * v;
        } else {
          this.poseDelta.props[side+x+'1.quaternion'].x = v;
          this.poseDelta.props[side+x+'2.quaternion'].x = 1.5 * v;
          this.poseDelta.props[side+x+'3.quaternion'].x = 1.5 * v;
        }
      });
    } else if ( mt === 'chestInhale' ) {
      const scale = v/20;
      const d = { x: scale, y: (scale/2), z: (3 * scale) };
      const dneg = { x: (1/(1+scale) - 1), y: (1/(1 + scale/2) - 1), z: (1/(1 + 3 * scale) - 1) };
      this.poseDelta.props['Spine1.scale'] = d;
      this.poseDelta.props['Neck.scale'] = dneg;
      this.poseDelta.props['LeftArm.scale'] = dneg;
      this.poseDelta.props['RightArm.scale'] = dneg;
    } else {
      this.morphs.forEach( x => {
        const ndx = x.morphTargetDictionary[mt];
        if ( ndx !== undefined ) {
          x.morphTargetInfluences[ndx] = v;
        }
      });
    }
  }


  /**
  * Get mood names.
  * @return {string[]} Mood names.
  */
  getMoodNames() {
    console.log(`getMoodNames function called at ${new Date().toISOString()}`);
    return Object.keys(this.animMoods);
  }

  /**
  * Get current mood.
  * @return {string[]} Mood name.
  */
  getMood() {
    console.log(`getMood function called at ${new Date().toISOString()}`);
    return this.opt.avatarMood;
  }

  /**
  * Set mood.
  * @param {string} s Mood name.
  */
  setMood(s) {
    s = (s || '').trim().toLowerCase();
    if ( !this.animMoods.hasOwnProperty(s) ) throw new Error("Unknown mood.");
    this.moodName = s;
    this.mood = this.animMoods[this.moodName];

    // Reset morph target baseline
    for( let mt of this.morphsTargetKeys ) {
      let v = 0;
      if ( this.mood.baseline.hasOwnProperty(mt) ) {
        v = this.mood.baseline[mt];
      } else if ( this.avatar.baseline?.hasOwnProperty(mt) ) {
        v = this.avatar.baseline[mt];
      }
      this.setBaselineValue( mt, v );
    }

    // Set/replace animations
    this.mood.anims.forEach( x => {
      let i = this.animQueue.findIndex( y => y.template.name === x.name );
      if ( i !== -1 ) {
        this.animQueue.splice(i, 1);
      }
      this.animQueue.push( this.animFactory( x, -1 ) );
    });

  }


  /**
  * Get morph target names.
  * @return {string[]} Morph target names.
  */
  getMorphTargetNames() {
    // IMP: console.log(`getMorphTargetNames function called at ${new Date().toISOString()}`);
    return [
      'headRotateX', 'headRotateY', 'headRotateZ',
      'eyesRotateX', 'eyesRotateY', 'chestInhale',
      ...this.morphsTargetKeys
    ].sort();
  }

  /**
  * Get baseline value for the morph target.
  * @param {string} mt Morph target name
  * @return {number} Value, undefined if not in baseline
  */
  getBaselineValue( mt ) {
    if ( mt === 'eyesRotateY' ) {
      const ll = this.getBaselineValue('eyeLookOutLeft');
      if ( ll === undefined ) return undefined;
      const lr = this.getBaselineValue('eyeLookInLeft');
      if ( lr === undefined ) return undefined;
      const rl = this.getBaselineValue('eyeLookOutRight');
      if ( rl === undefined ) return undefined;
      const rr = this.getBaselineValue('eyeLookInRight');
      if ( rr === undefined ) return undefined;
      return ll - lr;
    } else if ( mt === 'eyesRotateX' ) {
      const d = this.getBaselineValue('eyesLookDown');
      if ( d === undefined ) return undefined;
      const u = this.getBaselineValue('eyeLookUp');
      if ( u === undefined ) return undefined;
      return d - u;
    } else {
      return (this.animBaseline.hasOwnProperty(mt) ? this.animBaseline[mt].target : undefined);
    }
  }

  /**
  * Set baseline for morph target.
  * @param {string} mt Morph target name
  * @param {number} v Value, null if to be removed from baseline
  */
  setBaselineValue( mt, v ) {
    if ( mt === 'eyesRotateY' ) {
      this.setBaselineValue('eyeLookOutLeft', (v === null) ? null : (v>0 ? v : 0) );
      this.setBaselineValue('eyeLookInLeft', (v === null) ? null : (v>0 ? 0 : -v) );
      this.setBaselineValue('eyeLookOutRight', (v === null) ? null : (v>0 ? 0 : -v) );
      this.setBaselineValue('eyeLookInRight', (v === null) ? null : (v>0 ? v : 0) );
    } else if ( mt === 'eyesRotateX' ) {
      this.setBaselineValue('eyesLookDown', (v === null) ? null : (v>0 ? v : 0) );
      this.setBaselineValue('eyesLookUp', (v === null) ? null : (v>0 ? 0 : -v) );
    } else if ( mt === 'eyeLookOutLeft' || mt === 'eyeLookInLeft' ||
            mt === 'eyeLookOutRight' || mt === 'eyeLookInRight' ||
            mt === 'eyesLookDown' || mt === 'eyesLookUp' ) {
      // skip these
    } else {
      if ( v === null ) {
        if ( this.animBaseline.hasOwnProperty(mt) ) {
          delete this.animBaseline[mt];
        }
      } else {
        this.animBaseline[mt] = { target: v };
      }
    }
  }

  /**
  * Get fixed value for the morph target.
  * @param {string} mt Morph target name
  * @return {number} Value, undefined if not fixed
  */
  getFixedValue( mt ) {
    if ( mt === 'eyesRotateY' ) {
      const ll = this.getFixedValue('eyeLookOutLeft');
      if ( ll === undefined ) return undefined;
      const lr = this.getFixedValue('eyeLookInLeft');
      if ( lr === undefined ) return undefined;
      const rl = this.getFixedValue('eyeLookOutRight');
      if ( rl === undefined ) return undefined;
      const rr = this.getFixedValue('eyeLookInRight');
      if ( rr === undefined ) return undefined;
      return ll - lr;
    } else if ( mt === 'eyesRotateX' ) {
      const d = this.getFixedValue('eyesLookDown');
      if ( d === undefined ) return undefined;
      const u = this.getFixedValue('eyeLookUp');
      if ( u === undefined ) return undefined;
      return d - u;
    } else {
      return (this.animFixed.hasOwnProperty(mt) ? this.animFixed[mt].target : undefined);
    }
  }

  /**
  * Fix morph target.
  * @param {string} mt Morph target name
  * @param {number} v Value, null if to be removed
  */
  setFixedValue( mt, v ) {
    if ( mt === 'eyesRotateY' ) {
      this.setFixedValue('eyeLookOutLeft', (v === null) ? null : (v>0 ? v : 0 ) );
      this.setFixedValue('eyeLookInLeft', (v === null) ? null : (v>0 ? 0 : -v ) );
      this.setFixedValue('eyeLookOutRight', (v === null) ? null : (v>0 ? 0 : -v ) );
      this.setFixedValue('eyeLookInRight', (v === null) ? null : (v>0 ? v : 0 ) );
    } else if ( mt === 'eyesRotateX' ) {
      this.setFixedValue('eyesLookDown', (v === null) ? null : (v>0 ? v : 0 ) );
      this.setFixedValue('eyesLookUp', (v === null) ? null : (v>0 ? 0 : -v ) );
    } else {
      if ( v === null ) {
        if ( this.animFixed.hasOwnProperty(mt) ) {
          delete this.animFixed[mt];
        }
      } else {
        this.animFixed[mt] = { target: v };
      }
    }
  }


  /**
  * Create a new animation based on an animation template.
  * @param {Object} t Animation template
  * @param {number} [loop=false] Number of loops, false if not looped
  * @param {number} [scaleTime=1] Scale template times
  * @param {number} [scaleValue=1] Scale template values
  * @return {Object} New animation object.
  */
  animFactory( t, loop = false, scaleTime = 1, scaleValue = 1 ) {
    // IMP: console.log(`animFactory function called at ${new Date().toISOString()}`);
    const o = { template: t, ts: [0], vs: {} };

    // Follow the hierarchy of objects
    let a = t;
    while(1) {
      if ( a.hasOwnProperty(this.stateName) ) {
        a = a[this.stateName];
      } else if ( a.hasOwnProperty(this.moodName) ) {
        a = a[this.moodName];
      } else if ( a.hasOwnProperty(this.poseName) ) {
        a = a[this.poseName];
      } else if ( a.hasOwnProperty(this.viewName) ) {
        a = a[this.viewName];
      } else if ( this.avatar.body && a.hasOwnProperty(this.avatar.body) ) {
        a = a[this.avatar.body];
      } else if ( a.hasOwnProperty('alt') ) {

        // Go through alternatives with probabilities
        let b = a.alt[0];
        if ( a.alt.length > 1 ) {
         // Flip a coin
         const coin = Math.random();
         let p = 0;
         for( let i=0; i<a.alt.length; i++ ) {
           p += a.alt[i].p || (1-p)/(a.alt.length-i);
           if (coin<p) {
             b = a.alt[i];
             break;
           }
         }
        }
        a = b;

      } else {
        break;
      }
    }

    // Time series
    const delay = a.delay ? (Array.isArray(a.delay) ? this.gaussianRandom(...a.delay) : a.delay ) : 0;
    if ( a.hasOwnProperty('dt') ) {
      a.dt.forEach( (x,i) => {
        o.ts[i+1] = o.ts[i] + (Array.isArray(x) ? this.gaussianRandom(...x) : x);
      });
    }
    o.ts = o.ts.map( x => this.animClock + delay + x * scaleTime );

    // Values
    for( let [mt,vs] of Object.entries(a.vs) ) {
      const base = this.getBaselineValue(mt);
      const v = vs.map( x => {
        if ( x === null ) {
          return null;
        } else if ( typeof x === 'function' ) {
          return x;
        } else if ( typeof x === 'string' || x instanceof String ) {
          return x.slice();
        } else if ( Array.isArray(x) ) {
          if ( mt === 'gesture' ) {
            return x.slice();
          } else {
            return (base === undefined ? 0 : base) + scaleValue * this.gaussianRandom(...x);
          }
        } else if ( x instanceof Object && x.constructor === Object ) {
          return Object.assign( {}, x );
        } else {
          return (base === undefined ? 0 : base) + scaleValue * x;
        }
      });

      if ( mt === 'eyesRotateY' ) {
        o.vs['eyeLookOutLeft'] = [null, ...v.map( x => (x>0) ? x : 0 ) ];
        o.vs['eyeLookInLeft'] = [null, ...v.map( x => (x>0) ? 0 : -x ) ];
        o.vs['eyeLookOutRight'] = [null, ...v.map( x => (x>0) ? 0 : -x ) ];
        o.vs['eyeLookInRight'] = [null, ...v.map( x => (x>0) ? x : 0 ) ];
      } else if ( mt === 'eyesRotateX' ) {
        o.vs['eyesLookDown'] = [null, ...v.map( x => (x>0) ? x : 0 ) ];
        o.vs['eyesLookUp'] = [null, ...v.map( x => (x>0) ? 0 : -x ) ];
      } else {
        o.vs[mt] = [null, ...v];
      }
    }
    for( let mt of Object.keys(o.vs) ) {
      while( (o.vs[mt].length-1) < o.ts.length ) o.vs[mt].push( o.vs[mt][ o.vs[mt].length - 1 ]);
    }

    // Mood
    if ( t.hasOwnProperty("mood") ) o.mood = t.mood.slice();

    // Loop
    if ( loop ) o.loop = loop;

    return o;
  }

  /**
  * Calculate the correct value based on a given time using the given function.
  * @param {number[]} ts Time sequence
  * @param {number[]} vs Value sequence
  * @param {number} t Time.
  * @param {function} [fun=null] Ease in and out function, null = use linear function
  * @return {number} Value based on the given time.
  */
  valueAnimationSeq(ts,vs,t,fun = null) {
    // console.log(`valueAnimationSeq function called at ${new Date().toISOString()}`);
    let iMin = 0;
    let iMax = ts.length-1;
    if ( t <= ts[iMin] ) return (typeof vs[iMin] === 'function' ? vs[iMin]() : vs[iMin]);
    if ( t >= ts[iMax] ) return (typeof vs[iMax] === 'function' ? vs[iMax]() : vs[iMax]);
    while( t > ts[iMin+1] ) iMin++;
    iMax = iMin + 1;
    let k = ((typeof vs[iMax] === 'function' ? vs[iMax]() : vs[iMax]) - (typeof vs[iMin] === 'function' ? vs[iMin]() : vs[iMin])) / (ts[iMax] - ts[iMin]);
    if ( fun ) k = fun( ( t - ts[iMin] ) / (ts[iMax] - ts[iMin]) ) * k;
    const b = (typeof vs[iMin] === 'function' ? vs[iMin]() : vs[iMin]) - (k * ts[iMin]);
    return (k * t + b);
  }

  /**
  * Return gaussian distributed random value between start and end with skew.
  * @param {number} start Start value
  * @param {number} end End value
  * @param {number} [skew=1] Skew
  * @param {number} [samples=5] Number of samples, 1 = uniform distribution.
  * @return {number} Gaussian random value.
  */
  gaussianRandom(start,end,skew=1,samples=5) {
    // IMP: console.log(`gaussianRandom function called at ${new Date().toISOString()}`);
    let r = 0;
    for( let i=0; i<samples; i++) r += Math.random();
    return start + Math.pow(r/samples,skew) * (end - start);
  }

  /**
  * Create a sigmoid function.
  * @param {number} k Sharpness of ease.
  * @return {function} Sigmoid function.
  */
  sigmoidFactory(k) {
    // IMP: console.log(`sigmoidFactory function called at ${new Date().toISOString()}`);
    function base(t) { return (1 / (1 + Math.exp(-k * t))) - 0.5; }
    var corr = 0.5 / base(1);
    return function (t) { return corr * base(2 * Math.max(Math.min(t, 1), 0) - 1) + 0.5; };
  }

  /**
  * Convert value from one range to another.
  * @param {number} value Value
  * @param {number[]} r1 Source range
  * @param {number[]} r2 Target range
  * @return {number} Scaled value
  */
  convertRange( value, r1, r2 ) {
    console.log(`convertRange function called at ${new Date().toISOString()}`);
    return (value-r1[0]) * (r2[1]-r2[0]) / (r1[1]-r1[0]) + r2[0];
  }

  /**
  * Animate the avatar.
  * @param {number} t High precision timestamp in ms.
  */
  animate(t) {
    // console.log(`animate function called at ${new Date().toISOString()}`);

    // Are we running?
    if ( this.isRunning ) {
      requestAnimationFrame( this.animate.bind(this) );
    } else {
      return;
    }

    // Delta time
    let dt = t - this.animTimeLast;
    if ( dt < this.animFrameDur ) return;
    dt = dt / this.animSlowdownRate;
    this.animClock += dt;
    this.animTimeLast = t;

    // Statistics start
    if ( this.stats ) {
      this.stats.begin();
    }

    // Randomize facial expression
    if ( this.viewName !== 'full' ) {
      const randomizedMs = this.randomized[ Math.floor( Math.random() * this.randomized.length ) ];
      const v = this.getValue(randomizedMs);
      const vb = this.getBaselineValue(randomizedMs);
      if ( v === vb ) {
        const randomizedV = (this.mood.baseline[randomizedMs] || 0) + Math.random()/5;
        this.setBaselineValue(randomizedMs, randomizedV);
      }
    }

    // Start from baseline
    const o = {};
    for( let [mt,x] of Object.entries(this.animBaseline) ) {
      const v = this.getValue(mt);
      const restrain = ( this.isSpeaking && mt.startsWith("mouth") ) ? 3 : 1;
      const target = x.target / restrain;
      if ( v !== target ) {
        if ( x.t0 === undefined ) {
          x.t0 = this.animClock;
          x.v0 = v;
        }
        let delay = 1000;
        o[mt] = this.valueAnimationSeq( [x.t0,x.t0+delay], [x.v0,target], this.animClock, this.easing );
      } else {
        x.t0 = undefined;
      }
    }

    // Animations
    for( let i = 0; i < this.animQueue.length; i++ ) {
      const x = this.animQueue[i];
      if ( this.animClock >= x.ts[0] ) {
        for( let [mt,vs] of Object.entries(x.vs) ) {
          if ( mt === 'subtitles' ) {
            o[mt] = (o.hasOwnProperty(mt) ? o[mt] + vs : "" + vs);
            delete x.vs[mt];
          } else if ( mt === 'function' ) {
            vs.forEach( fn => {
              if ( fn && typeof fn === "function" ) {
                fn();
              }
            });
            delete x.vs[mt];
          } else if ( mt === 'speak' ) {
            o[mt] = (o.hasOwnProperty(mt) ? o[mt] + ' ' + vs : "" + vs);
            delete x.vs[mt];
          } else if ( mt === 'pose' ) {
            o[mt] = ""+vs[1];
            delete x.vs[mt];
          } else if ( mt === 'gesture' ) {
            for( let j=0; j<x.ts.length; j++ ) {
              if ( vs[j] && this.animClock >= x.ts[j] ) {
                o[mt] = vs[j];
                vs[j] = null;
              }
            }
          } else if ( mt === 'moveto' || mt ==='handLeft' || mt === 'handRight' ) {
            for( let j=0; j<x.ts.length; j++ ) {
              if ( vs[j] && this.animClock >= x.ts[j] ) {
                o[mt] = Object.assign(o[mt] || {}, vs[j]);
                vs[j] = null;
              }
            }
          } else {
            if ( vs[0] === null ) vs[0] = this.getValue(mt);
            o[mt] = this.valueAnimationSeq( x.ts, vs, this.animClock, this.easing );
            if ( this.animBaseline.hasOwnProperty(mt) ) this.animBaseline[mt].t0 = undefined;
            for( let j=0; j<i; j++ ) {
              if ( this.animQueue[j].vs.hasOwnProperty(mt) ) delete this.animQueue[j].vs[mt];
            }
          }
        }
        if ( this.animClock >= x.ts[x.ts.length-1] ) {
          if ( x.hasOwnProperty('mood') ) this.setMood(x.mood);
          if ( x.loop ) {
            let restrain = ( this.isSpeaking && (x.template.name === 'head' || x.template.name === 'eyes') ) ? 4 : 1;
            this.animQueue[i] = this.animFactory( x.template, (x.loop > 0 ? x.loop - 1 : x.loop), 1, 1/restrain );
          } else {
            this.animQueue.splice(i--, 1);
          }
        }
      }
    }

    // Set fixed
    for( let [mt,x] of Object.entries(this.animFixed) ) {
      const v = this.getValue(mt);
      if ( v !== x.target ) {
        if ( x.t0 === undefined ) {
          x.t0 = this.animClock;
          x.v0 = v;
        }
        let delay = 1000;
        o[mt] = this.valueAnimationSeq( [x.t0,x.t0+delay], [x.v0,x.target], this.animClock, this.easing );
      } else {
        if ( o.hasOwnProperty(mt) ) delete o[mt];
        x.t0 = undefined;
      }
      if ( this.animBaseline.hasOwnProperty(mt) ) this.animBaseline[mt].t0 = undefined;
    }

    // Update values
    for( let [mt,x] of Object.entries(o) ) {
      if ( mt === 'subtitles' ) {
        if( this.onSubtitles && typeof this.onSubtitles === "function" ) {
          this.onSubtitles(""+x);
        }
      } else if ( mt === 'speak' ) {
        this.speakText(""+x);
      } else if ( mt === 'pose' ) {
        this.poseName = ""+x;
        this.setPoseFromTemplate( this.poseTemplates[ this.poseName ] );
      } else if ( mt === 'gesture' ) {
        this.playGesture( ...x );
      }else if ( mt === 'moveto' ) {
        Object.entries(x.props).forEach( e => {
          if ( e[1] ) {
            this.poseTarget.props[e[0]].copy( e[1] );
          } else {
            this.poseTarget.props[e[0]].copy( this.getPoseTemplateProp(e[0]) );
          }
          this.poseTarget.props[e[0]].t = this.animClock;
          this.poseTarget.props[e[0]].d = (e[1] && e[1].d) ? e[1].d : (x.duration || 2000);
        });
      } else if ( mt === 'handLeft' ) {
        this.ikSolve( {
          iterations: 20, root: "LeftShoulder", effector: "LeftHandMiddle1",
          links: [
            { link: "LeftHand", minx: -0.5, maxx: 0.5, miny: -1, maxy: 1, minz: -0.5, maxz: 0.5 },
            { link: "LeftForeArm", minx: -0.5, maxx: 1.5, miny: -1.5, maxy: 1.5, minz: -0.5, maxz: 3 },
            { link: "LeftArm", minx: -1.5, maxx: 1.5, miny: 0, maxy: 0, minz: -1, maxz: 3 }
          ]
        }, x.x ? new THREE.Vector3(x.x,x.y,x.z) : null, true, x.d );
      } else if ( mt === 'handRight' ) {
        this.ikSolve( {
          iterations: 20, root: "RightShoulder", effector: "RightHandMiddle1",
          links: [
            { link: "RightHand", minx: -0.5, maxx: 0.5, miny: -1, maxy: 1, minz: -0.5, maxz: 0.5, maxAngle: 0.1 },
            { link: "RightForeArm", minx: -0.5, maxx: 1.5, miny: -1.5, maxy: 1.5, minz: -3, maxz: 0.5, maxAngle: 0.2 },
            { link: "RightArm", minx: -1.5, maxx: 1.5, miny: 0, maxy: 0, minz: -1, maxz: 3 }
          ]
        }, x.x ? new THREE.Vector3(x.x,x.y,x.z) : null, true, x.d );
      } else {
        this.setValue(mt,x);
      }
    }

    // Animate
    this.updatePoseBase(this.animClock);
    if ( this.mixer ) {
      this.mixer.update(dt / 1000 * this.mixer.timeScale);
    }
    this.updatePoseDelta();

    // Hip-feet balance
    const box = new THREE.Box3();
    box.setFromObject( this.armature );
    const ltoePos = new THREE.Vector3();
    const rtoePos = new THREE.Vector3();
    this.armature.getObjectByName('LeftToeBase').getWorldPosition(ltoePos);
    this.armature.getObjectByName('RightToeBase').getWorldPosition(rtoePos);
    const hips = this.armature.getObjectByName('Hips');
    hips.position.y -= box.min.y / 2;
    hips.position.x -= (ltoePos.x+rtoePos.x)/4;
    hips.position.z -= (ltoePos.z+rtoePos.z)/2;

    // Camera
    if ( this.cameraClock !== null && this.cameraClock < 1000 ) {
      this.cameraClock += dt;
      if ( this.cameraClock > 1000 ) this.cameraClock = 1000;
      let s = new THREE.Spherical().setFromVector3(this.cameraStart);
      let sEnd = new THREE.Spherical().setFromVector3(this.cameraEnd);
      s.phi += this.easing(this.cameraClock / 1000) * (sEnd.phi - s.phi);
      s.theta += this.easing(this.cameraClock / 1000) * (sEnd.theta - s.theta);
      s.radius += this.easing(this.cameraClock / 1000) * (sEnd.radius - s.radius);
      s.makeSafe();
      this.camera.position.setFromSpherical( s );
      if ( this.controlsStart.x !== this.controlsEnd.x ) {
        this.controls.target.copy( this.controlsStart.lerp( this.controlsEnd, this.easing(this.cameraClock / 1000) ) );
      } else {
        s.setFromVector3(this.controlsStart);
        sEnd.setFromVector3(this.controlsEnd);
        s.phi += this.easing(this.cameraClock / 1000) * (sEnd.phi - s.phi);
        s.theta += this.easing(this.cameraClock / 1000) * (sEnd.theta - s.theta);
        s.radius += this.easing(this.cameraClock / 1000) * (sEnd.radius - s.radius);
        s.makeSafe();
        this.controls.target.setFromSpherical( s );
      }
      this.controls.update();
    }

    // Autorotate
    if ( this.controls.autoRotate ) this.controls.update();

    // Statistics end
    if ( this.stats ) {
      this.stats.end();
    }

    this.render();

  }

  /**
  * Reset all the visemes
  */
  resetLips() {
    // IMP: console.log(`resetLips function called at ${new Date().toISOString()}`);
    this.visemeNames.forEach( x => {
      this.morphs.forEach( y => {
        const ndx = y.morphTargetDictionary['viseme_'+x];
        if ( ndx !== undefined ) {
          y.morphTargetInfluences[ndx] = 0;
        }
      });
    });
  }

  async handleAvatarMessage(msg) {

    try {
    //   const response = await fetch('http://localhost:8001/speak', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ text: s }),
    //   });

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const data = await response.json();
      
    //   if (data.speechQueue && Array.isArray(data.speechQueue)) {
    //     data.speechQueue.forEach(item => {
    //       this.speechQueue.push(item);
    //     });
    //   }
      this.speechQueue.push(msg)
      // Start speaking (if not already)
      this.startSpeakingHttp();
    } catch (error) {
      console.error('Error in handleAvatarMessage:', error);
    }
  }

//   /**
//   * Add emoji to speech queue.
//   * @param {string} e Emoji.
//   */
//   async speakEmoji(e) {
//     console.log(`speakEmoji function called at ${new Date().toISOString()}`);
//     let emoji = this.animEmojis[e];
//     if ( emoji && emoji.link ) emoji = this.animEmojis[emoji.link];
//     if ( emoji ) {
//       this.speechQueue.push( { emoji: emoji } );
//     }
//     this.startSpeaking();
//   }

//   /**
//   * Add a break to the speech queue.
//   * @param {numeric} t Duration in milliseconds.
//   */
//   async speakBreak(t) {
//     console.log(`speakBreak function called at ${new Date().toISOString()}`);
//     this.speechQueue.push( { break: t } );
//     this.startSpeaking();
//   }

//   /**
//   * Callback when speech queue processes this marker.
//   * @param {markerfn} onmarker Callback function.
//   */
//   async speakMarker(onmarker) {
//     console.log(`speakMarker function called at ${new Date().toISOString()}`);
//     this.speechQueue.push( { marker: onmarker } );
//     this.startSpeakingHttp();
//   }

  /**
  * Play background audio.
  * @param {string} url URL for the audio, stop if null.
  */
//   async playBackgroundAudio( url ) {
//     console.log(`playBackgroundAudio function called at ${new Date().toISOString()}`);

//     // Fetch audio
//     let response = await fetch(url);
//     let arraybuffer = await response.arrayBuffer();

//     // Play audio in a loop
//     this.stopBackgroundAudio()
//     this.audioBackgroundSource = this.audioCtx.createBufferSource();
//     this.audioBackgroundSource.loop = true;
//     this.audioBackgroundSource.buffer = await this.audioCtx.decodeAudioData(arraybuffer);
//     this.audioBackgroundSource.playbackRate.value = 1 / this.animSlowdownRate;
//     this.audioBackgroundSource.connect(this.audioBackgroundGainNode);
//     this.audioBackgroundSource.start(0);

//   }

  /**
  * Stop background audio.
  */
//   stopBackgroundAudio() {
//     console.log(`stopBackgroundAudio function called at ${new Date().toISOString()}`);
//     try { this.audioBackgroundSource.stop(); } catch(error) {}
//     this.audioBackgroundSource.disconnect();
//   }

  /**
  * Setup the convolver node based on an impulse.
  * @param {string} [url=null] URL for the impulse, dry impulse if null
  */
  async setReverb( url=null ) {
    if ( url ) {
      // load impulse response from file
      let response = await fetch(url);
      let arraybuffer = await response.arrayBuffer();
      this.audioReverbNode.buffer = await this.audioCtx.decodeAudioData(arraybuffer);
    } else {
      // dry impulse
      const samplerate = this.audioCtx.sampleRate;
      const impulse = this.audioCtx.createBuffer(2, samplerate, samplerate);
      impulse.getChannelData(0)[0] = 1;
      impulse.getChannelData(1)[0] = 1;
      this.audioReverbNode.buffer = impulse;
    }
  }

  /**
  * Set audio gain.
  * @param {number} speech Gain for speech, if null do not change
  * @param {number} background Gain for background audio, if null do not change
  */
  setMixerGain( speech, background ) {
    if ( speech !== null ) {
      this.audioSpeechGainNode.gain.value = speech || 0;
    }
    if ( background !== null ) {
      this.audioBackgroundGainNode.gain.value = background || 0;
    }
  }

  /**
  * Add audio to the speech queue.
  * @param {Audio} r Audio message.
  * @param {Options} [opt=null] Text-specific options for lipsyncLang
  * @param {subtitlesfn} [onsubtitles=null] Callback when a subtitle is written
  */
  speakAudio(r, opt = null, onsubtitles = null ) {
    console.log(`speakAudio function called at ${new Date().toISOString()}`);
    opt = opt || {};
    const lipsyncLang = opt.lipsyncLang || this.avatar.lipsyncLang || this.opt.lipsyncLang;
    const o = {};


    if ( r.words ) {
      let lipsyncAnim = [];
      for( let i=0; i<r.words.length; i++ ) {
        const word = r.words[i];
        const time = r.wtimes[i];
        let duration = r.wdurations[i];

        if ( word.length ) {

          // Subtitle
          if ( onsubtitles ) {
            lipsyncAnim.push( {
              template: { name: 'subtitles' },
              ts: [time],
              vs: {
                subtitles: ' ' + word
              }
            });
          }

          // If visemes were not specified, calculate them based on the word
          if ( !r.visemes ) {
            const w = this.lipsyncPreProcessText(word, lipsyncLang);
            const v = this.lipsyncWordsToVisemes(w, lipsyncLang);
            if ( v && v.visemes && v.visemes.length ) {
              const dTotal = v.times[ v.visemes.length-1 ] + v.durations[ v.visemes.length-1 ];
              const overdrive = Math.min(duration, Math.max( 0, duration - v.visemes.length * 150));
              let level = 0.6 + this.convertRange( overdrive, [0,duration], [0,0.4]);
              duration = Math.min( duration, v.visemes.length * 200 );
              if ( dTotal > 0 ) {
                for( let j=0; j<v.visemes.length; j++ ) {
                  const t = time + (v.times[j]/dTotal) * duration;
                  const d = (v.durations[j]/dTotal) * duration;
                  lipsyncAnim.push( {
                    template: { name: 'viseme' },
                    ts: [ t - Math.min(60,2*d/3), t + Math.min(25,d/2), t + d + Math.min(60,d/2) ],
                    vs: {
                      ['viseme_'+v.visemes[j]]: [null,(v.visemes[j] === 'PP' || v.visemes[j] === 'FF') ? 0.9 : level, 0]
                    }
                  });
                }
              }
            }
          }
        }
      }

      // If visemes were specifies, use them
      if ( r.visemes ) {
        for( let i=0; i<r.visemes.length; i++ ) {
          const viseme = r.visemes[i];
          const time = r.vtimes[i];
          const duration = r.vdurations[i];
          lipsyncAnim.push( {
            template: { name: 'viseme' },
            ts: [ time - 2 * duration/3, time + duration/2, time + duration + duration/2 ],
            vs: {
              ['viseme_'+viseme]: [null,(viseme === 'PP' || viseme === 'FF') ? 0.9 : 0.6, 0]
            }
          });
        }
      }

      // Timed marker callbacks
      if ( r.markers ) {
        for( let i=0; i<r.markers.length; i++ ) {
          const fn = r.markers[i];
          const time = r.mtimes[i];
          lipsyncAnim.push( {
            template: { name: 'markers' },
            ts: [ time ],
            vs: { "function": [fn] }
          });
        }
      }

      if ( lipsyncAnim.length ) {
        o.anim = lipsyncAnim;
      }

    }

    if ( r.audio ) {
      o.audio = r.audio;
    }

    if ( onsubtitles ) {
      o.onSubtitles = onsubtitles;
    }

    if ( Object.keys(o).length ) {
      this.speechQueue.push(o);
      this.speechQueue.push( { break: 300 } );
      this.startSpeaking();
    }
  }

  /**
  * Play audio playlist using Web Audio API.
  * @param {boolean} [force=false] If true, forces to proceed
  */
  async playAudioHttp(force=false) {
    console.log(`playAudioHttp function called at ${new Date().toISOString()}`);
    if ( !this.armature || (this.isAudioPlaying && !force) ) return;
    this.isAudioPlaying = true;
    if ( this.audioPlaylist.length ) {
      const item = this.audioPlaylist.shift();

      // If Web Audio API is suspended, try to resume it
      if ( this.audioCtx.state === "suspended" || this.audioCtx.state === "interrupted" ) {
        const resume = this.audioCtx.resume();
        const timeout = new Promise((_r, rej) => setTimeout(() => rej("p2"), 1000));
        try {
          await Promise.race([resume, timeout]);
        } catch(e) {
          console.log("Can't play audio. Web Audio API suspended. This is often due to calling some speak method before the first user action, which is typically prevented by the browser.");
          this.playAudioHttp(true);
          return;
        }
      }

      // AudioBuffer
      let audio;
      if ( Array.isArray(item.audio) ) {
        // Convert from PCM samples
        let buf = this.concatArrayBuffers( item.audio );
        audio = this.pcmToAudioBuffer(buf);
      } else {
        audio = item.audio;
      }

      // Create audio source
      this.audioSpeechSource = this.audioCtx.createBufferSource();
      this.audioSpeechSource.buffer = audio;
      this.audioSpeechSource.playbackRate.value = 1 / this.animSlowdownRate;
      this.audioSpeechSource.connect(this.audioSpeechGainNode);
      this.audioSpeechSource.addEventListener('ended', () => {
        this.audioSpeechSource.disconnect();
        this.playAudioHttp(true);
      }, { once: true });

      // Rescale lipsync and push to queue
      const delay = 100;
      if ( item.anim ) {
        item.anim.forEach( x => {
          for(let i=0; i<x.ts.length; i++) {
            x.ts[i] = this.animClock + x.ts[i] + delay;
          }
          this.animQueue.push(x);
        });
      }

      // Play
      this.audioSpeechSource.start(delay/1000);

    } else {
      this.isAudioPlaying = false;
      this.startSpeakingHttp(true);
    }
  }
  async speakTextHttp(line) {
    try {
      this.speechQueue.push(line);
      // Start speaking (if not already)
      this.startSpeakingHttp();
    } catch (error) {
      console.error('Error in speakTextHttp:', error);
    }
  }

    /**
  * Take the next queue item from the speech queue, convert it to text, and
  * load the audio file.
  * @param {boolean} [force=false] If true, forces to proceed (e.g. after break)
  */
    async startSpeakingHttp(force = false ) {
      if ( !this.armature || (this.isSpeaking && !force) ) return;
      this.stateName = 'talking';
      this.isSpeaking = true;
      // wait for a message otherwise do the idle thing
      if ( this.speechQueue.length ) {
        let line = this.speechQueue.shift();
        if ( line.emoji ) {
  
          // Look at the camera
          this.lookAtCamera(500);
  
          // Only emoji
          let duration = line.emoji.dt.reduce((a,b) => a+b,0);
          this.animQueue.push( this.animFactory( line.emoji ) );
          setTimeout( this.startSpeakingHttp.bind(this), duration, true );
        } else if ( line.break ) {
          // Break
          setTimeout( this.startSpeakingHttp.bind(this), line.break, true );
        } else if ( line.audio ) {
  
          // Look at the camera
          this.lookAtCamera(500);
          this.speakWithHands();
  
          // Make a playlist
          this.audioPlaylist.push({ anim: line.anim, audio: line.audio });
          this.onSubtitles = line.onSubtitles || null;
          this.resetLips();
          if ( line.mood ) this.setMood( line.mood );
          this.playAudioHttp();
  
        } else if ( line.text ) {
          // Look at the camera
          this.lookAtCamera(500);
  
          // Spoken text
          try {
            const data = line.data
  
            // if ( res.ok && data && data.audioContent ) {
            if ( data && data.audioContent ) {
  
              // Audio data
              const buf = this.b64ToArrayBuffer(data.audioContent);
              const audio = await this.audioCtx.decodeAudioData( buf );
              this.speakWithHands();
  
              // Workaround for Google TTS not providing all timepoints
              const times = [ 0 ];
              let markIndex = 0;
              line.text.forEach( (x,i) => {
                if ( i > 0 ) {
                  let ms = times[ times.length - 1 ];
                  if ( data.timepoints[markIndex] ) {
                    ms = data.timepoints[markIndex].timeSeconds * 1000;
                    if ( data.timepoints[markIndex].markName === ""+x.mark ) {
                      markIndex++;
                    }
                  }
                  times.push( ms );
                }
              });
  
              // Word-to-audio alignment
              const timepoints = [ { mark: 0, time: 0 } ];
              times.forEach( (x,i) => {
                if ( i>0 ) {
                  let prevDuration = x - times[i-1];
                  if ( prevDuration > 150 ) prevDuration - 150; // Trim out leading space
                  timepoints[i-1].duration = prevDuration;
                  timepoints.push( { mark: i, time: x });
                }
              });
              let d = 1000 * audio.duration; // Duration in ms
              if ( d > this.opt.ttsTrimEnd ) d = d - this.opt.ttsTrimEnd; // Trim out silence at the end
              timepoints[timepoints.length-1].duration = d - timepoints[timepoints.length-1].time;
  
              // Re-set animation starting times and rescale durations
              line.anim.forEach( x => {
                const timepoint = timepoints[x.mark];
                if ( timepoint ) {
                  for(let i=0; i<x.ts.length; i++) {
                    x.ts[i] = timepoint.time + (x.ts[i] * timepoint.duration) + this.opt.ttsTrimStart;
                  }
                }
              });
  
              // Add to the playlist
              this.audioPlaylist.push({ anim: line.anim, audio: audio });
              this.onSubtitles = line.onSubtitles || null;
              this.resetLips();
              if ( line.mood ) this.setMood( line.mood );
              this.playAudioHttp();
  
            } else {
              this.startSpeakingHttp(true);
            }
          } catch (error) {
            console.error("Error:", error);
            this.startSpeakingHttp(true);
          }
        } else if ( line.anim ) {
          // Only subtitles
          this.onSubtitles = line.onSubtitles || null;
          this.resetLips();
          if ( line.mood ) this.setMood( line.mood );
          line.anim.forEach( (x,i) => {
            for(let j=0; j<x.ts.length; j++) {
              x.ts[j] = this.animClock  + 10 * i;
            }
            this.animQueue.push(x);
          });
          setTimeout( this.startSpeakingHttp.bind(this), 10 * line.anim.length, true );
        } else if ( line.marker ) {
          if ( typeof line.marker === "function" ) {
            line.marker();
          }
          this.startSpeakingHttp(true);
        } else {
          this.startSpeakingHttp(true);
        }
      } else {
        this.stateName = 'idle';
        this.isSpeaking = false;
      }
    }

  /**
  * Pause speaking.
  */
  pauseSpeaking() {
    // IMP: console.log(`pauseSpeaking function called at ${new Date().toISOString()}`);
    try { this.audioSpeechSource.stop(); } catch(error) {}
    this.audioPlaylist.length = 0;
    this.stateName = 'idle';
    this.isSpeaking = false;
    this.isAudioPlaying = false;
    this.animQueue = this.animQueue.filter( x  => x.template.name !== 'viseme' && x.template.name !== 'subtitles' );
    if ( this.armature ) {
      this.resetLips();
      this.render();
    }
  }

  /**
  * Stop speaking and clear the speech queue.
  */
  stopSpeaking() {
    // IMP: console.log(`stopSpeaking function called at ${new Date().toISOString()}`);
    try { this.audioSpeechSource.stop(); } catch(error) {}
    this.audioPlaylist.length = 0;
    this.speechQueue.length = 0;
    this.animQueue = this.animQueue.filter( x  => x.template.name !== 'viseme' && x.template.name !== 'subtitles' );
    this.stateName = 'idle';
    this.isSpeaking = false;
    this.isAudioPlaying = false;
    if ( this.armature ) {
      this.resetLips();
      this.render();
    }
  }

  /**
  * Turn head and eyes to look at the camera.
  * @param {number} t Time in milliseconds
  */
  lookAtCamera(t) {
    // IMP: console.log(`lookAtCamera function called at ${new Date().toISOString()}`);
    this.lookAt( null, null, t );
  }

  /**
  * Turn head and eyes to look at the point (x,y).
  * @param {number} x X-coordinate relative to visual viewport
  * @param {number} y Y-coordinate relative to visual viewport
  * @param {number} t Time in milliseconds
  */
  lookAt(x,y,t) {
    // IMP: console.log(`lookAt function called at ${new Date().toISOString()}`);

    // Eyes position
    const rect = this.nodeAvatar.getBoundingClientRect();
    const lEye = this.armature.getObjectByName('LeftEye');
    const rEye = this.armature.getObjectByName('RightEye');
    lEye.updateMatrixWorld(true);
    rEye.updateMatrixWorld(true);
    const plEye = new THREE.Vector3().setFromMatrixPosition(lEye.matrixWorld);
    const prEye = new THREE.Vector3().setFromMatrixPosition(rEye.matrixWorld);
    const pEyes = new THREE.Vector3().addVectors( plEye, prEye ).divideScalar( 2 );
    pEyes.project(this.camera);
    let eyesx = (pEyes.x + 1) / 2 * rect.width + rect.left;
    let eyesy  = -(pEyes.y - 1) / 2 * rect.height + rect.top;

    // if coordinate not specified, look at the camera
    if ( x === null ) x = eyesx;
    if ( y === null ) y = eyesy;

    // Use body/camera rotation to determine the required head rotation
    let q = this.poseTarget.props['Hips.quaternion'].clone();
    q.multiply( this.poseTarget.props['Spine.quaternion'] );
    q.multiply( this.poseTarget.props['Spine1.quaternion'] );
    q.multiply( this.poseTarget.props['Spine2.quaternion'] );
    q.multiply( this.poseTarget.props['Neck.quaternion'] );
    q.multiply( this.poseTarget.props['Head.quaternion'] );
    let e = new THREE.Euler().setFromQuaternion(q);
    let rx = e.x / (40/24); // Refer to setValue(headRotateX)
    let ry = e.y / (9/4); // Refer to setValue(headRotateY)
    let camerarx = Math.min(0.4, Math.max(-0.4,this.camera.rotation.x));
    let camerary = Math.min(0.4, Math.max(-0.4,this.camera.rotation.y));

    // Calculate new delta
    let maxx = Math.max( window.innerWidth - eyesx, eyesx );
    let maxy = Math.max( window.innerHeight - eyesy, eyesy );
    let rotx = this.convertRange(y,[eyesy-maxy,eyesy+maxy],[-0.3,0.6]) - rx + camerarx;
    let roty = this.convertRange(x,[eyesx-maxx,eyesx+maxx],[-0.8,0.8]) - ry + camerary;
    rotx = Math.min(0.6,Math.max(-0.3,rotx));
    roty = Math.min(0.8,Math.max(-0.8,roty));

    // Randomize head/eyes ratio
    let drotx = (Math.random() - 0.5) / 4;
    let droty = (Math.random() - 0.5) / 4;

    if ( t ) {

      // Remove old, if any
      let old = this.animQueue.findIndex( y => y.template.name === 'lookat' );
      if ( old !== -1 ) {
        this.animQueue.splice(old, 1);
      }

      // Add new anim
      const templateLookAt = {
        name: 'lookat',
        dt: [750,t],
        vs: {
          headRotateX: [ rotx + drotx ],
          headRotateY: [ roty + droty ],
          eyesRotateX: [ - 3 * drotx + 0.1 ],
          eyesRotateY: [ - 5 * droty ],
          browInnerUp: [[0,0.7]],
          mouthLeft: [[0,0.7]],
          mouthRight: [[0,0.7]]
        }
      };
      this.animQueue.push( this.animFactory( templateLookAt ) );
    }
  }


  /**
  * Set the closest hand to touch at (x,y).
  * @param {number} x X-coordinate relative to visual viewport
  * @param {number} y Y-coordinate relative to visual viewport
  * @return {Boolean} If true, (x,y) touch the avatar
  */
  touchAt(x,y) {
    // IMP: console.log(`touchAt function called at ${new Date().toISOString()}`);

    const rect = this.nodeAvatar.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ( (x - rect.left) / rect.width ) * 2 - 1,
      - ( (y - rect.top) / rect.height ) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer,this.camera);
    const intersects = raycaster.intersectObject(this.armature);
    if ( intersects.length > 0 ) {
      const target = intersects[0].point;
      const LeftArmPos = new THREE.Vector3();
      const RightArmPos = new THREE.Vector3();
      this.armature.getObjectByName('LeftArm').getWorldPosition(LeftArmPos);
      this.armature.getObjectByName('RightArm').getWorldPosition(RightArmPos);
      const LeftD2 = LeftArmPos.distanceToSquared(target);
      const RightD2 = RightArmPos.distanceToSquared(target);
      if ( LeftD2 < RightD2 ) {
        this.ikSolve( {
          iterations: 20, root: "LeftShoulder", effector: "LeftHandMiddle1",
          links: [
            { link: "LeftHand", minx: -0.5, maxx: 0.5, miny: -1, maxy: 1, minz: -0.5, maxz: 0.5, maxAngle: 0.1 },
            { link: "LeftForeArm", minx: -0.5, maxx: 1.5, miny: -1.5, maxy: 1.5, minz: -0.5, maxz: 3, maxAngle: 0.2 },
            { link: "LeftArm", minx: -1.5, maxx: 1.5, miny: 0, maxy: 0, minz: -1, maxz: 3 }
          ]
        }, target, false, 1000 );
        this.setValue("handFistLeft",0);
      } else {
        this.ikSolve( {
          iterations: 20, root: "RightShoulder", effector: "RightHandMiddle1",
          links: [
            { link: "RightHand", minx: -0.5, maxx: 0.5, miny: -1, maxy: 1, minz: -0.5, maxz: 0.5, maxAngle: 0.1 },
            { link: "RightForeArm", minx: -0.5, maxx: 1.5, miny: -1.5, maxy: 1.5, minz: -3, maxz: 0.5, maxAngle: 0.2 },
            { link: "RightArm", minx: -1.5, maxx: 1.5, miny: 0, maxy: 0, minz: -1, maxz: 3 }
          ]
        }, target, false, 1000 );
        this.setValue("handFistRight",0);
      }
    } else {
      ["LeftArm","LeftForeArm","LeftHand","RightArm","RightForeArm","RightHand"].forEach( x => {
        let key = x + ".quaternion";
        this.poseTarget.props[key].copy( this.getPoseTemplateProp(key) );
        this.poseTarget.props[key].t = this.animClock;
        this.poseTarget.props[key].d = 1000;
      });
    }

    return ( intersects.length > 0 );
  }

  /**
  * Talk with hands.
  * @param {number} [delay=0] Delay in milliseconds
  * @param {number} [prob=1] Probability of hand movement
  */
  speakWithHands(delay=0,prob=0.5) {
    // IMP: console.log(`speakWithHands function called at ${new Date().toISOString()}`);

    // Only if we are standing and not bending and probabilities match up
    if ( this.mixer || this.gesture || !this.poseTarget.template.standing || this.poseTarget.template.bend || Math.random()>prob ) return;

    // Random targets for left hand
    this.ikSolve( {
      root: "LeftShoulder", effector: "LeftHandMiddle1",
      links: [
        { link: "LeftHand", minx: -0.5, maxx: 0.5, miny: -1, maxy: 1, minz: -0.5, maxz: 0.5 },
        { link: "LeftForeArm", minx: -0.5, maxx: 1.5, miny: -1.5, maxy: 1.5, minz: -0.5, maxz: 3 },
        { link: "LeftArm", minx: -1.5, maxx: 1.5, miny: -1.5, maxy: 1.5, minz: -1, maxz: 3 }
      ]
    }, new THREE.Vector3(
      this.gaussianRandom(0,0.5),
      this.gaussianRandom(-0.8,-0.2),
      this.gaussianRandom(0,0.5)
    ), true);

    // Random target for right hand
    this.ikSolve( {
      root: "RightShoulder", effector: "RightHandMiddle1",
      links: [
        { link: "RightHand", minx: -0.5, maxx: 0.5, miny: -1, maxy: 1, minz: -0.5, maxz: 0.5 },
        { link: "RightForeArm", minx: -0.5, maxx: 1.5, miny: -1.5, maxy: 1.5, minz: -3, maxz: 0.5 },
        { link: "RightArm" }
      ]
    }, new THREE.Vector3(
      this.gaussianRandom(-0.5,0),
      this.gaussianRandom(-0.8,-0.2),
      this.gaussianRandom(0,0.5)
    ), true);

    // Moveto
    const dt = [];
    const moveto = [];

    // First move
    dt.push( 100 + Math.round( Math.random() * 500 ) );
    moveto.push( { duration: 1000, props: {
      "LeftHand.quaternion": new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, -1 - Math.random(), 0 ) ),
      "RightHand.quaternion": new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, 1 + Math.random(), 0 ) )
    } } );
    ["LeftArm","LeftForeArm","RightArm","RightForeArm"].forEach( x => {
      moveto[0].props[x+'.quaternion'] = this.ikMesh.getObjectByName(x).quaternion.clone();
    });

    // Return to original target
    dt.push( 1000 + Math.round( Math.random() * 500 ) );
    moveto.push( { duration: 2000, props: {} } );
    ["LeftArm","LeftForeArm","RightArm","RightForeArm","LeftHand","RightHand"].forEach( x => {
      moveto[1].props[x+'.quaternion'] = null;
    });

    // Make an animation
    const anim = this.animFactory( {
      name: 'talkinghands',
      delay: delay,
      dt: dt,
      vs: { moveto: moveto }
    });
    this.animQueue.push( anim );

  }

  /**
  * Get slowdown.
  * @return {numeric} Slowdown factor.
  */
  getSlowdownRate(k) {
    // IMP: console.log(`getSlowdownRate function called at ${new Date().toISOString()}`);
    return this.animSlowdownRate;
  }

  /**
  * Set slowdown.
  * @param {numeric} k Slowdown factor.
  */
  setSlowdownRate(k) {
    // IMP: console.log(`setSlowdownRate function called at ${new Date().toISOString()} with value: ${k}`);
    this.animSlowdownRate = k;
    this.audioSpeechSource.playbackRate.value = 1 / this.animSlowdownRate;
    this.audioBackgroundSource.playbackRate.value = 1 / this.animSlowdownRate;
  }

  /**
  * Get autorotate speed.
  * @return {numeric} Autorotate speed.
  */
  getAutoRotateSpeed(k) {
    return this.controls.autoRotateSpeed;
  }

  /**
  * Set autorotate.
  * @param {numeric} speed Autorotate speed, e.g. value 2 = 30 secs per orbit at 60fps.
  */
  setAutoRotateSpeed(speed) {
    this.controls.autoRotateSpeed = speed;
    this.controls.autoRotate = (speed > 0);
  }

  /**
  * Start animation cycle.
  */
  start() {
    if ( this.armature && this.isRunning === false ) {
      this.audioCtx.resume();
      this.animTimeLast = performance.now();
      this.isRunning = true;
      requestAnimationFrame( this.animate.bind(this) );
    }
  }

  /**
  * Stop animation cycle.
  */
  stop() {
    this.isRunning = false;
    this.audioCtx.suspend();
  }

  /**
  * Play RPM/Mixamo animation clip.
  * @param {string|Object} url URL to animation file FBX
  * @param {progressfn} [onprogress=null] Callback for progress
  * @param {number} [dur=10] Duration in seconds, but at least once
  * @param {number} [ndx=0] Index of the clip
  * @param {number} [scale=0.01] Position scale factor
  */
  async playAnimation(url, onprogress=null, dur=10, ndx=0, scale=0.01) {
    // IMP: console.log(`playAnimation called at ${new Date().toISOString()}`);
    if ( !this.armature ) return;

    let item = this.animClips.find( x => x.url === url+'-'+ndx );
    if ( item ) {

      // Reset pose update
      let anim = this.animQueue.find( x => x.template.name === 'pose' );
      if ( anim ) {
        anim.ts[0] = Infinity;
      }

      // Set new pose
      Object.entries(item.pose.props).forEach( x => {
        this.poseBase.props[x[0]] = x[1].clone();
        this.poseTarget.props[x[0]] = x[1].clone();
        this.poseTarget.props[x[0]].t = 0;
        this.poseTarget.props[x[0]].d = 1000;
      });

      // Create a new mixer
      this.mixer = new THREE.AnimationMixer(this.armature);
      this.mixer.addEventListener( 'finished', this.stopAnimation.bind(this), { once: true });

      // Play action
      const repeat = Math.ceil(dur / item.clip.duration);
      const action = this.mixer.clipAction(item.clip);
      action.setLoop( THREE.LoopRepeat, repeat );
      action.clampWhenFinished = true;
      action.fadeIn(0.5).play();

    } else {

      // Load animation
      const loader = new FBXLoader();

      let fbx = await loader.loadAsync( url, onprogress );

      if ( fbx && fbx.animations && fbx.animations[ndx] ) {
        let anim = fbx.animations[ndx];

        // Rename and scale Mixamo tracks, create a pose
        const props = {};
        anim.tracks.forEach( t => {
          t.name = t.name.replaceAll('mixamorig','');
          const ids = t.name.split('.');
          if ( ids[1] === 'position' ) {
            for(let i=0; i<t.values.length; i++ ) {
              t.values[i] = t.values[i] * scale;
            }
            props[t.name] = new THREE.Vector3(t.values[0],t.values[1],t.values[2]);
          } else if ( ids[1] === 'quaternion' ) {
            props[t.name] = new THREE.Quaternion(t.values[0],t.values[1],t.values[2],t.values[3]);
          } else if ( ids[1] === 'rotation' ) {
            props[ids[0]+".quaternion"] = new THREE.Quaternion().setFromEuler(new THREE.Euler(t.values[0],t.values[1],t.values[2],'XYZ')).normalize();
          }

        });

        // Add to clips
        const newPose = { props: props };
        if ( props['Hips.position'] ) {
          if ( props['Hips.position'].y < 0.5 ) {
            newPose.lying = true;
          } else {
            newPose.standing = true;
          }
        }
        this.animClips.push({
          url: url+'-'+ndx,
          clip: anim,
          pose: newPose
        });

        // Play
        this.playAnimation(url, onprogress, dur, ndx, scale);

      } else {
        const msg = 'Animation ' + url + ' (ndx=' + ndx + ') not found';
        console.error(msg);
      }
    }
  }

  /**
  * Stop running animations.
  */
  stopAnimation() {

    // Stop mixer
    this.mixer = null;

    // Restart gesture
    if ( this.gesture ) {
      for( let [p,v] of Object.entries(this.gesture) ) {
        v.t = this.animClock;
        v.d = 1000;
        if ( this.poseTarget.props.hasOwnProperty(p) ) {
          this.poseTarget.props[p].copy(v);
          this.poseTarget.props[p].t = this.animClock;
          this.poseTarget.props[p].d = 1000;
        }
      }
    }

    // Restart pose animation
    let anim = this.animQueue.find( x => x.template.name === 'pose' );
    if ( anim ) {
      anim.ts[0] = this.animClock;
    }
    this.setPoseFromTemplate( null );

  }


  /**
  * Play RPM/Mixamo pose.
  * @param {string|Object} url Pose name | URL to FBX
  * @param {progressfn} [onprogress=null] Callback for progress
  * @param {number} [dur=5] Duration of the pose in seconds
  * @param {number} [ndx=0] Index of the clip
  * @param {number} [scale=0.01] Position scale factor
  */
  async playPose(url, onprogress=null, dur=5, ndx=0, scale=0.01) {
    // IMP: console.log(`playPose function called at ${new Date().toISOString()}`);

    if ( !this.armature ) return;

    // Check if we already have the pose template ready
    let pose = this.poseTemplates[url];
    if ( !pose ) {
      const item = this.animPoses.find( x => x.url === url+'-'+ndx );
      if ( item ) {
        pose = item.pose;
      }
    }

    // If we have the template, use it, otherwise try to load it
    if ( pose ) {

      this.poseName = url;

      this.mixer = null;
      let anim = this.animQueue.find( x => x.template.name === 'pose' );
      if ( anim ) {
        anim.ts[0] = this.animClock + (dur * 1000) + 2000;
      }
      this.setPoseFromTemplate( pose );

    } else {

      // Load animation
      const loader = new FBXLoader();

      let fbx = await loader.loadAsync( url, onprogress );

      if ( fbx && fbx.animations && fbx.animations[ndx] ) {
        let anim = fbx.animations[ndx];

        // Create a pose
        const props = {};
        anim.tracks.forEach( t => {

          // Rename and scale Mixamo tracks
          t.name = t.name.replaceAll('mixamorig','');
          const ids = t.name.split('.');
          if ( ids[1] === 'position' ) {
            props[t.name] = new THREE.Vector3( t.values[0] * scale, t.values[1] * scale, t.values[2] * scale);
          } else if ( ids[1] === 'quaternion' ) {
            props[t.name] = new THREE.Quaternion( t.values[0], t.values[1], t.values[2], t.values[3] );
          } else if ( ids[1] === 'rotation' ) {
            props[ids[0]+".quaternion"] = new THREE.Quaternion().setFromEuler(new THREE.Euler( t.values[0], t.values[1], t.values[2],'XYZ' )).normalize();
          }
        });

        // Add to pose
        const newPose = { props: props };
        if ( props['Hips.position'] ) {
          if ( props['Hips.position'].y < 0.5 ) {
            newPose.lying = true;
          } else {
            newPose.standing = true;
          }
        }
        this.animPoses.push({
          url: url+'-'+ndx,
          pose: newPose
        });

        // Play
        this.playPose(url, onprogress, dur, ndx, scale);

      } else {
        const msg = 'Pose ' + url + ' (ndx=' + ndx + ') not found';
        console.error(msg);
      }
    }
  }

  /**
  * Stop the pose. (Functionality is the same as in stopAnimation.)
  */
  stopPose() {
    // IMP: console.log(`stopPose function called at ${new Date().toISOString()}`);
    this.stopAnimation();
  }

  /**
  * Play a gesture, which is either a hand gesture, an emoji animation or their
  * combination.
  * @param {string} name Gesture name
  * @param {number} [dur=3] Duration of the gesture in seconds
  * @param {boolean} [mirror=false] Mirror gesture
  * @param {number} [ms=1000] Transition time in milliseconds
  */
  playGesture(name, dur=3, mirror=false, ms=1000) {
    // IMP: console.log(`playGesture function called at ${new Date().toISOString()}`);

    if ( !this.armature ) return;

    // Hand gesture, if any
    let g = this.gestureTemplates[name];
    if ( g ) {

      // New gesture always overrides the existing one
      if ( this.gestureTimeout ) {
        clearTimeout( this.gestureTimeout );
        this.gestureTimeout = null;
      }

      // Stop talking hands animation
      let ndx = this.animQueue.findIndex( y => y.template.name === "talkinghands" );
      if ( ndx !== -1 ) {
        this.animQueue[ndx].ts = this.animQueue[ndx].ts.map( x => 0 );
      }

      // Set gesture
      this.gesture = this.propsToThreeObjects( g );
      if ( mirror ) {
        this.gesture = this.mirrorPose( this.gesture );
      }
      if ( name === "namaste" && this.avatar.body === 'M' ) {
        // Work-a-round for male model so that the hands meet
        this.gesture["RightArm.quaternion"].rotateTowards( new THREE.Quaternion(0,1,0,0), -0.25);
        this.gesture["LeftArm.quaternion"].rotateTowards( new THREE.Quaternion(0,1,0,0), -0.25);
      }

      // Apply to target
      for( let [p,v] of Object.entries(this.gesture) ) {
        v.t = this.animClock;
        v.d = ms;
        if ( this.poseTarget.props.hasOwnProperty(p) ) {
          this.poseTarget.props[p].copy(v);
          this.poseTarget.props[p].t = this.animClock;
          this.poseTarget.props[p].d = ms;
        }
      }

      // Timer
      if ( dur && Number.isFinite(dur) ) {
        this.gestureTimeout = setTimeout( this.stopGesture.bind(this,ms), 1000 * dur);
      }
    }

    // Animated emoji, if any
    let e = this.animEmojis[name];
    if ( e ) {

      // Follow link
      if ( e && e.link ) {
        e = this.animEmojis[e.link];
      }

      if ( e ) {
        // Look at the camera for 500 ms
        this.lookAtCamera(500);

        // Create animation and tag as gesture
        const anim = this.animFactory( e );
        anim.gesture = true;

        // Rescale duration
        if ( dur && Number.isFinite(dur) ) {
          const first = anim.ts[0];
          const last = anim.ts[ anim.ts.length -1 ];
          const scale = (1000 * dur) / (last-first);
          anim.ts = anim.ts.map( x => first + scale * (x - first) );
        }

        this.animQueue.push( anim );
      }
    }

  }

  /**
  * Stop the gesture.
  * @param {number} [ms=1000] Transition time in milliseconds
  */
  stopGesture(ms=1000) {
    // IMP: console.log(`stopGesture called with time: ${new Date().toISOString()}ms`);

    // Stop gesture timer
    if ( this.gestureTimeout ) {
      clearTimeout( this.gestureTimeout );
      this.gestureTimeout = null;
    }

    // Stop hand gesture, if any
    if ( this.gesture ) {
      const gs = Object.entries(this.gesture);
      this.gesture = null;
      for( const [p,v] of gs ) {
        if ( this.poseTarget.props.hasOwnProperty(p) ) {
          this.poseTarget.props[p].copy( this.getPoseTemplateProp(p) );
          this.poseTarget.props[p].t = this.animClock;
          this.poseTarget.props[p].d = ms;
        }
      }
    }

    // Stop animated emoji gesture, if any
    let i = this.animQueue.findIndex( y => y.gesture );
    if ( i !== -1 ) {
      this.animQueue.splice(i, 1);
    }

  }

  /**
  * Cyclic Coordinate Descent (CCD) Inverse Kinematic (IK) algorithm.
  * Adapted from:
  * https://github.com/mrdoob/three.js/blob/master/examples/jsm/animation/CCDIKSolver.js
  * @param {Object} ik IK configuration object
  * @param {Vector3} [target=null] Target coordinate, if null return to template
  * @param {Boolean} [relative=false] If true, target is relative to root
  * @param {numeric} [d=null] If set, apply in d milliseconds
  */
  ikSolve(ik, target=null, relative=false, d=null) {
    // IMP: console.log(`ikSolve called with time: ${new Date().toISOString()}ms`);
    const q = new THREE.Quaternion();
    const targetVec = new THREE.Vector3();
    const effectorPos = new THREE.Vector3();
    const effectorVec = new THREE.Vector3();
    const linkPos = new THREE.Vector3();
    const invLinkQ = new THREE.Quaternion();
    const linkScale = new THREE.Vector3();
    const axis = new THREE.Vector3();
    const vector = new THREE.Vector3();

    // Reset IK setup positions and rotations
    const root = this.ikMesh.getObjectByName(ik.root);
    root.position.setFromMatrixPosition( this.armature.getObjectByName(ik.root).matrixWorld );
    root.quaternion.setFromRotationMatrix( this.armature.getObjectByName(ik.root).matrixWorld );
    if ( target && relative ) {
      target.add( root.position );
    }
    const effector = this.ikMesh.getObjectByName(ik.effector);
    const links = ik.links;
    links.forEach( x => {
      x.bone = this.ikMesh.getObjectByName(x.link);
      x.bone.quaternion.copy( this.getPoseTemplateProp(x.link+'.quaternion') );
    });
    root.updateMatrixWorld(true);
    const iterations = ik.iterations || 10;

    // Iterate
    if ( target ) {
      for ( let i = 0; i < iterations; i ++ ) {
        let rotated = false;
        for ( let j = 0, jl = links.length; j < jl; j++ ) {
          const bone = links[j].bone;
          bone.matrixWorld.decompose( linkPos, invLinkQ, linkScale );
          invLinkQ.invert();
          effectorPos.setFromMatrixPosition( effector.matrixWorld );
          effectorVec.subVectors( effectorPos, linkPos );
          effectorVec.applyQuaternion( invLinkQ );
          effectorVec.normalize();
          targetVec.subVectors( target, linkPos );
          targetVec.applyQuaternion( invLinkQ );
          targetVec.normalize();
          let angle = targetVec.dot( effectorVec );
          if ( angle > 1.0 ) {
            angle = 1.0;
          } else if ( angle < - 1.0 ) {
            angle = - 1.0;
          }
          angle = Math.acos( angle );
          if ( angle < 1e-5 ) continue;
          if ( links[j].minAngle !== undefined && angle < links[j].minAngle ) {
            angle = links[j].minAngle;
          }
          if ( links[j].maxAngle !== undefined && angle > links[j].maxAngle ) {
            angle = links[j].maxAngle;
          }
          axis.crossVectors( effectorVec, targetVec );
          axis.normalize();
          q.setFromAxisAngle( axis, angle );
          bone.quaternion.multiply( q );

          // Constraints
          bone.rotation.setFromVector3( vector.setFromEuler( bone.rotation ).clamp( new THREE.Vector3(
            links[j].minx !== undefined ? links[j].minx : -Infinity,
            links[j].miny !== undefined ? links[j].miny : -Infinity,
            links[j].minz !== undefined ? links[j].minz : -Infinity
          ), new THREE.Vector3(
            links[j].maxx !== undefined ? links[j].maxx : Infinity,
            links[j].maxy !== undefined ? links[j].maxy : Infinity,
            links[j].maxz !== undefined ? links[j].maxz : Infinity
          )) );

          bone.updateMatrixWorld( true );
          rotated = true;
        }
        if ( !rotated ) break;
      }
    }

    // Apply
    if ( d ) {
      links.forEach( x => {
        this.poseTarget.props[x.link+".quaternion"].copy( x.bone.quaternion );
        this.poseTarget.props[x.link+".quaternion"].t = this.animClock;
        this.poseTarget.props[x.link+".quaternion"].d = d;
      });
    }
  }

}

export { TalkingHead };
