# nist-game-example

quick and dirty implementation of a provably fair game using nist randomness.

## what's this?

just a node.js script that grabs a nist randomness pulse and uses it to generate some "random" numbers. it's supposed to be provably fair.

## how to use

1. clone this repo
2. run `npm install`
3. run `node index.js`

## what it does

- fetches a nist pulse
- generates 100 random numbers
- prints them out
- tries to verify its own output

## license

mit

