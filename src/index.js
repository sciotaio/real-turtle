import "regenerator-runtime/runtime";

import Logger from "./classes/internal/logger";
import TaskHandler from "./classes/internal/taskHandler";
import TurtleState from "./classes/internal/state";

import standardOptions from "./definitions/standardOptions";

import commandNames from "./definitions/commandNames";
const commands = [];
for (var i = 0; i < commandNames.length; i++) {
  commands[commandNames[i]] = require("./classes/commands/" +
    commandNames[i]).default;
}

class RealTurtle {
  constructor(canvas, options) {
    if (Object.prototype.toString.call(canvas) === "[object String]") {
      canvas = document.querySelector(canvas);
    }

    //Generate canvas if given element is not one
    if (canvas.tagName != "CANVAS") {
      var canvasElement = document.createElement("canvas");
      canvas.appendChild(canvasElement);
      canvas = canvasElement;
    }

    this.options = standardOptions;
    for (const [key, value] of Object.entries(options)) {
      if (typeof value !== "object") {
        this.options[key] = value;
      } else {
        for (const [innerKey, innerValue] of Object.entries(value)) {
          this.options[key][innerKey] = innerValue;
        }
      }
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.commands = [];

    this.logger = new Logger(this);
    this.state = new TurtleState(this);
    this.taskHandler = new TaskHandler(this);

    //Register internal Commands
    for (var i = 0; i < commandNames.length; i++) {
      this.registerCommand(commandNames[i], commands[commandNames[i]]);
    }

    this.registerGPSFunc();

    if (this.options.autoStart == true) {
      setTimeout(() => {
        this.start();
      }, 500);
    }
  }

  start(onFinish, params) {
    // When imge loaded
    this.state
      .setImage(this.options.image)
      .then(() => {
        return this.taskHandler.executeTasks();
      })
      .then(() => {
        //clear the tasks from the list that have already been executed
        this.taskHandler.tasks = [];
        if (onFinish && typeof onFinish == "function") onFinish(params);
      })
      .catch((reason) => {
        if (reason instanceof Error)
          if (
            reason.message != "Is already executing." &&
            reason.message != "No tasks to execute."
          )
            console.log(reason);
      });
  }

  registerCommand(name, command) {
    this.commands[name] = command;

    var paramNames = [];
    for (const [key, value] of Object.entries(command.params)) {
      paramNames.push(key);
    }

    var func = new Function(
      paramNames,
      `
        var paramNames = ${JSON.stringify(paramNames)};

        var options = {};
        for (var i = 0; i < arguments.length; i++) {
          options[paramNames[i]] = arguments[i];
        }

        if(this.options.async) {
          this.taskHandler.tasks = [];
        }

        this.taskHandler.addTask("${name}", options);

        if(this.options.async) {
          if(this.state.imageSet){
            return this.taskHandler.executeTasks();
          }
          else{
            return this.state.setImage(this.options.image).then(() => this.taskHandler.executeTasks());
          }
        }

        else {
          return this;
        }
    `
    );

    this[name] = func;

    if (command.aliases !== undefined) {
      for (var i = 0; i < command.aliases.length; i++) {
        this[command.aliases[i]] = func;
      }
    }
  }

  setCanvasDimensions(xMeters, yMeters) {
    this.state.setCanvasSizeMeters(xMeters, yMeters);

    this.taskHandler.clearCanvases();
    this.logger.add(`🐢 Setting new canvas dimensions`, { xMeters, yMeters });
  }

  setCanvasLatLngBounds(latLngBounds) {
    this.state.setCanvasLatLngBounds(latLngBounds);

    this.taskHandler.clearCanvases();
    this.logger.add(`🐢 Setting new canvas lat lng bounds`, latLngBounds);
  }

  registerGPSFunc() {
    var func = new Function(
      "lat",
      "long",
      `
      return {lat, long}
    `
    );
    this["gps"] = func;
  }
}

export default RealTurtle;
