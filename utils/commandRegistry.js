const fs = require('fs');
const path = require('path');

function getCommandFiles() {
  const commandsPath = path.join(__dirname, '..', 'commands');
  return fs.readdirSync(commandsPath, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry => {
      const categoryPath = path.join(commandsPath, entry.name);
      return fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.js'))
        .map(file => path.join(categoryPath, file));
    });
}

function loadCommandData({ fresh = false } = {}) {
  return getCommandFiles()
    .map(filePath => {
      if (fresh) delete require.cache[require.resolve(filePath)];
      return require(filePath);
    })
    .filter(command => command.data);
}

module.exports = { getCommandFiles, loadCommandData };
