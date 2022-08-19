import Command from "../constructors/drawingCommand";

import MoveCommand from "./move";

export default class BackCommand extends Command {
  static aliases = ["bk"];

  static params = { steps: new Number() };

  constructor(options) {
    const argTypesAreCorrect = typeof options["steps"] == "number";

    if (!argTypesAreCorrect) {
      console.log("🐢 Incorrect argument type for command 'back', defaulting.");
      options["steps"] = 0;
    }
    super(options);
  }

  estimate(main) {
    this.moveCommand = new MoveCommand({ steps: -this.options.steps });

    return this.moveCommand.estimateSuper(main);
  }

  prepare(main) {
    return this.moveCommand.prepareSuper(main);
  }

  async execute(progress, ctx) {
    return new Promise(async (resolve) => {
      await this.moveCommand.execute(progress, ctx);
      resolve();
    });
  }
}
