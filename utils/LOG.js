"use strict";
var log4js = require("log4js");
var path = require('path');
var fs = require('fs');

log4js.configure({
    appenders: {
        out: {
            type: "stdout",
            layout: {
                type: "pattern",
                pattern: "%[%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] [%f{1}:%l] - %m%]",
            },
        }

    },
    categories: {
        default: { appenders: ["out"], level: "info", enableCallStack: true },
    },
    levels: {
        trace: { value: 1000, colour: "cyan" },
        debug: { value: 2000, colour: "grey" },
        info: { value: 3000, colour: "white" },
        success: { value: 3500, colour: "green" },
        warn: { value: 4000, colour: "yellow" },
        error: { value: 5000, colour: "red" },
        fatal: { value: 6000, colour: "magenta" },
    },
});
var logger = log4js.getLogger();
logger.level = "debug";
global.LOG = logger;