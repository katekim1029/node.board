var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var dotenv = require('dotenv');
dotenv.config();

var dataPath = path.join(__dirname, '../data', 'data.json');

router.get('/', (req, res) => {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    res.send(JSON.parse(data));
  });
});

module.exports = router;
