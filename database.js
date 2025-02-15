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

function searchDatabase(query) {
    const files = fs.readdirSync(dataFolderPath);
    const results = [];

    files.forEach(file => {
        const data = readDatabase(file);
        if (typeof data === 'object') {
            searchInObject(data, query, results, file);
        }
    });

    return results;
}

function searchInObject(obj, query, results, filePath, currentPath = '') {
    for (const key in obj) {
        const value = obj[key];
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (typeof value === 'object') {
            searchInObject(value, query, results, filePath, newPath);
        } else if (String(value).includes(query)) {
            results.push({ filePath, path: newPath, value });
        }
    }
}


module.exports = {
    readDatabase,
    writeDatabase,
    searchDatabase,
    searchInObject
};

//const { readDatabase, writeDatabase } = require('../database');

// Reading a specific JSON file
// const userData = readDatabase('users.json');

// Writing to a specific JSON file
// writeDatabase('user.json', userData);

// Querying a specific JSON file
// const activeUsers = queryDatabase('users.json', user => user.active); this doesnt work btw, mock example