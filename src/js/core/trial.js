/*
===============================================================
PUSHING/RUNNING A CUSTOM SINGLE TRIAL (*singleTrial)
===============================================================
*/
function runSingleTrial(
    stimColor,
    stimDuration,
    timelineTrialsToPush,
    trialType,
) {

    /*--------------------------- General Utility ---------------------------*/
    var checkScreen = {
        type: jsPsychFullscreen,
        message:
            '<p>Unfortunately, it appears you are no longer in fullscreen mode. Please make sure to remain in fullscreen mode. <br>Click on the button to fullscreen the experiment again and proceed.</p>',
        fullscreen_mode: true,
        button_label: 'Resume',
    };

    var if_notFull = {
        timeline: [checkScreen],
        conditional_function: function () {
            if (full_check == false) {
                return true;
            } else {
                return false;
            }
        },
    };

    var cursor_off = {
        type: jsPsychCallFunction,
        func: function () {
            document.body.style.cursor = 'none';
        },
    };

    var cursor_on = {
        type: jsPsychCallFunction,
        func: function () {
            document.body.style.cursor = 'auto';
        },
    };

    /*--------------------------- Experiment specific variables ---------------------------*/
    var thisStim = `${stimFolder}${stimColor}-circle.png`
    var persistent_prompt = `<div style="position: fixed; top: 50px; left: 50%; transform: translateX(-50%); text-align: center;">f = blue; j = orange </div>`;

    /* testing a slider */
    tarSize = 40;
    var dispCircleSlider = {
        type: jsPsychHtmlSliderResponseResizing,
        stimulus: `<img src="${thisStim}" />`,
        slider_start: 70,
        min: 20,
        max: 120,
        slider_width: 500,
        labels: ["smaller","larger"],
        trial_duration: null,
        response_ends_trial: true,
        prompt: `${persistent_prompt}`,
        data: {
            trial_category: 'answer'+trialType,
            trial_stimulus: thisStim,
            correct_response: tarSize,
        }, // data end
        on_finish: function(data){
            data.thisDifference = data.response - tarSize
        } // on finish end
    }; // dispCircle end

    var dispCircleAnimation = {
        type: jsPsychCanvasKeyboardResponse,
        stimulus: function(c) {
            var ctx = c.getContext("2d");
            var simple_settings = {
                thisShape: "circle", 
                shapeSize: 50,
                animationLength: 10000, //ms
                shapeColor: "ff0040"
            };
            createAnimation(ctx, h/2, w/2, simple_settings);

        },
        canvas_size: [h/2, w/2],
        choices: ['q'],
        trial_duration: null,
        response_ends_trial: true,
        prompt: "press q to continue",
        data: {
            trial_category: 'answer'+trialType,
            trial_stimulus: thisStim
        }
    }; // dispCircleAnimation end

    var prestim = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `${persistent_prompt}`,
        choices: "NO_KEYS",
        trial_duration: PRESTIM_DISP_TIME,
        data: {
            trial_category: 'prestim_ISI' + trialType,
        }
    };

    var fixation = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `${persistent_prompt}<div style="font-size:60px;">+</div>`,
        choices: "NO_KEYS",
        trial_duration: FIXATION_DISP_TIME,
        data: {
            trial_category: 'fixation' + trialType,
        }
    };


    /*--------------------------- push single trial sequence ---------------------------*/

    timelineTrialsToPush.push(if_notFull);
    timelineTrialsToPush.push(cursor_off);
    timelineTrialsToPush.push(prestim);
    timelineTrialsToPush.push(fixation);
    timelineTrialsToPush.push(dispCircle);
    // timelineTrialsToPush.push(dispCircleSlider); // if you wanted to use the slider reproduction measurement tool
    timelineTrialsToPush.push(cursor_on);

}