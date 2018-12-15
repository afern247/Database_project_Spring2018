
const express = require('express');
const app = express();                      // Instance of express
const chalk = require('chalk');             // To color text on console.log
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');               // for errors, npm install cors
const cons = require('consolidate');        // To setup the view engine, npm install consolidate
// npm install path --save, built in so we don't have to deal with the / or the \ with the path on the pages (don't have to npm), it forms a valid path
const path = require('path');
const port = 3000;                          // Port to use when connecting to the database


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
 extended: true
}));


/****************************** MySQL Connection config *******************************/

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'henrydb'
});

// Connect to database
db.connect(function (err) {
    console.log("\nDataBase Connected!");
    console.log(`Listening on port: --> ${chalk.yellow(port)} <--`);
  });



/****************************** Config paths *******************************/

// For js and css from node_modules so we don't have to copy files everytime, simply do npm
// update to get the new updates, instead of copying new updated files all the time
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
// if we got a css look in public, if it's not there, then look in here, look into node_modules
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.set('views', './views'); // have a default Views directory setup. The 'set' allows to set something on the application instance
//app.set('view engine', 'ejs');  //View Engine set to EJS
app.use(express.static(__dirname + '/views'));  //Telling the app where to look for to render the html files


// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');



/****************************** Queries *******************************/

// default route
app.get('/', function (req, res) {});


// Home search, returns all the values of the search and prints it on the screen. for example: http://localhost:3000/search/Venice
app.get('/search/:s', function (req, res) {
 let s_value = req.params.s;
 let sql = " select title, publisherName, branchName, OnHand, copyNum, quality, authorFirst, authorLast ";
 sql +=" FROM book as bk join wrote as wrt on wrt.bookCode = bk.bookCode join author as atr on atr.authorNum = wrt.authorNum ";
 sql +=" join copy as cp on cp.bookCode = bk.bookCode join branch as br on br.branchNum = cp.branchNum join inventory as inv on inv.BookCode = cp.bookCode ";
 sql +=" join publisher as ph on ph.publisherCode = bk.publisherCode ";
 sql +=" where title like '%" + s_value + "%' ";
 sql +=" order by title, sequence";

 console.log(sql)
 db.query(sql, function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results, message: 'Author List.' });
 })
});


// Get Books
app.get('/book', function (req, res) {
 db.query('SELECT * FROM book', function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results, message: 'Book List.' });
 });
});

// Get Publishers
app.get('/publisher', function (req, res) {
 db.query('SELECT * FROM publisher', function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results, message: 'Publisher List.' });
 });
});

// Get Author
app.get('/author', function (req, res) {
 db.query('SELECT * FROM author', function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results, message: 'Author List.' });
 });
});

// Get Copy
app.get('/copy', function (req, res) {
 db.query('SELECT * FROM copy', function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results, message: 'Copy List.' });
 });
});

// Get Copy
app.get('/branch', function (req, res) {
    db.query('SELECT * FROM branch', function (error, results, fields) {
    if (error) throw error;
    return res.send({ error: false, data: results, message: 'Copy List.' });
    });
   });




// Retrieve book with id as parameter
app.get('/book/:id', function (req, res) {
 let book_id = req.params.id;
 let sql = "SELECT * FROM book where bookCode=" + "'" + req.params.id + "'";
 db.query(sql, book_id , function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results[0], message: 'Selected book .' + sql });
 });
});

// Retrieve Publisher with id as parameter
app.get('/Publisher/:id', function (req, res) {
 let book_id = req.params.id;
 let sql = "SELECT * FROM Publisher where publisherCode=" + "'" + req.params.id + "'";
 db.query(sql, book_id , function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results[0], message: 'Selected publisher .' + sql });
 });
});

// Retrieve author with id as parameter
app.get('/author/:id', function (req, res) {
 let book_id = req.params.id;
 let sql = "SELECT * FROM author where authorNum=" + "'" + req.params.id + "'";
 db.query(sql, book_id , function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results[0], message: 'Selected author .' + sql });
 });
});

