<script>
	import { onMount } from 'svelte';
	onMount(() => {
		const save = document.getElementById('save').getContext('2d');
		const board = document.getElementById('board').getContext('2d');
		const queue = document.getElementById('queue').getContext('2d');
		let FALL_SPEED = 333;
		const DAS = 80;
		const colors = ['red', 'yellow', 'blue'];
		const SKIPS = 20;
		let grid = null;
		let piece = null;
		let starting = false;
		let pieceNum = 1;
		let ghost = null;
		let colorSpread = { red: 0, yellow: 0, blue: 0, total: 0 };
		let timeout = null;
		let held = null;
		let hold = null;
		let groundMoves = 0;
		let pillCount = 0;
		let usedHold = false;
		let startTime = new Date();
		let idle = false;
		board.font = '36px Arial';
		board.textAlign = 'center';

		const startGame = () => {
			if (starting) return;
			starting = true;
			if (held) clearTimeout(held.timeout);
			clearTimeout(timeout);
			board.clearRect(0, 0, 248, 496);
			queue.clearRect(0, 0, 128, 496);
			save.clearRect(0, 0, 128, 496);
			document.removeEventListener('keydown', handleInput);
			document.removeEventListener('keyup', keyUpListener);
			FALL_SPEED = 250;
			grid = Array.from({ length: 16 }).map(() => Array.from({ length: 8 }));
			piece = null;
			groundMoves = 0;
			pieceNum = 1;
			idle = false;
			ghost = null;
			colorSpread = { red: 0, yellow: 0, blue: 0, total: 0 };
			timeout = null;
			held = null;
			hold = null;
			usedHold = false;
			startTime = new Date();
			initVirus();
			draw();
			board.fillStyle = 'black';
			board.fillRect(0, 238, 248, 56);
			board.fillStyle = 'white';
			board.fillText('Ready?', 124, 278);
			setTimeout(initGo, 1000);
		};

		const initGo = () => {
			board.clearRect(0, 0, 248, 496);
			draw();
			board.fillStyle = 'black';
			board.fillRect(0, 238, 248, 56);
			board.fillStyle = 'white';
			board.fillText('Go!', 124, 278);
			setTimeout(initGame, 1000);
		};

		const initGame = () => {
			board.clearRect(0, 0, 248, 496);
			document.addEventListener('keydown', handleInput);
			document.addEventListener('keyup', keyUpListener);
			draw();
			timeout = setTimeout(updatePiece, FALL_SPEED);
			starting = false;
		};

		const inRange = (row, col) => row < grid.length && col >= 0 && col < grid[0].length;

		const createPill = () => {
			let pill = [];
			if (colorSpread.total === 24) colorSpread = { red: 0, yellow: 0, blue: 0, total: 0 };
			for (let i = 0; i < 2; i++) {
				let random = Math.floor(Math.random() * 3);
				while (colorSpread[colors[random]] === 8) {
					random = Math.floor(Math.random() * 3);
				}
				colorSpread[colors[random]]++;
				colorSpread.total++;
				pill.push([3 + i, 0, colors[random]]);
			}
			return pill;
		};
		const canMoveDown = (pill) => {
			let x = pill[0][0];
			let y = pill[0][1];
			if (y + 1 === grid.length || grid[y + 1][x]) return false;
			if (y !== pill[1][1]) return true;
			return !grid[y + 1][x + 1];
		};
		const canMoveLeft = (pill) => {
			let x = pill[0][0];
			let y = pill[0][1];
			if (x - 1 < 0 || grid[y][x - 1]) return false;
			if (y === pill[1][1] || pill[1][1] === -1) return true;
			return inRange(y - 1, x - 1) && !grid[y - 1][x - 1];
		};
		const canMoveRight = (pill) => {
			let x = pill[1][0];
			let y = pill[1][1];
			if (y !== -1) {
				if (x + 1 >= grid[0].length || grid[y][x + 1]) return false;
			}
			if (y === pill[0][1]) return true;
			return inRange(y + 1, x + 1) && !grid[y + 1][x + 1];
		};
		const updatePiece = () => {
			if (!piece) draw();
			if (idle) return;
			if (canMoveDown(piece)) {
				piece.forEach((pill) => {
					pill[1]++;
				});
			} else {
				if (groundMoves === 3) {
					piece.forEach((pill) => {
						if (pill[1] !== -1) grid[pill[1]][pill[0]] = [pill[2], pieceNum];
					});
					pieceNum++;
					piece = null;
					groundMoves = 0;
				} else {
					groundMoves++;
				}
			}
			if (piece && held && held.holding) {
				das();
				if (piece) updateGhost();
			}
			timeout = setTimeout(updatePiece, FALL_SPEED);
			draw();
		};
		const updateGhost = () => {
			ghost = JSON.parse(JSON.stringify(piece));
			while (canMoveDown(ghost)) {
				ghost[0][1]++;
				ghost[1][1]++;
			}
		};
		const findFit = (temp) => {
			let directions = [
				[0, 0],
				[0, 1],
				[1, 0],
				[-2, 0],
				[0, -1],
				[2, 0],
				[0, -1],
				[-1, 0],
				[-1, 0]
			];
			return directions.some((dir) => {
				temp.forEach((pill) => {
					pill[0] += dir[0];
					pill[1] += dir[1];
				});
				if (
					inRange(temp[0][1], temp[0][0]) &&
					inRange(temp[1][1], temp[1][0]) &&
					!grid[temp[0][1]][temp[0][0]] &&
					(temp[1][1] === -1 || !grid[temp[1][1]][temp[1][0]])
				)
					return true;
			});
		};
		const rotate = (dir) => {
			let temp = JSON.parse(JSON.stringify(piece));
			if (temp[0][0] === temp[1][0]) {
				temp[1][0]++;
				temp[1][1]++;
				if (dir === -1) [temp[0][2], temp[1][2]] = [temp[1][2], temp[0][2]];
			} else {
				temp[1][0]--;
				temp[1][1]--;
				if (dir === 1) [temp[0][2], temp[1][2]] = [temp[1][2], temp[0][2]];
			}
			if (findFit(temp)) {
				piece = temp;
				if (held?.holding) das();
				updateGhost();
				draw();
			}
		};
		const holdPiece = () => {
			if (usedHold) return;
			usedHold = true;
			let temp = JSON.parse(JSON.stringify(piece));
			if (hold) {
				piece = hold;
				if (held?.holding) das();
				updateGhost();
			} else {
				piece = q.shift();
				if (held?.holding) das();
				updateGhost();
			}
			groundMoves = 0;
			temp[0][1] = 0;
			temp[0][0] = 3;
			temp[1][1] = 0;
			temp[1][0] = 4;
			hold = temp;
			draw();
		};
		let q = Array.from({ length: 5 }).map(() => createPill());
		const clear = (arr) => {
			arr.forEach((coord) => {
				grid[coord[0]][coord[1]] = null;
			});
		};
		const gameOver = (win) => {
			if (held) clearTimeout(held.timeout);
			clearTimeout(timeout);
			board.clearRect(0, 0, 248, 496);
			queue.clearRect(0, 0, 128, 496);
			save.clearRect(0, 0, 128, 496);
			document.removeEventListener('keydown', handleInput);
			document.removeEventListener('keyup', keyUpListener);

			// Draw text
			board.font = '24px Arial';
			board.fillStyle = 'white';
			if (win)
				board.fillText(`You win, time: ${((new Date() - startTime) / 1000).toFixed(2)}s`, 124, 278);
			else board.fillText('You lose', 124, 278);
		};
		const checkToWin = () => {
			if (idle) return;
			for (let i = 3; i < grid.length; i++) {
				for (let j = 0; j < grid[0].length; j++) {
					if (grid[i]?.[j]?.[1] === 0) return;
				}
			}
			gameOver(true);
			idle = true;
		};
		const checkToDrop = (check) => {
			let map = new Map();
			let good = new Set();
			for (let i = 15; i >= 0; i--) {
				for (let j = 0; j < grid[0].length; j++) {
					if (grid[i]?.[j]?.[1] && i === 15) {
						good.add(grid[i][j][1]);
						continue;
					}
					if (grid[i][j] && grid[i][j][1] && !good.has(grid[i][j][1])) {
						if (!grid[i + 1][j] || grid[i + 1][j][1] === grid[i][j][1]) {
							if (map.get(grid[i][j][1])) map.get(grid[i][j][1]).push([i, j]);
							else map.set(grid[i][j][1], [[i, j]]);
						} else {
							if (map.get(grid[i][j][1])) {
								map.delete(grid[i][j][1]);
							} else good.add(grid[i][j][1]);
						}
					}
				}
			}
			map.forEach((value) => {
				value.forEach((coord) => {
					let temp = grid[coord[0]][coord[1]];
					grid[coord[0]][coord[1]] = null;
					while (coord[0] + 1 <= 15 && !grid[coord[0] + 1][coord[1]]) {
						coord[0]++;
					}
					grid[coord[0]][coord[1]] = temp;
				});
			});
			if (map.size > 0) {
				checkToDrop(false);
				if (check) checkToClear();
			}
		};
		const checkToClear = () => {
			let remove = [];
			for (let row = 0; row < grid.length; row++) {
				for (let col = 0; col < grid[0].length; col++) {
					if (grid[row][col]) {
						let y = row,
							x = col,
							temp = [];
						while (x < grid[0].length && grid[row][x]?.[0] === grid[row][col][0]) {
							temp.push([row, x]);
							x++;
						}
						if (temp.length >= 4) remove.push(...temp);
						temp = [];
						while (y < grid.length && grid[y][col]?.[0] === grid[row][col][0]) {
							temp.push([y, col]);
							y++;
						}
						if (temp.length >= 4) remove.push(...temp);
					}
				}
			}
			if (remove.length > 0) {
				clear(remove);
			}
			checkToDrop(true);
			return checkToWin();
		};
		const draw = () => {
			if (idle) return;
			board.strokeStyle = 'gray';
			board.clearRect(0, 0, 248, 496);
			board.lineWidth = 2;
			board.strokeRect(0, 0, 248, 496);
			board.lineWidth = 0.2;
			if (!piece) {
				if (pillCount % 10 === 0 && FALL_SPEED > 50) FALL_SPEED -= 16;
				pillCount++;
				checkToClear();
				if (idle) return;
				usedHold = false;
				piece = q.shift();
				if (held?.holding) das();
				updateGhost();
			}
			if (grid[0][3] || grid[0][4]) return gameOver(false);
			for (let i = 0; i < 5; i++) {
				if (!q[i]) q.push(createPill());
				let pill = q[i];
				queue.fillStyle = pill[0][2];
				queue.fillRect(24, 24 + 64 * i, 31, 31);
				queue.fillStyle = pill[1][2];
				queue.fillRect(24 + 31, 24 + 64 * i, 31, 31);
			}
			for (let row = 0; row < grid.length; row++) {
				for (let col = 0; col < grid[0].length; col++) {
					if (!grid[row][col]) {
						board.strokeRect(col * 31, row * 31, 31, 31);
					} else {
						board.fillStyle = grid[row][col][0];
						board.fillRect(col * 31, row * 31, 31, 31);
						if (grid[row][col][1] === 0) {
							board.fillStyle = 'rgba(255,255,255,0.5)';
							board.fillRect(col * 31, row * 31, 31, 31);
						}
					}
				}
			}
			board.fillStyle = ghost[0][2];
			board.fillRect(ghost[0][0] * 31, ghost[0][1] * 31, 31, 31);
			board.fillStyle = ghost[1][2];
			board.fillRect(ghost[1][0] * 31, ghost[1][1] * 31, 31, 31);

			board.fillStyle = 'rgba(0,0,0,0.5)';
			board.fillRect(ghost[0][0] * 31, ghost[0][1] * 31, 31, 31);
			board.fillRect(ghost[1][0] * 31, ghost[1][1] * 31, 31, 31);
			board.fillStyle = piece[0][2];
			board.fillRect(piece[0][0] * 31, piece[0][1] * 31, 31, 31);
			board.fillStyle = piece[1][2];
			board.fillRect(piece[1][0] * 31, piece[1][1] * 31, 31, 31);

			if (hold) {
				save.fillStyle = hold[0][2];
				save.fillRect(24, 24, 31, 31);
				save.fillStyle = hold[1][2];
				save.fillRect(24 + 31, 24, 31, 31);
			}
		};
		const das = () => {
			if (held) {
				if (held.direction === -1) {
					while (canMoveLeft(piece)) {
						piece.forEach((pill) => {
							pill[0]--;
						});
					}
				} else if (held.direction === 1) {
					while (canMoveRight(piece)) {
						piece.forEach((pill) => {
							pill[0]++;
						});
					}
				}
			}
		};
		const handleInput = ({ keyCode, repeat }) => {
			if (repeat) {
				if (!held && (keyCode === 81 || keyCode === 68)) {
					held = { timeout: null, direction: keyCode === 81 ? -1 : 1, holding: true, keyCode };
					das();
					updateGhost();
					draw();
				}
			}
			if (keyCode === 32) {
				grid[ghost[0][1]][ghost[0][0]] = [ghost[0][2], pieceNum];
				if (ghost[1][1] !== -1) grid[ghost[1][1]][ghost[1][0]] = [ghost[1][2], pieceNum];
				pieceNum++;
				piece = null;
				groundMoves = 0;
				clearTimeout(timeout);
				timeout = setTimeout(updatePiece, FALL_SPEED);
				draw();
			} else if (keyCode === 81) {
				if (canMoveLeft(piece)) {
					piece.forEach((pill) => {
						pill[0]--;
					});
					updateGhost();
					draw();
				}
				held = {
					timeout: setTimeout(() => {
						held.holding = true;
						das();
						updateGhost();
						draw();
					}, DAS),
					direction: -1,
					holding: false,
					keyCode
				};
			} else if (keyCode === 87) {
				piece[0][1] = ghost[0][1];
				piece[1][1] = ghost[1][1];
				clearTimeout(timeout);
				timeout = setTimeout(updatePiece, FALL_SPEED);
				draw();
			} else if (keyCode === 68) {
				if (canMoveRight(piece)) {
					piece.forEach((pill) => {
						pill[0]++;
					});
					updateGhost();
					draw();
				}
				held = {
					timeout: setTimeout(() => {
						held.holding = true;
						das();
						updateGhost();
						draw();
					}, DAS),
					direction: 1,
					holding: false,
					keyCode
				};
			} else if (keyCode === 74) {
				rotate(-1);
			} else if (keyCode === 75) {
				rotate(1);
			} else if (keyCode === 76) {
				holdPiece();
			} else if (keyCode === 186) {
				[piece[0][0], piece[1][0]] = [piece[1][0], piece[0][0]];
				[piece[0], piece[1]] = [piece[1], piece[0]];
				updateGhost();
				draw();
			} else if (keyCode === 51) {
				startGame();
			}
		};
		const keyUpListener = ({ keyCode }) => {
			if (held && keyCode === held.keyCode) {
				clearTimeout(held.timeout);
				held = null;
			}
		};

		const isValidVirus = (i, j, color) => {
			let x = i - 1;
			let count = 0;
			while (x >= 0) {
				if (grid[x][j]?.[0] === color) count++;
				else break;
				x--;
			}
			if (count >= 2) return false;
			count = 0;
			while (j - 1 >= 0) {
				if (grid[i][j - 1]?.[0] === color) count++;
				else break;
				j--;
			}
			return count < 2;
		};
		const initVirus = () => {
			let skips = new Set();
			for (let i = 0; i < SKIPS; i++) {
				let random = Math.floor(Math.random() * 104);
				while (skips.has(random)) {
					random = Math.floor(Math.random() * 104);
				}
				skips.add(random);
			}
			for (let i = 3; i < grid.length; i++) {
				for (let j = 0; j < grid[0].length; j++) {
					if (skips.has((i - 3) * grid[0].length + j)) continue;
					let color = colors[Math.floor(Math.random() * 3)];
					while (!isValidVirus(i, j, color)) {
						color = colors[Math.floor(Math.random() * 3)];
					}
					grid[i][j] = [color, 0];
				}
			}
		};
		startGame();
		document.addEventListener('keydown', ({ keyCode }) => {
			if (keyCode === 51) startGame();
		});
	});
</script>

<div class="container mt-5">
	<canvas id="save" width="128" height="496" />
	<canvas id="board" width="248" height="496" />
	<canvas id="queue" height="496" width="128" />
</div>
