const fs = require('fs')
const readline = require('readline')

async function getFirstLine(pathToFile) {
  const readable = fs.createReadStream(pathToFile)
  const reader = readline.createInterface({ input: readable })
  const line = await new Promise((resolve) => {
    reader.on('line', (line) => {
      reader.close()
      resolve(line)
    });
  });
  readable.close()
  return line
}

const delay = (duration) => new Promise((r) => setTimeout(r, duration))

module.exports = { getFirstLine, delay }