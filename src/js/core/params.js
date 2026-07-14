/*
===============================================================
Defining Parameter Variables
===============================================================
*/

var stimFolder = 'src/assets/stimuli/circles/'

var runIntro = false;
var runInstr = false;
var runExpt = true;
var runClose = true;
var runPreload = true;

/*
---------------------------------------------------------------
Live tunable experiment hyperparameters (Sets Defaults)
---------------------------------------------------------------
Sets default DEFAULT values for adjustable experiment variables that may
later need to change while the experiment is still live.  
These defaults are used when running locally, or when an 
experiment has no backend config set. At runtime, the experiment pulls `config` 
from the WAVE backend (if available) and merges it OVER these defaults 
(see initExperiment() in timeline.js). A researcher can thus easily change
a one of these variables (via the setup_experiment.ipynb notebook / API)
instead of having to edit the file and do PRs.

*/
var CONFIG_DEFAULTS = {
    number_of_repetitions: 1,
    base_circle_colors: ["blue","orange"],
};

// Defining Core Variables that remain constant
var PRESTIM_DISP_TIME = 800;
var FIXATION_DISP_TIME = 500;

// Variables for Participant Information
var estTotalRunTime = 5;
var estDollars = 0.9;
var participantType = 'prolific';
var completionCode = 'C4MF2IV1';
var prolific_url = 'https://app.prolific.co/submissions/complete?cc='+completionCode;

// WAVE Backend Configuration
var waveBackendUrl = 'https://wave-backend-production-8781.up.railway.app';
// var waveBackendUrl = 'http://localhost:8000';  // For local development

// initializing variables
var timelinebase = [];
var timelineintro = [];
var timelineinstr = [];
var timelineexpt = [];
var timelineclose = [];
var forPreload = [];
var full_check = false;
var w =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
var h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

// setting display image width
var origWidth = 300;
var origHeight = 300;
var imgWidth = 150; // your desired display img width
var imgHeight = (imgWidth / origWidth) * origHeight;


