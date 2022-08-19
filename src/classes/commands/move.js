import Command from "../constructors/drawingCommand";

export default class MoveCommand extends Command {
  static params = { steps: new Number() };
  constructor(options) {
    const argTypesAreCorrect = typeof options["steps"] == "number";

    if (!argTypesAreCorrect) {
      console.log("🐢 Incorrect argument type for command 'move', defaulting.");
      options["steps"] = 0;
    }
    super(options);
  }

  estimate(main) {
    if (main.options.unitsInMeters) {
      return {
        requiredTime:
          (1 - this.main.state.speed) *
          Math.abs(this.options.steps) *
          this.state.msPerMeter,
      };
    }

    return {
      requiredTime:
        (1 - this.main.state.speed) *
        Math.abs(this.options.steps) *
        this.state.msPerPixel,
    };
  }

  prepare(main) {
    if (main.options.unitsInMeters) {
      const canvasSize = main.state.canvasSizeMeters;
      const moveXMeters =
        Math.sin((this.state.rotation * Math.PI) / 180) * this.options.steps;
      const moveYMeters =
        -1 *
        Math.cos((this.state.rotation * Math.PI) / 180) *
        this.options.steps;

      this.moveX = (moveXMeters / canvasSize.x) * main.canvas.width;
      this.moveY = (moveYMeters / canvasSize.y) * main.canvas.height;
    } else {
      this.moveX =
        Math.sin((this.state.rotation * Math.PI) / 180) * this.options.steps;
      this.moveY =
        -1 *
        Math.cos((this.state.rotation * Math.PI) / 180) *
        this.options.steps;
    }
  }

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      var xNow = this.initialState.position.x + this.moveX * progress;
      var yNow = this.initialState.position.y + this.moveY * progress;

      if (!this.state.pathActive) {
        ctx.beginPath();
        ctx.moveTo(this.initialState.position.x, this.initialState.position.y);
      }

      ctx.lineTo(xNow, yNow);

      if (this.state.strokeActive) {
        ctx.stroke();
      }

      if (!this.state.pathActive) {
        ctx.closePath();
      }

      this.state.setPosition(xNow, yNow);
      resolve();
    });
  }
}
