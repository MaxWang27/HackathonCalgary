var http = require('http');
var express = require('express');
var bodyParser = require("body-parser"); // Body parser for fetch posted data

var port = 3000;
// all environments

var app = express();

app.set('port', port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Body parser use JSON data

var pg = require('pg');
var conString = "postgres://postgres:1234@localhost/Hackathon";

app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ a: 1 }));
});

app.get('/get/:id', function (req, res) {
    console.log('id:' + req.params.id);
    var qid = req.params.id;
    pg.connect(conString, function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        else
            console.log('connect success');
        
        // record the conactus
        var qSql = 'SELECT data FROM activity where id = ($1) ';
        
        var values = [qid];

        var query = client.query(qSql, values, function (err, result) {
            
            if (err) return console.error('error running SELECT', err);
            
            // return the client to the connection pool for other requests to reuse
            done();
            //res.send({ success: true });
            console.log('in quotes rows = ' + result.rows.length);
            if (result.rows.length == 0) {
                console.log('222');
                res.send(JSON.stringify({ status : false }));
            }
            //console.log('req received');
            //res.redirect('/');
        });
        console.log('111');
        query.on("row", function (row, result) {
            console.log(JSON.stringify(row));
            var jsonObj = JSON.parse(JSON.stringify(row));
            for (var mykey in row) {
                console.log("key:" + mykey + ", value:" + row[mykey]);
            }
            res.send(JSON.stringify(row));
        });
    });
});

app.post('/add', function (req, res) {
    console.log(req.body);
    res.header("Access-Control-Allow-Origin", "*");

    pg.connect(conString, function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        else
            console.log('connect success');
        
        // record the conactus
        var insSql = 'INSERT INTO activity(' +
            'data, stamp)' +
            'VALUES( ($1), ($2) )';
        
        var values = [req.body, new Date()];

        client.query(insSql, values, function (err, result) {
            
            // handle an error from the query
            if (err) return console.error('error running INSERT', err);
            
            // get the total number of visits today (including the current visit)
            client.query('SELECT id FROM activity', function (err, result) {
                
                // handle an error from the query
                if (err) return console.error('error running SELECT', err);
                
                // return the client to the connection pool for other requests to reuse
                done();
                isOK = true;
                res.send({ success: true });
                console.log('quotes rows = ' + result.rows.length);
                //console.log('req received');
                //res.redirect('/');
            });

            if (err) {
                console.log('err');
                res.send(JSON.stringify({ status : false }));
            }
        });
    });
});

http.createServer(app).listen(app.get('port') , '0.0.0.0' , function () {
    console.log('Express server listening on port ' + app.get('port'));
    
});
