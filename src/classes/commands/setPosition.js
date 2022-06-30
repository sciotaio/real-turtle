import Command from "../constructors/drawingCommand";

export default class SetPositionCommand extends Command {
  static params = { x: new Number(), y: new Number() };
  constructor(options) {
    super(options);
  }

  estimate(main) {
    return {
      requiredTime: 0,
    };
  }

  prepare(main) {
    if (main.options.unitsInMeters) {
      const canvasSize = main.state.canvasSizeMeters;
      this.setX = (this.options.x / canvasSize.x) * main.canvas.width;
      this.setY = (this.options.y / canvasSize.y) * main.canvas.height;

      //relative to initial position:
      // const initialPosition = main.state.initialPosition;
      // this.setX =
      //   initialPosition.x + (this.options.x / canvasSize.x) * main.canvas.width;
      // this.setY =
      //   initialPosition.y -
      //   (this.options.y / canvasSize.y) * main.canvas.height;
    } else {
      this.setX = this.options.x;
      this.setY = this.options.y;
    }
  }

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      this.state.setPosition(this.setX, this.setY);
      resolve();
    });
  }
}
