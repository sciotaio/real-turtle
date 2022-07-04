import Command from "../constructors/drawingCommand";

export default class MoveToCommand extends Command {
  static params = { right: new Object(), front: new Number() }; //this only matters for parameter names

  static aliases = ["to"];

  constructor(options) {
    super(options);
  }

  estimate(main) {
    let moveSpeedFactor = 6; //ms per pixel

    // "front" and "right" relative to initial position have been given
    if (this.options.front !== undefined) {
      if (main.options.unitsInMeters) {
        moveSpeedFactor = 1000; //ms per meter
        this.calculateValuesForMeters(main);
      } else {
        this.calculateValuesForPixels(main);
      }
    } else {
      // only "right" as an object with GPS coordinates has been given
      if (typeof this.options.right === "object")
        this.calculateValuesForGPS(main);
      else this.degrees = this.moveX = this.moveY = this.moveDistance = 0;
    }

    const turnTime = (1 - main.state.speed) * Math.abs(this.degrees) * 6;
    const moveTime =
      (1 - main.state.speed) * Math.abs(this.moveDistance) * moveSpeedFactor;

    this.requiredTime = turnTime + moveTime;
    console.log("req time: ", this.requiredTime, turnTime, moveTime);
    if (this.requiredTime > 0)
      this.turnDurationProportion = turnTime / this.requiredTime;
    //speed is 1 or turtle doesn't need to move
    else this.turnDurationProportion = 0.5; // so this doesn't matter because this moveTo command will be executed immediately

    return { requiredTime: this.requiredTime };
  }

  prepare(main) {}

  async execute(progress, ctx) {
    return new Promise(async (resolve) => {
      if (this.turnDurationProportion > 0) {
        this.state.setRotation(
          this.initialState.rotation +
            (this.degrees * Math.min(progress, this.turnDurationProportion)) /
              this.turnDurationProportion
        );
      }

      var xNow =
        this.initialState.position.x +
        (this.moveX * Math.max(progress - this.turnDurationProportion, 0)) /
          (1 - this.turnDurationProportion);
      var yNow =
        this.initialState.position.y +
        (this.moveY * Math.max(progress - this.turnDurationProportion, 0)) /
          (1 - this.turnDurationProportion);

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

  //calculates the dot product of two vectors a and b
  dot(a, b) {
    return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
  }

  //calculates the magnitude of a vector
  magnitude(a) {
    return Math.sqrt(
      a.map((x, i) => Math.pow(a[i], 2)).reduce((m, n) => m + n)
    );
  }

  calculateValuesForGPS(main) {
    const curPos = this.state.position;
    const curRot = this.state.rotation;
    const canvasLatLngBounds = this.state.canvasLatLngBounds;
    const { lat, long } = this.options.right;

    const pixelPerDegreeLong =
      main.canvas.width /
      (canvasLatLngBounds[1][1] - // east longitude
        canvasLatLngBounds[0][1]); // west longitude
    const x = (long - canvasLatLngBounds[0][1]) * pixelPerDegreeLong;

    const pixelPerDegreeLat =
      main.canvas.height /
      (canvasLatLngBounds[1][0] - // north latitude
        canvasLatLngBounds[0][0]); //south latitude
    const y = (canvasLatLngBounds[1][0] - lat) * pixelPerDegreeLat; // y axis is at the north bound (y = 0 is the top)

    console.log("canvas lat lng", canvasLatLngBounds);
    console.log("lat, long", lat, long);

    const targetPos = {
      x: x,
      y: y,
    };
    console.log("target:", targetPos);

    this.moveX = targetPos.x - curPos.x;
    this.moveY = targetPos.y - curPos.y;

    this.moveDistance = Math.sqrt(
      Math.pow(this.moveX, 2) + Math.pow(this.moveY, 2)
    );

    if (this.moveDistance == 0) {
      this.degrees = 0;
      return;
    }

    this.calculateTurningDegrees(curRot);
  }

  calculateValuesForMeters(main) {
    const canvasSize = main.state.canvasSizeMeters;
    const curRot = this.state.rotation;
    const curPos = this.state.position;
    const initialPos = this.state.initialPosition;
    const initialRot = this.state.initialRotation;

    const xOffsetMeters =
      Math.sin((initialRot * Math.PI) / 180) * this.options.front +
      Math.sin(((initialRot + 90) * Math.PI) / 180) * this.options.right;
    const yOffsetMeters =
      -1 * Math.cos((initialRot * Math.PI) / 180) * this.options.front +
      -1 * Math.cos(((initialRot + 90) * Math.PI) / 180) * this.options.right;

    const xOffset = (xOffsetMeters / canvasSize.x) * main.canvas.width;
    const yOffset = (yOffsetMeters / canvasSize.y) * main.canvas.height;

    const targetPos = {
      x: initialPos.x + xOffset,
      y: initialPos.y + yOffset,
    };
    console.log("target:", targetPos);

    this.moveX = targetPos.x - curPos.x;
    this.moveY = targetPos.y - curPos.y;

    const moveDistancePx = Math.sqrt(
      Math.pow(this.moveX, 2) + Math.pow(this.moveY, 2)
    );

    this.moveDistance = (moveDistancePx * canvasSize.x) / main.canvas.width; //convert to meters for time calculation

    if (this.moveDistance == 0) {
      this.degrees = 0;
      return;
    }

    this.calculateTurningDegrees(curRot);
  }

  calculateValuesForPixels(main) {
    const curRot = this.state.rotation;
    const curPos = this.state.position;
    const initialPos = this.state.initialPosition;
    const initialRot = this.state.initialRotation;

    const xOffset =
      Math.sin((initialRot * Math.PI) / 180) * this.options.front +
      Math.sin(((initialRot + 90) * Math.PI) / 180) * this.options.right;
    const yOffset =
      -1 * Math.cos((initialRot * Math.PI) / 180) * this.options.front +
      -1 * Math.cos(((initialRot + 90) * Math.PI) / 180) * this.options.right;

    const targetPos = {
      x: initialPos.x + xOffset,
      y: initialPos.y + yOffset,
    };
    console.log("target:", targetPos);

    this.moveX = targetPos.x - curPos.x;
    this.moveY = targetPos.y - curPos.y;

    this.moveDistance = Math.sqrt(
      Math.pow(this.moveX, 2) + Math.pow(this.moveY, 2)
    );

    if (this.moveDistance == 0) {
      this.degrees = 0;
      return;
    }

    this.calculateTurningDegrees(curRot);
  }

  calculateTurningDegrees(curRot) {
    const movingVector = [this.moveX, this.moveY];
    const yAxisVector = [0, -1]; //a vector pointing up in the canvas (equals turtle rotation 0)

    console.log("moving v", movingVector);

    const angle =
      (Math.acos(
        this.dot(movingVector, yAxisVector) /
          (this.magnitude(movingVector) * this.magnitude(yAxisVector))
      ) *
        180) /
      Math.PI;

    console.log("angle", angle);

    let targetRot;
    if (movingVector[0] < 0)
      //moving vector points to the left (negative x direction)
      targetRot = 360 - angle;
    else targetRot = angle;

    let rotationDiff = targetRot - curRot;
    if (rotationDiff < 0) rotationDiff += 360;

    if (rotationDiff > 180) this.degrees = -1 * (360 - rotationDiff);
    else this.degrees = rotationDiff;

    console.log("degrees: ", this.degrees);
  }
}
