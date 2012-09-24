var fs = require('fs');

console.log('Language Shootout with node.js');

var csvParser = {
  process: function(fileName) {
    var stream = fs.createReadStream(fileName, { bufferSize: 64 });
    stream.addListener('data', function(data) {
      console.log("Received:\n");
      console.log(data.toString());
      console.log("\n");
    });
  }
}

csvParser.process('data/song_db_unicode.csv');
console.log("finished");