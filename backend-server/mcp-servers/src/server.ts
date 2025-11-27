import { Implementation } from '@modelcontextprotocol/sdk/types.js';
import { McpHonoServerDO } from '@nullshot/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Chess } from 'chess.js';
import { z } from 'zod';
import type { Env } from './env';

export class ChessAgentServer extends McpHonoServerDO<Env> {
	private moveCache: Map<string, string> = new Map();
	private readonly MAX_CACHE_SIZE = 1000;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	getImplementation(): Implementation {
		return {
			name: 'NullShotChessAI',
			version: '2.0.0',
		};
	}

	override async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname;

		console.log(`[DO] ${request.method} ${pathname}`);

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		if (pathname === '/api/health') {
			return new Response(
				JSON.stringify({
					status: 'ok',
					service: 'NullShot Chess MCP Server',
					version: '2.0.0',
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				}
			);
		}

		if (pathname === '/api/chess/move' && request.method === 'POST') {
			try {
				const body: any = await request.json();
				const { fen, side, difficulty = 'hard' } = body;

				if (!fen || !side) {
					return new Response(JSON.stringify({ error: 'Missing fen or side parameter' }), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					});
				}

				console.log(`[API] Move request - Side: ${side}, Difficulty: ${difficulty}`);

				// Use optimized move generation with timeout protection
				const move = await this.getOptimizedMove(fen, side, difficulty);
				const chess = new Chess(fen);
				chess.move(move);

				return new Response(
					JSON.stringify({
						move,
						fen: chess.fen(),
						newFen: chess.fen(),
						success: true,
					}),
					{
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					}
				);
			} catch (error: any) {
				console.error('[API] Error in /api/chess/move:', error);
				return new Response(
					JSON.stringify({
						error: error.message,
						success: false,
					}),
					{
						status: 500,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					}
				);
			}
		}

		if (pathname === '/api/chess/submit' && request.method === 'POST') {
			try {
				const body: any = await request.json();
				const { gameId, humanAddress, winner, signature } = body;

				if (!gameId || !humanAddress || !winner || !signature) {
					return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					});
				}

				const result = await this.submitGameToBlockchain(gameId, humanAddress, winner, signature);
				return new Response(JSON.stringify(result), {
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (error: any) {
				console.error('[API] Error in /api/chess/submit:', error);
				return new Response(JSON.stringify({ error: error.message, success: false }), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			}
		}

		return super.fetch(request);
	}

	configureServer(server: McpServer): void {
		this.setupChessTools(server);
		this.setupChessResources(server);
		this.setupChessPrompts(server);
		this.setupBlockchainTools(server);
	}

	processSSEConnection(request: Request): Response {
		const url = new URL(request.url);
		let sessionId = url.searchParams.get('sessionId');

		if (!sessionId) {
			sessionId = `auto-${Date.now()}-${Math.random().toString(36).substring(7)}`;
			console.log(`[SSE] Auto-generated sessionId: ${sessionId}`);
		}

		url.searchParams.set('sessionId', sessionId);
		const modifiedRequest = new Request(url.toString(), request);
		return super.processSSEConnection(modifiedRequest);
	}

	// ========== OPTIMIZED MOVE GENERATION ==========
	private async getOptimizedMove(fen: string, side: string, difficulty: string): Promise<string> {
		// Check cache first
		const cacheKey = `${fen}:${side}:${difficulty}`;
		if (this.moveCache.has(cacheKey)) {
			console.log('[CACHE] Move found in cache');
			return this.moveCache.get(cacheKey)!;
		}

		try {
			const chess = new Chess(fen);
			const legalMoves = chess.moves({ verbose: true });

			if (legalMoves.length === 0) {
				throw new Error('No legal moves available');
			}

			// For opening moves (first 3 moves), use fast book moves
			const moveNumber = Math.floor(chess.moveNumber());
			if (moveNumber <= 3) {
				const bookMove = this.getOpeningBookMove(fen, side);
				if (bookMove) {
					this.cacheMove(cacheKey, bookMove);
					return bookMove;
				}
			}

			// Try Claude API with timeout protection
			const apiEnv = this.env as Env;
			const apiKey = apiEnv.AI_PROVIDER_API_KEY ?? apiEnv.ANTHROPIC_API_KEY;

			if (apiKey && difficulty === 'hard') {
				try {
					const move = await this.getClaudeMoveWithTimeout(fen, side, legalMoves, apiKey, 8000); // 8s timeout
					if (move) {
						this.cacheMove(cacheKey, move);
						return move;
					}
				} catch (error: any) {
					console.warn('[Claude] Timeout or error, using fallback:', error.message);
				}
			}

			// Use optimized fallback
			const move = this.getSmartFallbackMove(fen, side, difficulty);
			this.cacheMove(cacheKey, move);
			return move;
		} catch (error: any) {
			console.error('[Move Generation] Error:', error);
			// Emergency fallback - random legal move
			const chess = new Chess(fen);
			const moves = chess.moves();
			return moves[Math.floor(Math.random() * moves.length)];
		}
	}

	// Opening book for instant moves
	private getOpeningBookMove(fen: string, side: string): string | null {
		const openingBook: { [key: string]: string[] } = {
			// Starting position - white
			'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e4', 'd4', 'Nf3', 'c4', 'g3'],
			// After e4
			'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['e5', 'c5', 'e6', 'c6'],
			// After d4
			'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['d5', 'Nf6', 'e6', 'g6'],
		};

		const moves = openingBook[fen];
		if (moves && moves.length > 0) {
			return moves[Math.floor(Math.random() * moves.length)];
		}
		return null;
	}

