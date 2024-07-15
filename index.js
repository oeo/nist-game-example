const axios = require('axios');
const crypto = require('crypto');

class Game {
  constructor(pulseTimestamp = null) {
    this.pulseTimestamp = pulseTimestamp;
    this.pulseData = null;
    this.randomNumbers = [];
    this.currentSeed = '';
  }

  async loadPulse() {
    try {
      const url = this.pulseTimestamp
        ? `https://beacon.nist.gov/beacon/2.0/pulse/time/${this.pulseTimestamp}`
        : 'https://beacon.nist.gov/beacon/2.0/pulse/last';

      const response = await axios.get(url);
      this.pulseData = response.data.pulse;
      this.currentSeed = this.pulseData.outputValue;
    } catch (error) {
      throw new Error('Failed to fetch NIST randomness pulse');
    }
  }

  random(min, max) {
    if (!this.pulseData) {
      throw new Error('Pulse data not loaded');
    }

    const randomValue = this.generateRandomValue();
    const scaledValue = min + (randomValue % (max - min + 1));
    this.randomNumbers.push(scaledValue);
    return scaledValue;
  }

  generateRandomValue() {
    const hash = crypto.createHash('sha256');
    hash.update(this.currentSeed);
    const randomHex = hash.digest('hex');
    this.currentSeed = randomHex; // Update the seed for the next iteration
    return parseInt(randomHex, 16);
  }

  data() {
    return {
      pulseData: this.pulseData,
      randomNumbers: this.randomNumbers,
    };
  }

  static async verify(gameData) {
    const game = new Game();
    game.pulseData = gameData.pulseData;
    game.currentSeed = gameData.pulseData.outputValue;

    for (let i = 0; i < gameData.randomNumbers.length; i++) {
      const generatedNumber = game.random(1, 100);
      if (generatedNumber !== gameData.randomNumbers[i]) {
        throw new Error(`Verification failed at index ${i}. Expected ${gameData.randomNumbers[i]}, but got ${generatedNumber}`);
      }
    }

    if (game.randomNumbers.length !== gameData.randomNumbers.length) {
      throw new Error(`Verification failed. Number of generated random numbers (${game.randomNumbers.length}) does not match the original data (${gameData.randomNumbers.length})`);
    }

    console.log('Game data verified successfully');
    return true;
  }
}

// Example run code
async function runGame() {
  console.log("Starting new game...");
  const game = new Game();
  await game.loadPulse();
  console.log("Pulse loaded.");

  console.log("Generating 100 random numbers:");
  for (let x = 1; x <= 100; x++) {
    console.log(`${x}: ${game.random(1, 100)}`);
  }

  console.log("\nGame data:");
  const gameData = game.data();
  console.log(JSON.stringify(gameData, null, 2));

  console.log("\nVerifying game data...");
  try {
    await Game.verify(gameData);
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}

runGame().catch(console.error);

