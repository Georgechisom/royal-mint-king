/// RoyalMintKingpin - Chess Game Tracking with NFT Rewards on Sui

module royal_mint_kingpin::royal_mint_kingpin {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};

    // ====== Error Codes ======
    const EGameAlreadySubmitted: u64 = 1;
    const EInvalidWinner: u64 = 2;
    const EInvalidPlayer: u64 = 3;

    // ====== Structs ======

    /// GameVictoryNFT - NFT minted to game winners
    /// Represents a victory in chess, stored as an owned object
    public struct GameVictoryNFT has key, store {
        id: UID,
        game_id: String,
        winner: address,
        opponent: address,  // address(0) for AI games
        timestamp: u64,
        is_ai_game: bool,
    }

    /// PlayerStats - Shared object tracking player statistics
    /// Accessible by all to query player performance
    public struct PlayerStats has key {
        id: UID,
        stats: Table<address, Stats>,
    }

    /// Individual player statistics
    public struct Stats has store, copy, drop {
        wins: u64,
        losses: u64,
        draws: u64,
        games_played: u64,
    }

    /// GameRegistry - Shared object tracking all games
    /// Prevents duplicate game submissions
    public struct GameRegistry has key {
        id: UID,
        games: Table<String, GameRecord>,
    }

    /// Game record structure
    public struct GameRecord has store, copy, drop {
        player1: address,
        player2: address, // address(0) for AI
        winner: address,  // address(0) for draws
        timestamp: u64,
        is_ai_game: bool,
        is_draw: bool,
    }

    // ====== Events ======

    /// Emitted when a game is submitted
    public struct GameSubmitted has copy, drop {
        game_id: String,
        player1: address,
        player2: address,
        winner: address,
        is_ai_game: bool,
        is_draw: bool,
        timestamp: u64,
    }

    /// Emitted when an NFT is minted
    public struct NFTMinted has copy, drop {
        nft_id: address,
        winner: address,
        game_id: String,
    }

    // ====== Initialization ======

    /// Initialize shared objects on module publication
    fun init(ctx: &mut TxContext) {
        // Create and share PlayerStats
        let player_stats = PlayerStats {
            id: object::new(ctx),
            stats: table::new(ctx),
        };
        transfer::share_object(player_stats);

        // Create and share GameRegistry
        let game_registry = GameRegistry {
            id: object::new(ctx),
            games: table::new(ctx),
        };
        transfer::share_object(game_registry);
    }

    // ====== Public Entry Functions ======

    /// Submit a two-player game result
    /// Both players sign transaction to confirm result
    public fun submit_two_player_game(
        registry: &mut GameRegistry,
        stats: &mut PlayerStats,
        game_id: vector<u8>,
        player1: address,
        player2: address,
        winner: address,
        is_draw: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let game_id_str = string::utf8(game_id);
        
        // Validate game hasn't been submitted
        assert!(!table::contains(&registry.games, game_id_str), EGameAlreadySubmitted);
        
        // Validate players
        assert!(player1 != @0x0 && player2 != @0x0, EInvalidPlayer);
        
        // Validate winner
        if (is_draw) {
            assert!(winner == @0x0, EInvalidWinner);
        } else {
            assert!(winner == player1 || winner == player2, EInvalidWinner);
        };

        let timestamp = clock::timestamp_ms(clock);

        // Record game
        let game_record = GameRecord {
            player1,
            player2,
            winner,
            timestamp,
            is_ai_game: false,
            is_draw,
        };
        table::add(&mut registry.games, game_id_str, game_record);

        // Update stats and mint NFT
        update_stats_and_mint(stats, player1, player2, winner, is_draw, false, game_id_str, timestamp, ctx);

        // Emit event
        event::emit(GameSubmitted {
            game_id: game_id_str,
            player1,
            player2,
            winner,
            is_ai_game: false,
            is_draw,
            timestamp,
        });
    }

    /// Submit an AI game result
    public fun submit_ai_game(
        registry: &mut GameRegistry,
        stats: &mut PlayerStats,
        game_id: vector<u8>,
        human_player: address,
        human_won: bool,
        is_draw: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let game_id_str = string::utf8(game_id);
        
        // Validate game hasn't been submitted
        assert!(!table::contains(&registry.games, game_id_str), EGameAlreadySubmitted);
        assert!(human_player != @0x0, EInvalidPlayer);

        let winner = if (is_draw) {
            @0x0
        } else if (human_won) {
            human_player
        } else {
            @0x0 // AI wins represented as empty address
        };

        let timestamp = clock::timestamp_ms(clock);

        // Record game
        let game_record = GameRecord {
            player1: human_player,
            player2: @0x0, // AI
            winner,
            timestamp,
            is_ai_game: true,
            is_draw,
        };
        table::add(&mut registry.games, game_id_str, game_record);

        // Update stats and mint NFT
        update_stats_and_mint(stats, human_player, @0x0, winner, is_draw, true, game_id_str, timestamp, ctx);

        // Emit event
        event::emit(GameSubmitted {
            game_id: game_id_str,
            player1: human_player,
            player2: @0x0,
            winner,
            is_ai_game: true,
            is_draw,
            timestamp,
        });
    }

    // ====== Helper Functions ======

    /// Update player statistics and mint NFT if applicable
    fun update_stats_and_mint(
        stats: &mut PlayerStats,
        player1: address,
        player2: address,
        winner: address,
        is_draw: bool,
        is_ai_game: bool,
        game_id: String,
        timestamp: u64,
        ctx: &mut TxContext
    ) {
        if (is_draw) {
            // Update draws for both players
            increment_draws(stats, player1, ctx);
            if (player2 != @0x0) {
                increment_draws(stats, player2, ctx);
            };
        } else {
            // Update wins/losses
            if (winner != @0x0) {
                increment_wins(stats, winner, ctx);
                
                // Mint NFT to winner
                let nft = GameVictoryNFT {
                    id: object::new(ctx),
                    game_id,
                    winner,
                    opponent: if (winner == player1) { player2 } else { player1 },
                    timestamp,
                    is_ai_game,
                };
                
                let nft_addr = object::uid_to_address(&nft.id);
                event::emit(NFTMinted {
                    nft_id: nft_addr,
                    winner,
                    game_id,
                });
                
                transfer::transfer(nft, winner);
            };

            // Update losses for loser
            let loser = if (winner == player1) { player2 } else { player1 };
            if (loser != @0x0) {
                increment_losses(stats, loser, ctx);
            };
        };
    }

    /// Increment wins for a player
    fun increment_wins(stats: &mut PlayerStats, player: address, _ctx: &mut TxContext) {
        if (!table::contains(&stats.stats, player)) {
            table::add(&mut stats.stats, player, Stats { wins: 0, losses: 0, draws: 0, games_played: 0 });
        };
        let player_stats = table::borrow_mut(&mut stats.stats, player);
        player_stats.wins = player_stats.wins + 1;
        player_stats.games_played = player_stats.games_played + 1;
    }

    /// Increment losses for a player
    fun increment_losses(stats: &mut PlayerStats, player: address, _ctx: &mut TxContext) {
        if (!table::contains(&stats.stats, player)) {
            table::add(&mut stats.stats, player, Stats { wins: 0, losses: 0, draws: 0, games_played: 0 });
        };
        let player_stats = table::borrow_mut(&mut stats.stats, player);
        player_stats.losses = player_stats.losses + 1;
        player_stats.games_played = player_stats.games_played + 1;
    }

    /// Increment draws for a player
    fun increment_draws(stats: &mut PlayerStats, player: address, _ctx: &mut TxContext) {
        if (!table::contains(&stats.stats, player)) {
            table::add(&mut stats.stats, player, Stats { wins: 0, losses: 0, draws: 0, games_played: 0 });
        };
        let player_stats = table::borrow_mut(&mut stats.stats, player);
        player_stats.draws = player_stats.draws + 1;
        player_stats.games_played = player_stats.games_played + 1;
    }

    // ====== View Functions ======

    /// Get player wins
    public fun get_wins(stats: &PlayerStats, player: address): u64 {
        if (table::contains(&stats.stats, player)) {
            table::borrow(&stats.stats, player).wins
        } else {
            0
        }
    }

    /// Get player losses
    public fun get_losses(stats: &PlayerStats, player: address): u64 {
        if (table::contains(&stats.stats, player)) {
            table::borrow(&stats.stats, player).losses
        } else {
            0
        }
    }

    /// Get player draws
    public fun get_draws(stats: &PlayerStats, player: address): u64 {
        if (table::contains(&stats.stats, player)) {
            table::borrow(&stats.stats, player).draws
        } else {
            0
        }
    }

    /// Get games played by player
    public fun get_games_played(stats: &PlayerStats, player: address): u64 {
        if (table::contains(&stats.stats, player)) {
            table::borrow(&stats.stats, player).games_played
        } else {
            0
        }
    }
}
