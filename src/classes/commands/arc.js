import Command from "../constructors/drawingCommand";

export default class ArcCommand extends Command {
  static params = {
    radius: new Number(),
    angle: new Number(),
    counterclockwise: false,
  };

  constructor(options) {
    const argTypesAreCorrect =
      typeof options["radius"] == "number" &&
      typeof options["angle"] == "number" &&
      (typeof options["counterclockwise"] == "undefined" ||
        typeof options["counterclockwise"] == "boolean");

    if (!argTypesAreCorrect) {
      console.log(
        "🐢 Incorrect argument type(s) for command 'arc', defaulting."
      );
      options["radius"] = 0;
      options["angle"] = 0;
      options["counterclockwise"] = false;
    }
    super(options);
  }

  estimate(main) {
    if (main.options.unitsInMeters) {
      return {
        requiredTime:
          (((1 - this.main.state.speed) * Math.abs(this.options.angle)) / 360) *
          Math.PI *
          2 *
          this.options.radius *
          this.state.msPerMeter,
      };
    }

    return {
      requiredTime:
        (((1 - this.main.state.speed) * Math.abs(this.options.angle)) / 360) *
        Math.PI *
        2 *
        this.options.radius *
        this.state.msPerPixel,
    };
  }

  prepare(main) {
    if (this.options.counterclockwise == undefined) {
      this.options.counterclockwise = false;
    }

    var sideVariable = 90;
    if (this.options.counterclockwise) {
      sideVariable = -sideVariable;
    }

    if (main.options.unitsInMeters) {
      const canvasSize = main.state.canvasSizeMeters;
      const arcCenterXMeters =
        Math.sin(
          (this.initialState.rotation + sideVariable) * (Math.PI / 180)
        ) * this.options.radius;
      this.arcCenterX =
        this.initialState.position.x +
        (arcCenterXMeters / canvasSize.x) * main.canvas.width;

      const arcCenterYMeters =
        Math.cos(
          (this.initialState.rotation + sideVariable) * (Math.PI / 180)
        ) * this.options.radius;
      this.arcCenterY =
        this.initialState.position.y -
        (arcCenterYMeters / canvasSize.y) * main.canvas.height;

      this.radius = (this.options.radius / canvasSize.x) * main.canvas.width;
      //could also look like this: this.radius = this.options.radius / canvasSize.y * main.canvas.height;
      // since the pixels per meter are equal in x and y direction
    } else {
      this.arcCenterX =
        this.initialState.position.x +
        Math.sin(
          (this.initialState.rotation + sideVariable) * (Math.PI / 180)
        ) *
          this.options.radius;

      this.arcCenterY =
        this.initialState.position.y +
        Math.cos(
          (this.initialState.rotation + sideVariable) * (Math.PI / 180)
        ) *
          this.options.radius *
          -1 /* because the canvas coordinate system is different*/;

      this.radius = this.options.radius;
    }

    this.arcStartAngle = // 0 is the positive x axis
      (this.options.counterclockwise ? 0 : 180) + this.initialState.rotation;
  }

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      var currentAngle = // 0 is the positive x axis
        this.arcStartAngle +
        this.options.angle *
          progress *
          (this.options.counterclockwise ? -1 : 1);

      var xNow =
        this.arcCenterX +
        Math.cos(currentAngle * (Math.PI / 180)) * this.radius;
      var yNow =
        this.arcCenterY +
        Math.sin(currentAngle * (Math.PI / 180)) * this.radius;

      if (!this.state.pathActive || ctx == this.main.ctx) {
        ctx.beginPath();
      }

      ctx.arc(
        this.arcCenterX,
        this.arcCenterY,
        this.radius,
        this.arcStartAngle * (Math.PI / 180),
        currentAngle * (Math.PI / 180),
        this.options.counterclockwise
      );

      this.state.setPosition(xNow, yNow);
      this.state.setRotation(
        currentAngle - (this.options.counterclockwise ? 0 : 180)
      );

      if (this.state.strokeActive) {
        ctx.stroke();
      }

      if (!this.state.pathActive) {
        ctx.closePath();
      }

      resolve();
    });
  }
}
