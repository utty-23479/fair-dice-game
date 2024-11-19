const crypto = require("crypto");
const readline = require("readline");
const AsciiTable = require("ascii-table");

class ProbabilityTable {
  constructor(diceSet) {
    this.diceSet = diceSet;
    this.winChances = {};
  }

  generateTable() {
    const table = new AsciiTable("Probability Table");
    table.setHeading(
      "Dice \\ Dice",
      ...this.diceSet.map((_, i) => `Dice ${i}`),
    );

    this.diceSet.forEach((rowDice, rowIndex) => {
      const row = [`Dice ${rowIndex}`];
      let totalWins = 0;

      this.diceSet.forEach((colDice, colIndex) => {
        const { winPercentage, tiePercentage } = this.calculateProbability(
          rowDice,
          colDice,
        );
        row.push(`${winPercentage}% W / ${tiePercentage}% T`);
        if (rowIndex !== colIndex) totalWins += parseFloat(winPercentage);
      });

      const avgWinChance = totalWins / (this.diceSet.length - 1);
      this.winChances[`Dice ${rowIndex}`] = avgWinChance.toFixed(2);
      table.addRow(...row);
    });

    this.table = table;
    console.log(table.toString());

    console.log("\nProbability of winning with each dice:");
    Object.entries(this.winChances).forEach(([dice, chance]) => {
      console.log(`${dice}: ${chance}%`);
    });
  }

  calculateProbability(dice1, dice2) {
    let wins = 0;
    let ties = 0;
    const totalComparisons = dice1.faces.length * dice2.faces.length;

    for (const face1 of dice1.faces) {
      for (const face2 of dice2.faces) {
        if (face1 > face2) wins++;
        else if (face1 === face2) ties++;
      }
    }

    return {
      winPercentage: ((wins / totalComparisons) * 100).toFixed(2),
      tiePercentage: ((ties / totalComparisons) * 100).toFixed(2),
    };
  }

  showTable() {
    if (!this.table) {
      console.log("No table generated. Call generateTable() first.");
      return;
    }
    console.log(this.table.toString());

    console.log("\nProbability of winning with each dice:");
    for (const [dice, chance] of Object.entries(this.winChances)) {
      console.log(`${dice}: ${chance}%`);
    }
  }
}

class ProbabilityCalculator {
  static calculate(cpuThrow, playerThrow) {
    if (playerThrow > cpuThrow) {
      return `You win (${playerThrow} > ${cpuThrow})`;
    } else if (cpuThrow > playerThrow) {
      return `I win (${cpuThrow} > ${playerThrow})`;
    } else {
      return "It's a tie!";
    }
  }
}

class FairRandGenerator {
  static generateInt(range) {
    return crypto.randomInt(0, range + 1);
  }

  static generateSecretKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  static generateHMAC(number, secretKey) {
    return crypto
      .createHmac("sha256", secretKey)
      .update(number.toString())
      .digest("hex");
  }
}

class DiceParser {
  static parse(args) {
    const diceList = [];
    args.forEach((diceStr) => {
      const diceValues = [];
      for (let char of diceStr) {
        if (!isNaN(char)) diceValues.push(parseInt(char, 10));
      }
      const dice = new Dice(diceValues);
      diceList.push(dice);
    });
    return diceList;
  }

  static validateArgs(args) {
    if (args.length < 3) {
      return "ARGS LENGTH ERROR: You must provide at least 3 dice (6 numbers each). Example: 2,2,4,4,9,9 1,1,6,6,8,8 3,3,5,5,7,7";
    }
    const invalidDice = args.find((dice) => !this.validateDice(dice));
    if (invalidDice) {
      return `INVALID DICE FORMAT '${invalidDice}': The dice must have exactly 6 faces with integer numbers between 1 and 9 separated by commas. Example: 2,2,4,4,9,9`;
    }

    return null;
  }

  static validateDice(dice) {
    const regex = /^(?:[1-9],){5}[1-9]$/;
    return regex.test(dice);
  }
}

class Dice {
  constructor(faces) {
    this.faces = faces;
  }
}

class DiceGame {
  constructor(args) {
    this.diceSet = DiceParser.parse(args);
    this.probabilityTable = new ProbabilityTable([...this.diceSet]);
    this.userDice = null;
    this.cpuDice = null;
    this.userResult = 0;
    this.cpuResult = 0;
  }

  showAvailableDice() {
    console.log("Choose your dice:");
    this.diceSet.forEach((dice, index) => {
      console.log(`${index} - ${dice.faces}`);
    });
    console.log("X - exit\n? - help");
  }

  takeDice(index) {
    return this.diceSet.splice(index, 1)[0];
  }

  modGamePart(isMyTurn) {
    const modNumber = FairRandGenerator.generateInt(5);
    setTimeout(() => {}, 300);
    const modNumberKey = FairRandGenerator.generateSecretKey();
    const modNumberHMAC = FairRandGenerator.generateHMAC(
      modNumber,
      modNumberKey,
    );

    console.log(
      isMyTurn ? "It's time for your throw" : "It's time for my throw",
    );
    console.log("I selected a random value in the range 0..5");
    console.log(`(HMAC=${modNumberHMAC})`);
    console.log("Add your number modulo 6");
    console.log("0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help");
    return { modNumber, modNumberKey };
  }