// Retrieve copy with id as parameter
app.get('/copy/:id', function (req, res) {
 let copy_id = req.params.id;
 let sql = "SELECT * FROM copy where bookCode =" + "'" + req.params.id + "'";
 db.query(sql, book_id , function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results[0], message: 'Selected copy .' + sql });
 });
});

// Retrieve brach with id as parameter
app.get('/copy_1/:id/:branch/:no', function (req, res) {
    let book_id = req.params.id;
    let sql = "SELECT * FROM copy where bookCode ='" +  book_id + "'   AND branchNum =" + req.params.branch + " AND copyNum =" + req.params.no ;
    console.log(sql);
    db.query(sql, book_id , function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results[0], message: 'Selected copy .' + sql });
        });
});



/****************************** Queries *******************************/

// Add a new Book
app.post('/book', function (req, res) {

 var bookCode = req.param('bookCode');
 var title = req.param('title');
 var publisherCode = req.param('publisherCode');
 var type = req.param('type');
 var paperback = req.param('paperback');
 var sql_statement = 'INSERT INTO book ( bookCode , title , publisherCode , type , paperback ) '
 sql_statement += "VALUES ('" + bookCode + "','" + title +"','" + publisherCode + "','"+ type + "','"+ paperback +"')";

 console.log( sql_statement);

 db.query(sql_statement, function (error, results, fields) {
 if (error) {
 console.log( "Duplicated Key");
 return res.send({ error: false, data: bookCode , message: 'ER_DUP_ENTRY' });
 }
 return res.send({ error: false, data: bookCode , message: 'New book has been created successfully.' });
 });
});

/* Add a new publisher */
app.post('/publisher', function (req, res) {

 var publisherCode = req.param('publisherCode');
 var publisherName = req.param('publisherName');
 var city = req.param('city');
 var sql_statement = 'INSERT INTO publisher ( publisherCode , publisherName , city ) '
 sql_statement += "VALUES ('" + publisherCode + "','" + publisherName +"','" + city + "')";

 console.log(sql_statement);
 db.query(sql_statement, function (error, results, fields) {
 if (error) {
 console.log( "Duplicated Key");
 return res.send({ error: false, data: publisherCode , message: 'ER_DUP_ENTRY' });
 }
 return res.send({ error: false, data: publisherCode , message: 'New publisher has been created successfully.' });
 });
});

/* Add a new Author */
app.post('/author', function (req, res) {

 var authorNum = req.param('authorNum');
 var authorFirst = req.param('authorFirst');
 var authorLast = req.param('authorLast');
 var sql_statement = 'INSERT INTO author ( authorNum , authorFirst , authorLast ) '
 sql_statement += "VALUES ('" + authorNum + "','" + authorFirst +"','" + authorLast + "')";

 console.log(sql_statement);
 db.query(sql_statement, function (error, results, fields) {
 if (error) {
 console.log( "Duplicated Key");
 return res.send({ error: false, data: authorNum , message: 'ER_DUP_ENTRY' });
 }
 return res.send({ error: false, data: authorNum , message: 'New author has been created successfully.' });
 });
});

/* Add a new Copy */
app.post('/copy', function (req, res) {
    var bookCode = req.param('bookCode');
    var branchNum = req.param('branchNum');
    var copyNum = req.param('copyNum');
    var quality = req.param('quality');
    var price = req.param('price');
    var sql_statement = 'INSERT INTO copy ( bookCode , branchNum , copyNum , quality , price ) '
    sql_statement += "VALUES ('" + bookCode + "','" + branchNum +"','" + copyNum + "','"+ quality + "','"+ price +"')";
    console.log('To SQL =>' + sql_statement);
        db.query(sql_statement, function (error, results, fields) {
        if (error) {
            console.log( "Duplicated Key");
            return res.send({ error: false, data: "" , message: 'ER_DUP_ENTRY' });
        }
        else
        return res.send({ error: false, data: bookCode , message: 'New copy has been created successfully.' });
    });
});




