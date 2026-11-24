"use strict";

import germlineLabelsHumanTR from "./germline-labels-human-tr";
import germlineLabelsHumanIG from "./germline-labels-human-ig";
import germlineLabelsMouseTR from "./germline-labels-mouse-tr";
import germlineLabelsMouseIG from "./germline-labels-mouse-ig";

export default {
    "NCBITAXON:9606":{...germlineLabelsHumanTR, ...germlineLabelsHumanIG},
    "NCBITAXON:10090":{...germlineLabelsMouseTR, ...germlineLabelsMouseIG}
};