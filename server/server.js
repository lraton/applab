let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let mysql = require('mysql');
let db=require( './db.js'); //dati database in un'altro file
let con;
let databaseOn=false;

io.sockets.on('connection', function (socket) {

  socket.emit('databaseOn', {database:databaseOn});   //dico se il login del databse e' gia' statyo effettuato

  socket.on('database', function(dati){ //mi collego al database e imposto lo sfondo
    con = mysql.createConnection({
      host: db.host,
      user: dati.user,
      password: dati.password,
      database: db.database
    });
    
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected to the database!");
    });

    databaseOn=true;

    impostaSfondo();
  });

  socket.on('sfondo', function(){ //imposto solo lo sfondo
    impostaSfondo();
  });

  socket.on('nome-colore', function (input) {//ricevo il nome e il colore da caricare nel database

    console.log("- input nome: ",input.nome);
    console.log("- input colore: ",input.colore);

    con.query("SELECT * FROM `nome_colore` WHERE nome=?",[input.nome], function (err, checknome) {
      if (err) throw err;
      if(checknome==''){
        con.query("INSERT INTO `nome_colore` (`nome`, `colore`) VALUES (?,?)",[input.nome,input.colore], function (err) {
          if (err) throw err;
          console.log("- Utente caricato nel database");
        });
      }else{ 
        con.query("UPDATE nome_colore SET colore = ? WHERE nome = ?",[input.colore,input.nome], function (err) {
          if (err) throw err;
          console.log("- Colore aggiornato nel database");
        });
      }
      
    });
  });

  function impostaSfondo(){
    con.query("SELECT colore, count(colore) as `value_occurrence` from nome_colore group by colore order by `value_occurrence` DESC LIMIT 1;", function (err, result) {
      if (err) throw err;
      if(result==''){//se non ci sono colori
        socket.emit('colore', {colore: 'red'});
        console.log('- Imposto sfondo:red');
      }else{  //imposto il piu' utilizzato
        let data=JSON.parse(JSON.stringify(result));
        socket.emit('colore', {colore: data[0].colore});
        console.log('- Imposto sfondo: ',data[0].colore);
      } });
  }
  
});



http.listen(3000, function () {
  console.log('listening on *:3000');
});