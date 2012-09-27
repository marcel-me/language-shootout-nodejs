var fs = require('fs'),
    http = require('http'),
    songDb = [];

var csv = {
  read: function(fileName, callback) {
    var stream = fs.createReadStream(fileName, { encoding: 'utf8' });
    var buffer = "", data = [];
    
    //buffer stream
    stream.addListener('data', function(data) {
      buffer += data;
    });

    //fill data after reading
    stream.addListener('end', function() {
      var lines = buffer.split('\n'), header;
      for(var i = 0; i < lines.length; i++) {
        if(i == 0) {
          //read header
          header = lines[0].split(";")
        } else {
          //read data 
          var values = lines[i].split(";"), record = {};
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

var server = {
  run: function() {
    http.createServer(function (req, res) {

      var render = function(form, data) { 
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<!DOCTYPE html>');
        res.write('<html>');
        res.write('<head>');
        res.write('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">');
        res.write('<title>Language Shooutout Node.js</title></head>');
        res.write('<h1>Sound Node</h1>')
        res.write('<form action="/" method="post">');
        res.write('Interpret <input type="text" name="Interpret" value="' + (form.interpret != null ? form.interpret : "") + '"" /><br/>');
        res.write('Wertung <input type="number" min="0" max="9" name="Wertung" value="' + (form.wertung != null ? form.wertung : "") + '" /><br/>');
        res.write('<button type="submit">Suchen</button>');
        res.write('</form>');
        res.write('<ul>');
        for(var i = 0; i < data.length; i++) {
          res.write('<li>' +  data[i].Interpret + ' - ' + data[i].Name + '(Album: ' + data[i].Album + ' / Wertung: ' + data[i].Wertung + ')');
        }
        res.write('</ul>');
        res.write('<body></body>');
        res.write('</html>');
        res.end();
      };

      if(req.method == 'POST') {
        var postBody = "";
        
        req.on('data', function(chunk) {
          postBody += chunk.toString();
        });

        req.on('end', function() {
          console.log(postBody);
          var form = { interpret: null, wertung: null }
          var filter = []
          var params = postBody.split('&');
          for(var i = 0; i < params.length; i++) {
            var keyAndValue = params[i].split('=');
            if(keyAndValue.length == 2) {
              if(keyAndValue[0] ==  "Interpret" && keyAndValue[1].length > 0) {
                form.interpret =  keyAndValue[1].replace("+", " ");
                filter.push(function(rec, criteria) { return (rec.Interpret == criteria.interpret) });
              } else if(keyAndValue[0] == "Wertung" && keyAndValue[1].length > 0) {
                form.wertung =  parseInt(keyAndValue[1]);
                filter.push(function(rec, criteria) { return ( parseInt(rec.Wertung) >= criteria.wertung) });
              }
            }
          }

          var filterdDb = [];

          for(var i = 0; i < songDb.length; i++) {
            if(filter.length > 0) {
              var matches = true;
              for(var k = 0; k < filter.length; k++) {
                matches = (matches && filter[k](songDb[i], form));
              }
              if(matches) {
                filterdDb.push(songDb[i]);
              }
            } else {
              filterdDb.push(songDb[i]);
            }
          } 

          render(form, filterdDb);
        });

      } else {
        render({ interpret: null, wertung: null }, songDb);
      }

    }).listen(1337, '127.0.0.1');
  }
}

csv.read('data/song_db_unicode.csv', function(data) {
  songDb = data;
  server.run();
});