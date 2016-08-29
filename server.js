var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var TASKS_FILE = path.join(__dirname, 'tasks.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest tasks.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/tasks', function(req, res) {
  fs.readFile(TASKS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/tasks', function(req, res) {
  fs.readFile(TASKS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var tasks = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes.
    var newTask = {
      id: Date.now(),
      isDone: false,
      text: req.body.text,
    };
    tasks.push(newTask);
    fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(tasks);
    });
  });
});

app.delete('/api/tasks', function (req, res) {
  fs.readFile(TASKS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var tasks = JSON.parse(data);    
	tasks = tasks.filter(function(task) { 
		   return task.id != req.body.id;  
		});
		
    fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }	   
      res.json(tasks);
    });
  });  
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
