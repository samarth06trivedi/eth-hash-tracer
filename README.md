# HASH TRACER

HASH TRACER is a comprehensive Ethereum blockchain explorer and portfolio tracker that allows users to visualize transactions, track NFT holdings, and monitor their portfolio across multiple blockchains.

## Features

- **Ethereum Transaction Explorer**: Visualize transactions as an interactive graph
- **EVM Facts**: Get detailed reports about any Ethereum address
- **NFT Holdings**: View all NFTs owned by an address and track their total value
- **Portfolio Tracker**: Track your crypto portfolio across multiple blockchains with visualization

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/hash-tracer.git
cd hash-tracer
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Keys

This project uses several APIs that require keys:

- Dune Analytics API for transaction data
- CoinStats API for portfolio and NFT data

You may need to replace the API keys in the code with your own if they expire.

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- D3.js for data visualization
- Tailwind CSS for styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.
