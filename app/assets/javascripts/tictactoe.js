var turn = 0;
var currentGame = 0;
const combo = [
              [0,1,2],
              [3,4,5],
              [6,7,8],
              [0,4,8],
              [0,3,6],
              [2,4,6],
              [2,5,8],
              [1,4,7]
            ];

function player() {
  return turn % 2 === 0 ? 'X' : 'O';
}


function updateState(square) {
  let token = player();
  $(square).text(token);
}

function setMessage(msg) {
  $('#message').text(msg);
}

function getBoardState() {
  const squares = $('td');
  const arr = [];
  for(let i = 0; i < squares.length; i++) {
    arr[i] = squares[i].innerHTML;
  }
  return arr;
}

function checkWinner() {
  const board = getBoardState();
  for(let i = 0; i < combo.length; i++){
    if(board[combo[i][0]] === 'X' && board[combo[i][1]] === 'X' && board[combo[i][2]] === 'X'){
      const str = 'Player X Won!';
      setMessage(str);
      return true;
    } else if (board[combo[i][0]] === 'O' && board[combo[i][1]] === 'O' && board[combo[i][2]] === 'O') {
      const str = 'Player O Won!';
      setMessage(str);
      return true;
    }
  }
  return false;
}

function doTurn(square) {
  updateState(square);
  if(checkWinner()) {
    saveGame();
    clearGame();
    return;
  }
  window.turn += 1;
  if(window.turn === 9) {
    checkWinner();
    setMessage("Tie game.")
    saveGame();
    clearGame();
  }
}

function saveGame() {
  const state = getBoardState();
  gameState = {state: state}
  if(currentGame) {
    $.ajax({
    type: "PATCH",
    url: `/games/${currentGame}`,
    data: gameState,
  });
  } else {
    $.post('/games', gameState, function(game){
      currentGame = parseInt(game.data.id)
      let state = `<button>${currentGame}</button>`;
      $('#games').append(state)
    });
  }
}

function previousGames() {
  $.get('/games', function(resp){
    const games = resp['data'];
    for(let i = 0; i < games.length; i++){
      let state = `<button>${games[i].id}</button>`;
        if($('button')[i].innerHTML != games[i].id){
          $('#games').append(state);
        }
    }
  });
}

function clearGame() {
  window.turn = 0;
  currentGame = 0;
  $('td').empty();
}

function loadGame() {
  window.turn = 0;
  let game = this.innerHTML
  if(game){
    $.get(`/games/${this.innerHTML}`, function(resp){
      const state = resp['data']['attributes']['state']
      const squares = $('td');
      window.currentGame = parseInt(game);
    //  $('pushState').context.document
      for(let i = 0; i < squares.length; i++){
        if(state[i] != ''){window.turn++}
        squares[i].innerHTML = state[i];
      }
    });
  }
}

function attachListeners() {
  $('td').click(function(){
    if(!$.text(this) && !checkWinner()){
      doTurn(this);
    }
  });
  $('#save').click(function(){saveGame()});
  $('#previous').click(function(){previousGames()});
  $('#clear').click(function(){clearGame()});
  $(document).on("click", "#games button", loadGame);
//  $('#games button').click(function(){loadGame()});
}

$(document).ready(attachListeners);
