# Royal Mint Kingpin Chess - Decentralized 3D Chess dApp

A stunning 3D chess dApp built on the **Royal Mint Kingpin** ecosystem, featuring immersive gameplay with React Three Fiber, blockchain verified results via Sui Devnet (OneChain), and NFT rewards for winners.

![Royal Mint Kingpin Chess](https://via.placeholder.com/1200x600/001F3F/50C878?text=Royal+Mint+Kingpin+Chess+dApp)

## 🎮 Features

- **Immersive 3D Chess**: Hyper realistic chess pieces rendered with Three.js and React Three Fiber
- **Dual Game Modes**:
  - VS Another Player (local multiplayer)
  - VS NullShot AI (powered by MCP agent)
- **10 Luxurious Themes**: From Classic Wood to Emerald Crown, with jewel-toned Zuma aesthetics
- **10 Board Designs**: Dark Walnut, Marble, Jade, Lapis, and more with realistic textures
- **Blockchain Verified**: Game results submitted on-chain with EIP-712 signatures
- **NFT Rewards**: Mint ERC721 badges for every victory
- **Live Leaderboard**: On-chain rankings fetched from smart contracts
- **RainbowKit Integration**: Seamless wallet connection (MetaMask, WalletConnect, etc.)
- **Thirdweb SDK**: Simplified blockchain interactions

## 🛠️ Tech Stack

### Frontend

- **React** + **TypeScript**: Type-safe component architecture
- **React Three Fiber**: 3D rendering with Three.js
- **@react-three/drei**: Helpers for 3D scenes (OrbitControls, Environment)
- **Framer Motion**: Smooth animations and transitions
- **TailwindCSS**: Utility-first styling with custom design system
- **Shadcn UI**: Pre-built accessible components

### Blockchain

- **Sui Devnet (OneChain)**: Development/testing network
- **@mysten/dapp-kit**: Wallet connection UI for Sui
- **@mysten/sui**: Sui client and utilities
- **OneChain SDK**: Contract interactions and NFT minting
- **Cryptographic signatures**: Secure game result verification

### Game Logic

- **chess.js**: Chess rules validation and move generation
- **WebSockets**: Real-time AI move communication with MCP agent

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ and npm
- OneWallet or compatible Sui wallet
- Sui Devnet SUI (get from [faucet](https://faucet.devnet.sui.io))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd royal-mint-kingpin

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the app.

## 📁 Project Structure

```
src/
├── components/
│   ├── chess/
│   │   ├── ChessBoard3D.tsx       # Main 3D chessboard with game logic
│   │   ├── ChessPiece.tsx         # Individual piece rendering
│   │   └── ChessBoardPreview.tsx  # Rotating preview for landing page
│   ├── game/
│   │   ├── GameModeSelector.tsx   # Mode selection (Human vs AI)
│   │   ├── ThemeSelector.tsx      # 10 theme options
│   │   └── BoardSelector.tsx      # 10 board design options
│   ├── layout/
│   │   ├── Header.tsx             # Navigation with wallet button
│   │   └── Footer.tsx             # Links and social media
│   └── ui/                        # Shadcn UI components
├── pages/
│   ├── Index.tsx                  # Landing page with hero section
│   ├── Arena.tsx                  # Game configuration and play
│   ├── About.tsx                  # Project info and tech stack
│   ├── HowToPlay.tsx              # Step-by-step guide
│   ├── Contact.tsx                # Contact form and links
│   ├── Leaderboard.tsx            # On-chain rankings
│   └── NotFound.tsx               # 404 page
├── index.css                      # Design system (colors, tokens)
├── App.tsx                        # Routes and providers
└── main.tsx                       # Entry point
```

## 🎨 Design System

The app uses a **Zuma-inspired** aesthetic with jewel tones and solid colors (NO gradients):

- **Primary**: Deep navy (`#001F3F`) - mature, elegant background
- **Accent**: Emerald (`#50C878`) - highlights and CTAs
- **Gold**: `#FFD700` - special elements and rank 1
- **Sapphire**: `#0F52BA` - secondary accents
- **Maroon**: `#500000` - key actions

All colors are defined as HSL in `src/index.css` and used via Tailwind tokens.

## 🔗 Blockchain Integration

### Smart Contract (royal_mint_kingpin.move)

Deployed on Sui Devnet:

- **Package ID**: `0x0e84bdd42c19f3cceb6f19b1495ff05536a0dbf06ecaea53fb18f55dd333ce66`
- Stores game results (wins/losses/games per address)
- Mints GameVictoryNFT tokens for winners
- Anti-replay protection for game submissions

### OneChain Setup

1. Connect to Sui Devnet in your OneWallet
2. The contract is already configured in `src/config/onechain.ts`
3. Use the provided hooks to interact with the contract:

   ```typescript
   import {
     useSubmitAIGame,
     useSubmitTwoPlayerGame,
   } from "@/hooks/useOnechainContract";

   const { mutateAsync: submitAIGame } = useSubmitAIGame();
   const { mutateAsync: submitTwoPlayerGame } = useSubmitTwoPlayerGame();
   ```

### Wallet Integration

@mysten/dapp-kit is pre-configured in `App.tsx`. The ConnectButton is available in `Header.tsx`:

```typescript
import { ConnectButton } from "@mysten/dapp-kit";

<ConnectButton />;
```

## 🤖 AI Integration (MCP Agent)

The NullShot AI agent runs separately (backend repo). Connect via WebSocket:

```typescript
// In ChessBoard3D.tsx after player move
if (gameMode === "ai") {
  const ws = new WebSocket("http://localhost:8787/ws");
  ws.send(JSON.stringify({ fen: game.fen() }));
  ws.onmessage = (event) => {
    const aiMove = JSON.parse(event.data);
    game.move(aiMove);
    setPosition(game.board());
  };
}
```

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Built for every one, but contributions welcome! Open an issue or PR.

## 📞 Contact

- **Email**: georgechipaul@gmail.com
- **GitHub**: [github.com](#)
- **Twitter**: [@chisom_georgee](#)

## 📊 Deployment Status

- **Frontend**: Deployed and running
- **Smart Contract**: Deployed on Sui Devnet at `0xc675b358926a57d7bce3c70018a8fd80fa6228612a6806b9a8c75847fedae252`
- **MCP Server**: Running for AI gameplay
- **Status**: 🟢 **LIVE AND FUNCTIONAL**

---

**Made ♔ for all Users** 🎮✨
