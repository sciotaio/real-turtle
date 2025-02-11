import Command from "../constructors/drawingCommand";

import TurnCommand from "./turn";

export default class LeftCommand extends Command {
  static aliases = ["rt"];

  static params = { degrees: new Number() };

  constructor(options) {
    const argTypesAreCorrect = typeof options["degrees"] == "number";

    if (!argTypesAreCorrect) {
      console.log(
        "🐢 Incorrect argument type for command 'right', defaulting."
      );
      options["degrees"] = 0;
    }
    super(options);
  }

  estimate(main) {
    this.turnCommand = new TurnCommand({ degrees: this.options.degrees });

    return this.turnCommand.estimateSuper(main);
  }

  prepare(main) {
    return this.turnCommand.prepareSuper(main);
  }

  async execute(progress, ctx) {
    return new Promise(async (resolve) => {
      await this.turnCommand.execute(progress, ctx);
      resolve();
    });
  }
}
