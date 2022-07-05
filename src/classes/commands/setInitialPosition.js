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
    // both x and y have been given as meter or pixel coordinates relative to the canvas' origin
    if (this.options.y !== undefined) {
      if (main.options.unitsInMeters) {
        const canvasSize = main.state.canvasSizeMeters;
        this.setX = (this.options.x / canvasSize.x) * main.canvas.width;
        this.setY = (this.options.y / canvasSize.y) * main.canvas.height;
      } else {
        this.setX = this.options.x;
        this.setY = this.options.y;
      }
    } else {
      // only x has been given as an object with GPS coordinates
      if (typeof this.options.x === "object") {
        const canvasLatLngBounds = this.state.canvasLatLngBounds;
        const { lat, long } = this.options.x;

        const pixelPerDegreeLong =
          main.canvas.width /
          (canvasLatLngBounds[1][1] - // east longitude
            canvasLatLngBounds[0][1]); // west longitude
        this.setX = (long - canvasLatLngBounds[0][1]) * pixelPerDegreeLong;

        const pixelPerDegreeLat =
          main.canvas.height /
          (canvasLatLngBounds[1][0] - // north latitude
            canvasLatLngBounds[0][0]); //south latitude
        this.setY = (canvasLatLngBounds[1][0] - lat) * pixelPerDegreeLat; // y axis is at the north bound (y = 0 is the top)
      } else {
        this.setX = this.state.initialPosition.x;
        this.setY = this.state.initialPosition.y;
      }
    }
  }

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      this.state.setInitialPosition(this.setX, this.setY);
      resolve();
    });
  }
}
