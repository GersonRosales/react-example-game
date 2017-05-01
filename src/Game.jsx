import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';

var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

const Stars = (props) => {
	return (
		<div className="col-md-5">
			{_.range(0, props.numbersOfStars).map((i)=>
				<i key={i} className="fa fa-star"></i>
			)}
		</div>
	);
}

const Button = (props) => {
	let button;
	switch(props.answerIsCorret) {
		case true:
			button =
				<button className="btn btn-success" onClick={() => props.acceptAnswer()}>
					<i className="fa fa-check"></i>
				</button>;
			break;
		case false: 
			button =
				<button className="btn btn-danger">
					<i className="fa fa-times"></i>
				</button>;
			break; 
		default:
			button =
				<button className="btn" 
								disabled={props.selectedNumbers.length === 0}
								onClick={() => props.checkAnswer()}>
					=
				</button>;
			break;
	}
	return (
		<div className="col-md-2 text-center">
			{button}
			<br/>
			<br/>
			<button className="btn btn-warning btn-sm" onClick={props.redraw} disabled={props.redraws < 1}>
				<i className="fa fa-refresh"> {props.redraws}</i>
			</button>
		</div>
	);
}

const Answer = (props) => {
	return (
		<div className="col-md-5">
			{props.selectedNumbers.map((number, i) => 
				<span key={i}
							onClick={() => props.unselectNumber(number)}>
					{number}
				</span>
			)}
		</div>
	);
}

const Numbers = (props) => {
	const numberClassName = (number) => {
		if (props.usedNumbers.indexOf(number) >= 0 ) {
			return "used";
		} 
		if (props.selectedNumbers.indexOf(number) >= 0 ) {
			return "selected";
		} 
	}
	return (
		<div className="card text-center">
			<div>
				{Numbers.list.map((number, i)=>
					<span key={i} 
								className={numberClassName(number)} 
								onClick={() => props.selectNumber(number)}>
						{number}
					</span>
				)}
			</div>
		</div>
	);
}

Numbers.list = _.range(1, 10);

const DoneFrame = (props) => {
	return (
		<div className="text-center">
			<h2>{props.doneStatus}</h2>
			<button className="btn btn-secondary" onClick={() => props.resetGame()}>Play Again</button>
		</div>
	);
};

class Game extends Component {
	static randomNumber = () => Math.floor(Math.random()*9) + 1;
	state = {
		selectedNumbers: [],
		randomNumberOfStars: Game.randomNumber(),
		answerIsCorret: null,
		usedNumbers: [],
		redraws: 5,
		doneStatus: ""
	};
	selectNumber = (clickedNumber) => {
		console.log(" this.state.selectedNumbers "+this.state.selectedNumbers);
		console.log(" clickedNumber "+clickedNumber);
		console.log(" true false "+(this.state.selectedNumbers.indexOf(clickedNumber) < 0));
		if(this.state.selectedNumbers.indexOf(clickedNumber) < 0 && this.state.usedNumbers.indexOf(clickedNumber) < 0) {
			this.setState(prevState => ({
				answerIsCorret: null,
				selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
			}))
		}
	};
	unselectNumber = (clickedNumber) => {
		this.setState(prevState => ({
				answerIsCorret: null,
				selectedNumbers: prevState.selectedNumbers.filter(number => number !== clickedNumber)
		}))
	};
	checkAnswer = () => {
		this.setState(prevState => ({
			answerIsCorret: prevState.randomNumberOfStars === prevState.selectedNumbers.reduce((acc, n)	=> acc + n, 0)
		}))
	};
	acceptAnswer = () => {
		this.setState(prevState => ({
			usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
			selectedNumbers: [],
			answerIsCorret: null,
			randomNumberOfStars: Game.randomNumber(),
		}), this.updateDoneStatus)
	};
	redraw = () => {
		if (this.state.redraws === 0) { return }
		this.setState(prevState => ({
			randomNumberOfStars: Game.randomNumber(),
			answerIsCorret: null,
			selectedNumbers: [],
			redraws: prevState.redraws-1
		}), this.updateDoneStatus)
	};
	possibleSolitions = ({randomNumberOfStars, usedNumbers}) => {
		const possibleNumbers = _.range(1, 10).filter(number => 
			usedNumbers.indexOf(number) === -1
		);
		return possibleCombinationSum(possibleNumbers, randomNumberOfStars)
	};
	updateDoneStatus = () => {
		console.log("prevState.usedNumbers.length "+this.state.usedNumbers.length);	
		console.log("prevState.redraws "+this.state.redraws);
		this.setState(prevState => {
			if (prevState.usedNumbers.length === 9) {
				return { doneStatus: "Game Winner!" }
			}
			if (prevState.redraws === 0 && !this.possibleSolitions(prevState)) {
				return { doneStatus: "Game Over!" }
			}
		})
		console.log("prevState.usedNumbers.length "+this.state.usedNumbers.length);
		console.log("prevState.redraws "+this.state.redraws);
	};
	resetGame = () => {
		this.setState(prevState => ({
			selectedNumbers: [],
			randomNumberOfStars: Game.randomNumber(),
			answerIsCorret: null,
			usedNumbers: [],
			redraws: 5,
			doneStatus: ""	
		}))
	};
	render() {
		const {	selectedNumbers, 
						randomNumberOfStars, 
						answerIsCorret,
						usedNumbers,
						redraws,
						doneStatus
					} = this.state;
		return (
			<div className="container">
				<h3>Play Nine</h3>
				<hr />
				<div className="row">
					<Stars numbersOfStars={randomNumberOfStars}/>
					<Button selectedNumbers={selectedNumbers}
									answerIsCorret={answerIsCorret}
									checkAnswer={this.checkAnswer}
									acceptAnswer={this.acceptAnswer}
									redraw={this.redraw}
									redraws={redraws}/>
					<Answer selectedNumbers={selectedNumbers}
									unselectNumber={this.unselectNumber}/>
				</div>
				<hr />
				{doneStatus ?
					<DoneFrame doneStatus={doneStatus}
											resetGame={this.resetGame}/> : 
					<Numbers selectedNumbers={selectedNumbers} 
									selectNumber={this.selectNumber}
									usedNumbers={usedNumbers}/>
				}
			</div>
		);
	}
}

export default Game;
