const socket = io.connect('http://localhost:3000', { transports : ['websocket'] });
let databaseOn=false;

function load(){
  socket.emit('connection');
}


socket.on('databaseOn', function(db){
  databaseOn=db.database;
  console.log(db.database);
  if(!databaseOn){
    let user = prompt("User database");
    let password = prompt("User password");
    socket.emit('database',{user:user, password:password});
  }else{
    socket.emit('sfondo');
  }
})

socket.on('colore', function (data) { //ricevo
  document.body.style.background = data.colore;
  console.log(data.colore);
});

function invia(){
  let getnome = document.getElementById('input');
  let getcolore = document.getElementById('colors');
  if (getnome.checkValidity() && getcolore.checkValidity() && getcolore.value!='null') {
    let nome = getnome.value;
    let colore = getcolore.value;
    console.log(colore);
    document.body.style.background = colore;
    nome=nome.replace(/\s/g, '');
    nome=nome.toLowerCase();
    socket.emit('nome-colore',{nome: nome, colore: colore});
  }else{
    alert("Riempi i campi");
  }
}