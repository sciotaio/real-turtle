import Command from "../constructors/drawingCommand";

export default class TurnCommand extends Command {
  static params = { degrees: new Number() };

  constructor(options) {
    const argTypesAreCorrect = typeof options["degrees"] == "number";

    if (!argTypesAreCorrect) {
      console.log("🐢 Incorrect argument type for command 'turn', defaulting.");
      options["degrees"] = 0;
    }
    super(options);
  }

  estimate(main) {
    if (!this.options.degrees) {
      this.options.degrees = this.main.state.rotation * -1;
    }
    return {
      requiredTime:
        (1 - this.main.state.speed) * Math.abs(this.options.degrees) * 6,
    };
  }

  prepare(main) {}

  async execute(progress, ctx) {
    return new Promise((resolve) => {
      this.state.setRotation(
        this.initialState.rotation + this.options.degrees * progress
      );
      resolve();
    });
  }
}
