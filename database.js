const fs = require('fs');
const path = require('path');
const dataFolderPath = path.join(__dirname, 'data');

function readDatabase(filename) {
    const filePath = path.join(dataFolderPath, filename);
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

function writeDatabase(filename, data) {
    const filePath = path.join(dataFolderPath, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
    readDatabase,
    writeDatabase
};

//const { readDatabase, writeDatabase } = require('../database');

// Reading a specific JSON file
// const userData = readDatabase('users.json');

// Writing to a specific JSON file
// writeDatabase('user.json', userData);