////////// UPDATE ////////////////////////////////////////////////////////////////////////////////////////////////
/* Update Book with id */
app.put('/book/:id', (req, res) => {

 let sql_statement ="UPDATE book SET ";
 sql_statement += "title ='"+ req.body.title + "' , ";
 sql_statement += "publisherCode ='"+ req.body.publisherCode + "' , ";
 sql_statement += "type ='"+ req.body.type + "' , ";
 sql_statement += "paperback ='"+ req.body.paperback + "' ";
 sql_statement += "WHERE bookCode ='" + req.body.bookCode +"' ";
 console.log(sql_statement);
 db.query( sql_statement , function (error, results, fields) {
 if (error) throw error;
 return res.send({'ok':'An error has occurred'});
 });
 });

/* Update publisher with id */
app.put('/publisher/:id', (req, res) => {

 let sql_statement ="UPDATE publisher SET ";
 sql_statement += "publisherName ='"+ req.body.publisherName + "' , ";
 sql_statement += "city ='"+ req.body.city + "' ";
 sql_statement += "WHERE publisherCode ='" + req.body.publisherCode +"' ";
 console.log(sql_statement);
 db.query( sql_statement , function (error, results, fields) {
 if (error) throw error;
 return res.send({'ok':'An error has occurred'});
 });
});

/* Update author with id */
app.put('/author/:id', (req, res) => {

 let sql_statement ="UPDATE author SET ";
 sql_statement += "authorFirst ='"+ req.body.authorFirst + "' , ";
 sql_statement += "authorLast ='"+ req.body.authorLast + "' ";
 sql_statement += "WHERE authorNum =" + req.body.authorNum ;
 console.log(sql_statement);

 db.query( sql_statement , function (error, results, fields) {
 if (error)    throw error;
 res.send({'ok':'An error has occurred'});
 });
});

/* Update Copy with id */
app.put('/copy/:id', (req, res) => {

 let sql_statement ="UPDATE copy ";
 sql_statement += "SET quality ='"+ req.body.quality    + "',";
 sql_statement += "price = "+ req.body.price;
 sql_statement += " WHERE bookCode ='" + req.body.bookCode +"' AND branchNum = " + req.body.copyNum  + " AND copyNum ="  + req.body.copyNum ;
 console.log(sql_statement);
 db.query( sql_statement , function (error, results, fields) {
   if (error)  throw error;
   return res.send({'ok':sql_statement });
});
});



///////////////////////// DELETE /////////////////////////////////////////////////////////////////////////////////
/* Delete a Book */
app.delete('/book/:id', function (req, res) {
 let book_id = req.params.id;
 let sql = "DELETE FROM book where bookCode = " + "'" + req.params.id + "'";
 console.log(sql);

 db.query(sql, book_id , function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results[0], message: 'Selected book .' + sql });
 });
});

/* Delete a Publisher */
app.delete('/publisher/:id', function (req, res) {
 let publisher_id = req.params.id;
 let sql = "DELETE FROM publisher where publisherCode = " + "'" + req.params.id + "'";
 console.log(sql);

 db.query(sql, publisher_id , function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results[0], message: 'Selected publisher .' + sql });
 });
});

/* Delete a Author */
app.delete('/author/:id', function (req, res) {
 let author_id = req.params.id;
 let sql = "DELETE FROM author where authorNum = " + "'" + req.params.id + "'";
 console.log(sql);

 db.query(sql, author_id , function (error, results, fields) {
 if (error) throw error;
 return res.send({ error: false, data: results[0], message: 'Selected author .' + sql });
 });
});

/* Delete a Copy */
app.delete('/copy/:id/:branch/:no', function (req, res) {
    let sql = "DELETE FROM copy " //where bookCode = " + "'" + req.params.id + "'";
        sql += "where bookCode ='" +  req.params.id + "'   AND branchNum =" + req.params.branch + " AND copyNum =" + req.params.no ;
    console.log(sql);
    db.query(sql, req.params.id , function (error, results, fields) {
    if (error) throw error;
    return res.send({ error: false, data: results[0], message: 'Selected copy .' + sql });
    });
   });




/* all other requests redirect to 404 */
app.all("*", function (req, res, next) {
 return res.send('Ups! Looks like you are in the wrong page :)');
 next();
});

/* port must be set to 3000 because incoming http requests are routed from port 80 to port 3000 */
// Get NodeJS running
app.listen(port, () => {
  });


/* allows "grunt dev" to create a development server with livereload */
module.exports = app;

