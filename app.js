var fs = require('fs');

console.log('Language Shootout with node.js');

var csvParser = {
  read: function(fileName, callback) {
    var stream = fs.createReadStream(fileName, { encoding: 'utf8' });
    var buffer = "", data = [];
    
    //buffer stream
    stream.addListener('data', function(data) {
      buffer += data;
    });

    //fill data
    stream.addListener('end', function() {
      var lines = buffer.split('\n'), header;
      for(var i = 0; i < lines.length; i++) {
        if(i == 0) {
          //read header
          header = lines[0].split(";")
        } else {
          //read data 
          var values = lines[1].split(";"), record = {};
          for(var k = 0; k < values.length; k ++) {
            record[header[k]] = values[k];
          }
          data.push(record);
        }
      }
      callback(data);
    })
  }
}

csvParser.read('data/song_db_unicode.csv', function(data) {
  console.log(data.length);
});