  async promptInput(question, rl) {
    while (true) {
      const userInput = await new Promise((resolve) =>
        rl.question(question, resolve),
      );

      if (userInput.toLowerCase() === "x") {
        console.log("Game exited.");
        rl.close();
        process.exit();
      }

      if (userInput === "?") {
        console.log("Help Menu:");
        this.probabilityTable.generateTable();
        console.log("Here is the probability table");
      } else {
        return userInput;
      }
    }
  }
  async start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const cpuGuessNumber = FairRandGenerator.generateInt(1);
    setTimeout(() => {}, 300);
    this.cpuDice = FairRandGenerator.generateInt(this.diceSet.length);
    const secretKeyGuessNumber = FairRandGenerator.generateSecretKey();
    const guessNumberHMAC = FairRandGenerator.generateHMAC(
      cpuGuessNumber,
      secretKeyGuessNumber,
    );

    console.log("Let's determine who makes the first move");
    console.log(
      `I selected a random value in the range 0..1 (HMAC=${guessNumberHMAC})`,
    );
    console.log("Try to guess my selection");
    console.log("0 - 0\n1 - 1\nX - exit\n? - help");

    const userGuessInput = await this.promptInput("Your selection: ", rl);
    const userGuessNumber = parseInt(userGuessInput, 10);
    if (
      isNaN(userGuessNumber) ||
      (userGuessNumber !== 0 && userGuessNumber !== 1)
    ) {
      console.log("Invalid input. Please choose 0 or 1.");
      rl.close();
      return;
    }

    console.log(
      `My selection: ${cpuGuessNumber} (KEY=${secretKeyGuessNumber})`,
    );
    let myTurn = null;
    if (cpuGuessNumber === userGuessNumber) {
      console.log("You make the first move");
      myTurn = true;
    } else {
      this.cpuDice = this.takeDice(this.cpuDice);
      console.log(
        `I make the first move and choose the [${this.cpuDice.faces}] dice`,
      );
      myTurn = false;
    }

    this.showAvailableDice();
    const userSelectionInput = await this.promptInput("Your selection: ", rl);
    const userSelection = parseInt(userSelectionInput, 10);

    if (
      isNaN(userSelection) ||
      userSelection < 0 ||
      userSelection >= this.diceSet.length
    ) {
      console.log("Invalid input. Please choose a valid dice index.");
      rl.close();
      return;
    }

    this.userDice = this.takeDice(userSelection);
    if (myTurn) {
      this.cpuDice = this.takeDice(
        FairRandGenerator.generateInt(this.diceSet.length),
      );
      setTimeout(() => {}, 300);
    }
    console.log(`You choose the [${this.userDice.faces}] dice`);
    if (myTurn) {
      console.log(`I choose the [${this.cpuDice.faces}] dice`);
    }

    const firstTurnCPU = this.modGamePart(myTurn);
    const firstTurnInput = await this.promptInput("Your selection: ", rl);
    const firstTurnSelection = parseInt(firstTurnInput, 10);

    if (
      isNaN(firstTurnSelection) ||
      firstTurnSelection < 0 ||
      firstTurnSelection > 5
    ) {
      console.log("Invalid input. Please choose a number between 0 and 5.");
      rl.close();
      return;
    }

    console.log(`My number is ${firstTurnCPU.modNumber}`);
    console.log(`(KEY=${firstTurnCPU.modNumberKey})`);
    const firstTurnResult = (firstTurnCPU.modNumber + firstTurnSelection) % 6;
    console.log(
      `The result is ${firstTurnCPU.modNumber} + ${firstTurnSelection} = ${firstTurnResult}`,
    );
    const firstTurnDiceResult = myTurn
      ? this.userDice.faces[firstTurnResult]
      : this.cpuDice.faces[firstTurnResult];
    console.log(
      myTurn
        ? `Your throw is ${firstTurnDiceResult}`
        : `My throw is ${firstTurnDiceResult}`,
    );
    myTurn
      ? (this.userResult += firstTurnDiceResult)
      : (this.cpuResult += firstTurnDiceResult);

    myTurn = !myTurn;
    const secondTurnCPU = this.modGamePart(myTurn);
    const secondTurnInput = await this.promptInput("Your selection: ", rl);
    const secondTurnSelection = parseInt(secondTurnInput, 10);

    if (
      isNaN(secondTurnSelection) ||
      secondTurnSelection < 0 ||
      secondTurnSelection > 5
    ) {
      console.log("Invalid input. Please choose a number between 0 and 5.");
      rl.close();
      return;
    }

    console.log(`My number is ${secondTurnCPU.modNumber}`);
    console.log(`(KEY=${secondTurnCPU.modNumberKey})`);
    const secondTurnResult =
      (secondTurnCPU.modNumber + secondTurnSelection) % 6;
    console.log(
      `The result is ${secondTurnCPU.modNumber} + ${secondTurnSelection} = ${secondTurnResult}`,
    );
    const secondTurnDiceResult = myTurn
      ? this.userDice.faces[secondTurnResult]
      : this.cpuDice.faces[secondTurnResult];
    console.log(
      myTurn
        ? `Your throw is ${secondTurnDiceResult}`
        : `My throw is ${secondTurnDiceResult}`,
    );
    myTurn
      ? (this.userResult += secondTurnDiceResult)
      : (this.cpuResult += secondTurnDiceResult);

    console.log(
      ProbabilityCalculator.calculate(this.cpuResult, this.userResult),
    );
    rl.close();
  }
}

const args = process.argv.slice(2);
const validationError = DiceParser.validateArgs(args);
if (validationError) return console.error(validationError);

const diceGame = new DiceGame(args);
diceGame.start();
