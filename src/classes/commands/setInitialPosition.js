import Command from "../constructors/drawingCommand";

export default class SetInitialPositionCommand extends Command {
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
    } else {
      this.setX = this.options.x;
      this.setY = this.options.y;
    }
  }

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      this.state.setInitialPosition(this.setX, this.setY);
      resolve();
    });
  }
}
