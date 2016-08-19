var config = {
	    apiKey: "AIzaSyBhr2Yd9RjcpyPSzDe8duFSDmQ5tlIEBBM",
	    authDomain: "daves-first-firebase.firebaseapp.com",
	    databaseURL: "https://daves-first-firebase.firebaseio.com",
	    storageBucket: "daves-first-firebase.appspot.com",
	};
firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();
var playersRef = database.ref("/players");
var turnRef = database.ref('/turn');
var messageRef = database.ref('/message');
var converseRef = database.ref('/smack');
var playersConnected = database.ref(".info/connected");
var someone="";
var thisInstance=1;
var clicked=false;
var players = [
	{
		choice:"",
		losses:0,
		name:"",
		wins:0
	},
	{
		choice:"",
		losses:0,
		name:"",
		wins:0
	}
];
var gameState="choosePlayer";
var turn=1;
var outcome="";
// When the client's connection state changes...
playersConnected.on('value', function(snap){
	turnRef.set(turn);
	players[0].choice="";
	players[1].choice="";
	clicked=false;
		var location=(thisInstance).toString();
		playersRef.child(location).onDisconnect().remove();
	// playersConnected.onDisconnect().remove();
	return false;
})

playersRef.on('value',function(snapshot){
	var temp=snapshot.val();
		for (var i=0;i<players.length;i++){
			// console.log(snapshot.child(i.toString()));
			if (snapshot.child(i.toString()).exists()){
				players[i].choice=temp[i].choice;
				players[i].losses=temp[i].losses;
				players[i].name=temp[i].name;
				players[i].wins=temp[i].wins;
			}else {
				clearPlayers(i);
			}
		}	
		playersRef.set(players);
		playerDisp();
		if (players[1].name!="" && players[0].name!=""){
			gameState='play'
			gamePlay();
		}
		// var anotherloc=(thisInstance).toString();
		// console.log(thisInstance);
		// playersRef.child(anotherloc).onDisconnect().remove();
	return false;
}, function (errorObject) {

  	console.log("The read failed: " + errorObject.code);

});

messageRef.on('value', function(snapshot){
	outcome=snapshot.val();
	if (outcome!=null){
		$('#message').html(outcome);
	}
}, function (errorObject) {

  	console.log("The read failed: " + errorObject.code);

});

turnRef.on('value',function(snap){
	turn=snap.val();
}, function (errorObject) {

  	console.log("The read failed: " + errorObject.code);

});
$('#reset').on('click', function(){
	database.ref().remove();
	location.reload();
});
$('#addPlayer').on('click',function(){
	clicked=true;
	if (players[0].name ===""){
		players[0].name=$('#name').val().trim();
	}else {
		players[1].name=$('#name').val().trim();
		thisInstance=2;
		playerDisp();
		gameState="play";
		}
	playersRef.set(players);
	return false;
});
$('#converse').on('click', function(){

	var input=$('#smack').val().trim();
	var inputStuff=$('<p>').html($('#smack').val().trim()).append('<br>');
	converseRef.push(input);
	$('#smackbox').append(inputStuff);
});

converseRef.on('value', function(snap){
	var input=snap.val();
	console.log(inputStuff);
	var inputStuff=$('<p>').html($('#smack').val().trim()).append('<br>');
	$('#smackbox').append(inputStuff);

});

function playerDisp(){
		for (var i=0;i<players.length;i++){
			if (players[i].name !=""){
				$('#player'+(i+1)).empty();
				var playerInfo=$('<h3>').html(players[i].name).append('<br>','<h4>'+'Wins: '+players[i].wins+
					' Losses: '+players[i].losses);
				$('#player'+(i+1)).append(playerInfo);
				if (players[i].choice!="" && turn!=thisInstance){
					$('#player'+(i+1)).append('<h1>'+players[i].choice);
				}
				if (clicked && i==(thisInstance-1)){
					$('#nameInput').empty();
					var playerHead=$('<h4>').html('Hi '+players[i].name+'! You are Player '+(i+1));
					if (players[1].name=="" && thisInstance==1){
						playerHead.append('<br>','<h4>'+'Waiting for another player to join.');
					}
					$('#nameInput').append(playerHead);

				}
			}else {
				$('#player'+(i+1)).empty();
				$('#player'+(i+1)).append($('<h3>').html('Waiting for Player '+(i+1)));
			}	
		}
	return false;
}

function gamePlay(){
	turnRef.set(turn);
	var oppturn=0;
	$('#player'+turn).css('border-color','yellow');
	if (turn==1){oppturn=2}else{oppturn=1};
	$('#player'+oppturn).css('border-color','black');
	if (thisInstance==turn){
		setChoices();
	}else {

	}
	$('.choiceButton').on('click',function(){
			var playerChoice=$(this).attr('value');
			var result="";
			messageRef.set("");
			if (players[0].choice==""){
				players[0].choice=playerChoice;
				setPlayer(2);
				playersRef.set(players);
			}else if(players[1].choice==""){
				players[1].choice=playerChoice;
				gameState="compare";
				if (players[0].choice =='Rock'){
					if (players[1].choice =='Paper'){
						result=players[1].name+' Wins!!';
						players[1].wins++;
						players[0].losses++;
					}else if(players[1].choice == 'Scissors'){
						result=players[0].name+' Wins!!';
						players[0].wins++;
						players[1].losses++;
					}else {result='Tie!!'}
				}else if (players[0].choice=='Paper'){
					if (players[1].choice =='Scissors'){
						result=players[1].name+' Wins!!';
						players[1].wins++;
						players[0].losses++;
					}else if(players[1].choice=='Rock'){
						result=players[0].name+' Wins!!';
						players[0].wins++;
						players[1].losses++;
					}else {
						result='Tie!!';
					}
				}else {
					if (players[1].choice=='Rock'){
						result=players[1].name+' Wins!!';
						players[1].wins++;
						players[0].losses++;
					}else if(players[1].choice=='Paper'){
						result=players[0].name+' Wins!!';
						players[0].wins++;
						players[1].losses++;
					}else {
						result='Tie!!';
					}
				}
				outcome='<h1>'+result+'</h1';
				messageRef.set(outcome);
				playersRef.set(players);
				setPlayer(1);
				playerDisp();
				setTimeout(reset,1500);
			}	
	});	
	return false;
}
function setPlayer(playersturn){
	turn=playersturn;
	turnRef.set(turn);
	// gamePlay();
	return false;
}

function setChoices(){
		console.log(thisInstance);
		var insertRPS=$('<div>').attr('id','rps');
		insertRPS.append($('<button>').attr({'class':'choiceButton','value':'Rock'}).append('<h3>'+'Rock'));
		insertRPS.append($('<button>').attr({'class':'choiceButton','value':'Paper'}).append('<h3>'+'Paper'));
		insertRPS.append($('<button>').attr({'class':'choiceButton','value':'Scissors'}).append('<h3>'+'Scissors'));
		$('#player'+turn).append(insertRPS);
		$('#nameInput').empty();
		var playerHead=$('<h4>').html('Hi '+players[thisInstance-1].name+'! You are Player '+(thisInstance));
		playerHead.append($('<h4>').html('It\'s your turn.'));
		$('#nameInput').append(playerHead);
	return false;
}
function reset(){
	players[0].choice="";
	players[1].choice="";
	setPlayer(1);
	playersRef.set(players);
	gameState='play';
	gamePlay();
	return false;	
}
function clearPlayers(i){
	players[i].choice="";
	players[i].losses=0;
	players[i].name="";
	players[i].wins=0;
	return false;
}
