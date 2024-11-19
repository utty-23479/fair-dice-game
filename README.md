# Fair Dice Game Simulator

This project is a command-line dice game simulator written in JavaScript. It demonstrates the following functionality:

1. Launching with valid dice configurations and calculating probabilities.
2. Handling invalid input scenarios gracefully.
3. Displaying a help table with probabilities for specified dice.
4. Simulating a complete game with multiple runs and displaying the results.

---

## **How to Run**

### Prerequisites:
- Node.js installed on your system.

### Running the Program:
1. Clone the repository:
   ```bash
   git clone <repository-link>
   cd <repository-folder>
Run the program using the following syntax:

bash
Copy code
node diceGame.js <dice-configuration>
Replace <dice-configuration> with a space-separated list of dice, each represented as a comma-separated list of sides.

Example:
bash
Copy code
node diceGame.js 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6
Expected Outputs:

Launching with valid dice parameters calculates probabilities and starts the game.
Errors are displayed when invalid configurations are provided (e.g., non-integer sides, missing dice).
Features
Dice Configuration Validation: Ensures all dice are valid and meet the required conditions (6 sides, integers).
Error Handling: Provides feedback for invalid input cases, such as:
No dice provided.
Insufficient dice (less than 3).
Invalid dice configurations (non-numeric values, incorrect number of sides).
Probability Table: Displays the likelihood of different outcomes for a given set of dice.
Game Simulation: Plays a full game using the configured dice and outputs the results of each run.
Examples
Valid Input:
bash
Copy code
node diceGame.js 2,2,4,4,9,9 1,1,6,6,8,8 3,3,5,5,7,7
Invalid Input:
bash
Copy code
node diceGame.js 1,2,3,4,a,6
Generate Help Table:
bash
Copy code
node diceGame.js --help 2,2,4,4,9,9 1,1,6,6,8,8 3,3,5,5,7,7
Repository Structure
diceGame.js: Main script containing the logic for validation, probability calculations, and game simulation.
README.md: Documentation of the project.
Test Cases: Includes examples of valid and invalid inputs for reference.
