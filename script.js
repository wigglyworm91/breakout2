"use strict";
function between(a,b,c) {
	return a <= b && b < c;
}

var W_GAME = 500;
var H_GAME = 500;
var W_PADDLE = 100;
var H_PADDLE = 10;
var W_BALL = 10;
var H_BALL = 10;
var W_BRICK = 50;
var H_BRICK = 20;

class Physics {
	constructor() {
		this.px = 0;
		this.py = 0;
		this.vx = 0;
		this.vy = 0;
		this.width = 0;
		this.height = 0;
		this.elem = null;
		this.team = 0;
		this.bouncy = false;
	}

	update() {
		this.px += this.vx;
		this.py += this.vy;
		if (this.px < 0) {
			this.px = 0;
			this.vx = this.bouncy * Math.abs(this.vx);
		}
		if (this.px + this.width > W_GAME) {
			this.px = W_GAME - this.width;
			this.vx = this.bouncy * -Math.abs(this.vx);
		}
		if (this.py < 0) {
			this.py = 0;
			this.vy = this.bouncy * Math.abs(this.vy);
		}
		if (this.py + this.height > H_GAME) {
			this.py = H_GAME - this.height;
			this.vy = this.bouncy * -Math.abs(this.vy);
		}
	}

	draw() {
		if (this.elem) {
			this.elem.style.left = this.px + "px";
			this.elem.style.top = this.py + "px";
			this.elem.style.width = this.width + "px";
			this.elem.style.height = this.height + "px";
		}
	}

	collides(other) {
		// other: Physics

		var collides_x = (
			this.px + this.width > other.px &&
			this.px < other.px + other.width
		);
		var collides_y = (
			this.py + this.height > other.py &&
			this.py < other.py + other.height
		);
		return collides_x && collides_y;
	}

	center() {
		return [this.px + this.width/2, this.py + this.height/2];
	}
}

class Paddle extends Physics {
	constructor() {
		super();
		this.width = W_PADDLE;
		this.height = H_PADDLE;
		this.bouncy = false;
	}
}

class Ball extends Physics {
	constructor() {
		super();
		this.width = W_BALL;
		this.height = H_BALL;
		this.bouncy = true;
	}

	draw() {
		super.draw();
		if (this.elem) {
			this.elem.style.width = 0;
			this.elem.style.height = 0;
		}
	}
}

class Brick extends Physics {
	constructor() {
		super();
		this.width = W_BRICK;
		this.height = H_BRICK;
	}
}

function main() {
	var playing = true;
	var game = document.getElementById("game");

	var balls = [new Ball(), new Ball()];
	balls[0].elem = document.createElement("div");
	balls[0].elem.classList.add("ball");
	balls[0].elem.classList.add("team-0");
	balls[0].px = 225;
	balls[0].py = 400;
	balls[0].vx = Math.random() * 4 - 2;
	balls[0].vy = -2;
	game.appendChild(balls[0].elem);

	balls[1].elem = document.createElement("div");
	balls[1].elem.classList.add("ball");
	balls[1].elem.classList.add("team-1");
	balls[1].team = 1;
	balls[1].px = 225;
	balls[1].py = 100;
	balls[1].vx = Math.random() * 4 - 2;
	balls[1].vy = 2;
	game.appendChild(balls[1].elem);

	var paddles = [new Paddle(), new Paddle()];
	paddles[0].elem = document.createElement("div");
	paddles[0].elem.classList.add("paddle");
	paddles[0].elem.classList.add("team-0");
	game.appendChild(paddles[0].elem);
	paddles[0].px = 200;
	paddles[0].py = H_GAME - H_PADDLE - 20;

	paddles[1].elem = document.createElement("div");
	paddles[1].elem.classList.add("paddle");
	paddles[1].elem.classList.add("team-1");
	paddles[1].team = 1;
	game.appendChild(paddles[1].elem);
	paddles[1].px = 210;
	paddles[1].py = 20;

	// add bricks
	var bricks = [];
	for (var row = 0; row < H_GAME/H_BRICK; row++) {
		for (var col = 0; col < W_GAME/W_BRICK; col++) {
			var brick = document.createElement("div");
			brick.classList.add("brick");
			game.appendChild(brick);

			var myBrick = new Brick();
			myBrick.elem = brick;
			myBrick.px = col * W_BRICK;
			myBrick.py = row * H_BRICK;
			if (row >= H_GAME/H_BRICK/2) {
				myBrick.team = 1;
			}
			brick.classList.add("team-"+myBrick.team);
			myBrick.draw();
			bricks.push(myBrick);
		}
	}


	// key listener
	window.onkeydown = (e) => {
		if (e.key == "ArrowRight") {
			paddles[0].vx = 3;
		} else if (e.key == "ArrowLeft") {
			paddles[0].vx = -3;
		} else if (e.key == "d") {
			paddles[1].vx = 3;
		} else if (e.key == "a") {
			paddles[1].vx = -3;
		}
	};

	window.onkeyup = (e) => {
		if (e.key == "ArrowRight" || e.key == "ArrowLeft") {
			paddles[0].vx = 0;
		} else if (e.key == "a" || e.key == "d") {
			paddles[1].vx = 0;
		}
	}
	
	// event loop
	window.setInterval(() => {
		for (var myPaddle of paddles) {
			for (var myBall of balls) {
				if (myBall.collides(myPaddle)) {
					// collision with paddle
					myBall.vy *= -1;
					// which quintet?
					var quintet = (myBall.px - (myPaddle.px + W_PADDLE/2)) / W_PADDLE * 5;
					console.log('quintet', quintet);
					myBall.vx += quintet;
					console.log('vballx', myBall.vx);
				}
			}
		}

		// brick collisions
		for (var myBall of balls) {
		for (var myBrick of bricks) {
			if (myBrick.team != myBall.team) {
				continue;
			}
			if (myBrick.collides(myBall)) {
				// how?
				var dx = myBall.center()[0] - myBrick.center()[0];
				var dy = myBall.center()[1] - myBrick.center()[1];
				dy = -dy; // upside down math
				var angle = Math.atan2(dy, dx) * 180 / Math.PI;

				if (-15 <= angle && angle < 15) {
					// right
					myBall.vx = myBall.bouncy * Math.abs(myBall.vx);
				} else if (15 <= angle && angle < 165) {
					// top
					myBall.vy = myBall.bouncy * -Math.abs(myBall.vy);
				} else if (-165 <= angle && angle < -15) {
					// bottom
					myBall.vy = myBall.bouncy * Math.abs(myBall.vy);
				} else {
					// left
					myBall.vx = myBall.bouncy * -Math.abs(myBall.vx);
				}
				myBall.vx += Math.random() * 0.2 - 0.1;
				myBall.vy += Math.random() * 0.2 - 0.1;
				myBrick.elem.classList.remove("team-"+myBrick.team);
				myBrick.team = 1 - myBall.team;
				myBrick.elem.classList.add("team-"+myBrick.team);
				break;
			}
		}
		}

		// ball movement
		if (playing) {
			for (myBall of balls) {
				myBall.update();
				myBall.draw();
			}
		}


		// paddle
		for (myPaddle of paddles) {
			myPaddle.update();
			myPaddle.draw();
		}
	}, 10);
};

main();
