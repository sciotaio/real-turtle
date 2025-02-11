import InternalClass from "../constructors/internalClass";

export default class TurtleState extends InternalClass {
  constructor(main) {
    super(main);

    var initialState = main.options.state;

    this.position = {
      x: initialState.position
        ? initialState.position.x
        : this.main.canvas.width / 2,
      y: initialState.position
        ? initialState.position.y
        : this.main.canvas.height / 2,
    };

    this.rotation = initialState.rotation
      ? this.clampRotation(initialState.rotation)
      : 0;

    this.initialPosition = this.position;
    this.initialRotation = this.rotation;

    this.canvasSizeMeters = initialState.canvasSizeMeters
      ? initialState.canvasSizeMeters
      : {
          x: this.main.canvas.width,
          y: this.main.canvas.height,
        };

    this.canvasLatLngBounds = initialState.canvasLatLngBounds
      ? initialState.canvasLatLngBounds
      : [
          [0, 0],
          [0, 0],
        ];

    this.size = initialState.size;

    this.lineWidth = initialState.lineWidth;
    this.lineCap = initialState.lineCap;
    this.lineJoin = initialState.lineJoin;
    this.strokeStyle = initialState.strokeStyle;

    this.fillStyle = initialState.fillStyle;

    this.font = initialState.font;
    this.textBaseline = initialState.textBaseline;
    this.verticalAlign = initialState.verticalAlign;

    this.strokeActive = true;
    this.pathActive = false;

    this.speed = initialState.speed;
    this.image = { url: null, object: null };

    this.msPerPixel = 10;
    this.msPerMeter = 400;
  }

  setPosition(x, y) {
    this.position = { x, y };
  }

  setRotation(deg) {
    this.rotation = this.clampRotation(deg);
  }

  setInitialPosition(x, y) {
    this.initialPosition = { x, y };
  }

  setInitialRotation(deg) {
    this.initialRotation = this.clampRotation(deg);
  }

  resetPosition() {
    this.position = this.initialPosition;
    this.rotation = this.initialRotation;
  }

  setCanvasSizeMeters(sizeX, sizeY) {
    this.canvasSizeMeters = {
      x: sizeX,
      y: sizeY,
    };
  }

  setCanvasLatLngBounds(latLngBounds) {
    this.canvasLatLngBounds = latLngBounds;
  }

  setSize(size) {
    this.size = size;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setStrokeActive(value) {
    this.strokeActive = value;
  }

  setPathActive(value) {
    this.pathActive = value;
  }

  setFillStyle(value) {
    this.fillStyle = value;
  }

  setStrokeStyle(value) {
    this.strokeStyle = value;
  }

  setLineWidth(value) {
    this.lineWidth = value;
  }

  setLineCap(value) {
    this.lineCap = value;
  }

  setLineJoin(value) {
    this.lineJoin = value;
  }

  setFont(value) {
    this.font = value;
  }

  setTextBaseline(value) {
    this.textBaseline = value;
  }

  setTextAlign(value) {
    this.textAlign = value;
  }

  async setImage(url) {
    return new Promise((resolve) => {
      var image = new Image();

      image.onload = () => {
        this.image.object = image;
        this.imageSet = true;
        resolve();
      };

      image.src = url;
      this.image.url = url;
    });
  }

  getCurrent() {
    return JSON.parse(
      JSON.stringify({
        position: this.position,
        rotation: this.rotation,
        size: this.size,
        lineWidth: this.lineWidth,
        strokeStyle: this.strokeStyle,
        fillStyle: this.fillStyle,
        strokeActive: this.strokeActive,
        pathActive: this.pathActive,
        image: this.image,
      })
    );
  }

  clampRotation(rotation) {
    return ((rotation % 360) + 360) % 360; // works for both positive and negative numbers
  }
}