	// Claude with timeout protection
	private async getClaudeMoveWithTimeout(
		fen: string,
		side: string,
		legalMoves: any[],
		apiKey: string,
		timeoutMs: number
	): Promise<string | null> {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const chess = new Chess(fen);
			const turnNumber = Math.floor(chess.moveNumber());
			const phase = turnNumber < 10 ? 'opening' : turnNumber < 25 ? 'middlegame' : 'endgame';

			const response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': apiKey,
					'anthropic-version': '2023-06-01',
				},
				body: JSON.stringify({
					model: 'claude-sonnet-4-20250514',
					max_tokens: 300, // Reduced for faster response
					messages: [
						{
							role: 'user',
							content: `You are an elite chess engine (2800+ ELO). Analyze this position and return ONLY the best move in SAN notation.

Position: ${fen}
You play: ${side.toUpperCase()}
Phase: ${phase}
Legal moves: ${legalMoves.map((m) => m.san).join(', ')}

Requirements:
- ${phase === 'opening' ? 'Control center, develop pieces, castle early' : ''}
- ${phase === 'middlegame' ? 'Attack weaknesses, create threats, maintain king safety' : ''}
- ${phase === 'endgame' ? 'Activate king, push passed pawns, calculate precisely' : ''}
- Look for tactics: checks, captures, forks, pins
- NEVER expose your king to danger
- Choose unpredictable but strong moves

Respond with ONLY the move (e.g., "Nf3" or "e4"). No explanation.`,
						},
					],
				}),
				signal: controller.signal,
			});

			clearTimeout(timeout);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data: any = await response.json();
			const aiMove = data.content[0].text.trim().replace(/[^a-zA-Z0-9+#=-]/g, '');

			const validMove = legalMoves.find((m) => m.san === aiMove || m.lan === aiMove || m.from + m.to === aiMove);

			if (validMove) {
				console.log(`[Claude] Move: ${validMove.san}`);
				return validMove.san;
			}

			return null;
		} catch (error: any) {
			clearTimeout(timeout);
			if (error.name === 'AbortError') {
				console.warn('[Claude] Request timeout');
			}
			return null;
		}
	}

	// Optimized fallback with tactical focus
	private readonly PIECE_VALUES: { [key: string]: number } = {
		p: 100,
		n: 320,
		b: 330,
		r: 500,
		q: 900,
		k: 20000,
	};

	private getSmartFallbackMove(fen: string, side: string, difficulty: string): string {
		console.log(`[SMART-FALLBACK] Computing move for ${side} at ${difficulty}`);

		const chess = new Chess(fen);
		const moves = chess.moves({ verbose: true });

		if (moves.length === 0) {
			throw new Error('No legal moves');
		}

		// Instant responses for forced moves
		if (moves.length === 1) {
			return moves[0].san;
		}

		// Categorize moves by priority
		const checkmates = moves.filter((m) => {
			chess.move(m.san);
			const isCheckmate = chess.isCheckmate();
			chess.undo();
			return isCheckmate;
		});

		if (checkmates.length > 0) {
			return checkmates[0].san;
		}

		const checks = moves.filter((m) => m.san.includes('+'));
		const captures = moves.filter((m) => m.captured);
		const tactical = [...checks, ...captures];

		// Adjust search depth based on difficulty
		const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4; // Reduced from 5
		const movePool = difficulty === 'hard' && tactical.length > 0 ? [...tactical, ...moves.slice(0, 8)] : moves.slice(0, 12);

		let bestMove = moves[0].san;
		let bestValue = -Infinity;

		// Evaluate top candidates only
		for (const move of movePool) {
			chess.move(move.san);

			// Quick evaluation with limited depth
			const value = this.fastMinimax(chess, depth - 1, -Infinity, Infinity, false, side === 'white');

			chess.undo();

			// Add slight randomness for unpredictability
			const randomness =
				difficulty === 'hard'
					? (Math.random() - 0.5) * 20
					: difficulty === 'medium'
					? (Math.random() - 0.5) * 50
					: (Math.random() - 0.5) * 100;

			const adjustedValue = value + randomness;

			if (adjustedValue > bestValue) {
				bestValue = adjustedValue;
				bestMove = move.san;
			}
		}

		console.log(`[FALLBACK] Selected: ${bestMove} (Score: ${bestValue.toFixed(0)})`);
		return bestMove;
	}

	// Optimized minimax with aggressive pruning
	private fastMinimax(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean, isWhite: boolean): number {
		if (depth === 0 || chess.isGameOver()) {
			return this.fastEvaluate(chess, isWhite);
		}

		const moves = chess.moves();

		// Move ordering for better pruning
		const orderedMoves = this.orderMoves(chess, moves);

		if (maximizing) {
			let maxEval = -Infinity;
			for (const move of orderedMoves) {
				chess.move(move);
				const evaluation = this.fastMinimax(chess, depth - 1, alpha, beta, false, isWhite);
				chess.undo();

				maxEval = Math.max(maxEval, evaluation);
				alpha = Math.max(alpha, evaluation);
				if (beta <= alpha) break; // Prune
			}
			return maxEval;
		} else {
			let minEval = Infinity;
			for (const move of orderedMoves) {
				chess.move(move);
				const evaluation = this.fastMinimax(chess, depth - 1, alpha, beta, true, isWhite);
				chess.undo();

				minEval = Math.min(minEval, evaluation);
				beta = Math.min(beta, evaluation);
				if (beta <= alpha) break; // Prune
			}
			return minEval;
		}
	}

	// Order moves for better alpha-beta pruning
	private orderMoves(chess: Chess, moves: string[]): string[] {
		const scored: { move: string; score: number }[] = [];

		for (const move of moves) {
			let score = 0;

			// Prioritize captures
			if (move.includes('x')) score += 100;

			// Prioritize checks
			if (move.includes('+')) score += 80;

			// Prioritize center moves
			if (move.includes('e4') || move.includes('d4') || move.includes('e5') || move.includes('d5')) {
				score += 30;
			}

			scored.push({ move, score });
		}

		scored.sort((a, b) => b.score - a.score);
		return scored.map((s) => s.move);
	}

	// Fast position evaluation
	private fastEvaluate(chess: Chess, isWhite: boolean): number {
		if (chess.isCheckmate()) return chess.turn() === 'w' ? -20000 : 20000;
		if (chess.isDraw() || chess.isStalemate()) return 0;

		let score = 0;
		const board = chess.board();

		// Material count only (no position bonus for speed)
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				const piece = board[i][j];
				if (piece) {
					const value = this.PIECE_VALUES[piece.type] || 0;
					score += piece.color === 'w' ? value : -value;
				}
			}
		}

		// Simple mobility bonus
		const mobility = chess.moves().length;
		score += chess.turn() === 'w' ? mobility * 5 : -mobility * 5;

		return isWhite ? score : -score;
	}

	// Cache management
	private cacheMove(key: string, move: string): void {
		if (this.moveCache.size >= this.MAX_CACHE_SIZE) {
			const firstKey = this.moveCache.keys().next().value;
			if (firstKey !== undefined) {
				this.moveCache.delete(firstKey);
			}
		}
		this.moveCache.set(key, move);
	}

	// ========== MCP TOOLS ==========
	private setupChessTools(server: McpServer) {
		server.tool(
			'make_chess_move',
			'Generate chess move.',
			{
				fen: z.string(),
				side: z.enum(['white', 'black']),
				difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
			},
			async ({ fen, side, difficulty = 'hard' }) => {
				const chess = new Chess(fen);
				if (chess.turn() !== side[0]) {
					return { content: [{ type: 'text', text: 'Not your turn!' }] };
				}

				const moves = chess.moves();
				if (moves.length === 0) {
					return { content: [{ type: 'text', text: 'Game over!' }] };
				}

				const move = await this.getOptimizedMove(fen, side, difficulty);
				chess.move(move);

				return {
					content: [{ type: 'text', text: `Moved: ${move}. New FEN: ${chess.fen()}` }],
				};
			}
		);
	}

	private setupChessResources(server: McpServer) {
		server.resource('chess_game_state', 'resource://chess/game/{gameId}', async (uri: URL) => {
			const state = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
			return { contents: [{ text: state, uri: uri.href }] };
		});
	}

	private setupChessPrompts(server: McpServer) {
		server.prompt('chess_strategy', 'Ultimate chess strategy.', () => ({
			messages: [
				{
					role: 'user',
					content: { type: 'text', text: 'You are NullShot AI - unbeatable, unpredictable, unstoppable.' },
				},
			],
		}));
	}

	private setupBlockchainTools(server: McpServer) {
		server.tool(
			'submit_game_result',
			'Submit game to blockchain.',
			{
				gameId: z.string(),
				humanAddress: z.string(),
				winner: z.enum(['human', 'ai', 'draw']),
				signature: z.string(),
			},
			async ({ gameId, humanAddress, winner, signature }) => {
				const result = await this.submitGameToBlockchain(gameId, humanAddress, winner, signature);
				return { content: [{ type: 'text', text: result.message }] };
			}
		);
	}

	private async submitGameToBlockchain(
		gameId: string,
		humanAddress: string,
		winner: 'human' | 'ai' | 'draw',
		signature: string
	): Promise<{ success: boolean; message: string; txHash?: string }> {
		if (winner === 'human') {
			return { success: false, message: 'Human won; frontend submits.' };
		}

		try {
			const { ethers } = await import('ethers');
			const kv = (this.env as any).KV_NULLSHOTCHESS;
			if (!kv) return { success: false, message: 'KV not configured.' };

			const privateKey = await kv.get('AI_WALLET_KEY');
			if (!privateKey) return { success: false, message: 'Wallet key not found.' };

			const provider = new ethers.JsonRpcProvider('');
			const wallet = new ethers.Wallet(privateKey, provider);

			const contract = new ethers.Contract(
				'',
				[''],
				wallet
			);

			// const tx = await contract.submitAIGame(gameId, humanAddress, false, winner === 'draw', signature);
			await tx.wait();

			return {
				success: true,
				message: `✅ Victory recorded on blockchain!\nTx: ${tx.hash}`,
				txHash: tx.hash,
			};
		} catch (error: any) {
			return { success: false, message: `❌ Error: ${error.message}` };
		}
	}
}

export const ExampleMcpServer = ChessAgentServer;