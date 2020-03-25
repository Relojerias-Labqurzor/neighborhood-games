const socket = io({
	forceNew: false
})
let state = {
	isReady: false
}

init()

/**
 * Socket stuff
 */

socket.on('get_players', players => {
	$('#players').empty()
	players.map(({player}) => {
		$('#players').append(`<li id="${player.id}">· ${player.team}</li>`)
		setMessage(`New Player!: ${player.team}`)
	})
})

socket.on('change_button', isReadyFromServer => {
	state.isReady = isReadyFromServer
	setButtonColor((!isReadyFromServer) ? 'button-yellow' : 'button-gray')
})

socket.on('team_clicked', playerWhoAnswer => {
	setMessage(`<b>${playerWhoAnswer.team}</b> clicked the button!`)
	setAnswerMsg(playerWhoAnswer)
})

socket.on('spread_server_msg', msg => {
	setMessage(msg.content)
})

/**
 * Events
 */

$('#button').click(() => {
	state.isReady = !state.isReady
	socket.emit('button_ready', state.isReady)
	setButtonColor((state.isReady) ? 'button-gray' : 'button-yellow')
	if (state.isReady) {
		sendMsgToAllPlayers('Answer the question!')
	}
})

/**
 * Functions
 */

const setAnswerMsg = player => {
	setMessage(`<span class="spAnswer">Is the answer <a class="button-green-min" href="#" onclick="checkAnswer(true, \'${player.id}\')">CORRECT</a> or <a class="button-red-min" href="#" onclick="checkAnswer(false, \'${player.id}\')">INCORRECT</a>?</span>`)
}

const checkAnswer = (isValid, playerId) => {
	$('.spAnswer').remove()
	const strValid = (isValid) ? 'CORRECT' : 'INCORRECT'
	const classValid = (isValid) ? 'button-green-min' : 'button-red-min'
	const msg = `The answer is... <span class="${classValid}">${strValid}</span>`
	
	setMessage(msg)
	sendMsgToAllPlayers(msg)
	
	socket.emit('check_answer', {
		isValid,
		playerId
	})
}

const sendMsgToAllPlayers = content => {
	socket.emit('new_msg', {
		name: 'Moderator',
		content
	})
}

function init() {
	setMessage('<h4>Welcome to the Panel!. Waiting for the teams...</h4>')
	socket.emit('get_players')
}