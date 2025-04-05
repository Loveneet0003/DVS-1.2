# College Election System

A decentralized voting platform for college elections, built with React and Ethereum blockchain.

## Features

- College email verification (@college.edu)
- Secure voting through blockchain
- Real-time vote tracking
- Transparent and immutable vote records

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension
- A local Ethereum network (like Ganache) or access to an Ethereum testnet

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd college-election-system
```

2. Install dependencies:
```bash
npm install
```

3. Deploy the smart contract:
   - Open `contracts/Election.sol` in Remix IDE or your preferred Solidity development environment
   - Deploy the contract to your chosen network
   - Copy the deployed contract address and ABI
   - Update the `CONTRACT_ADDRESS` and `CONTRACT_ABI` in the following files:
     - src/components/Vote.js
     - src/components/LiveResults.js

4. Start the development server:
```bash
npm start
```

## Usage

1. Register with your college email (@college.edu)
2. Connect your MetaMask wallet
3. Cast your vote for your preferred candidate
4. View live results in real-time

## Project Structure

```
college-election-system/
├── contracts/
│   └── Election.sol
├── src/
│   ├── components/
│   │   ├── Home.js
│   │   ├── Navbar.js
│   │   ├── Register.js
│   │   ├── Vote.js
│   │   └── LiveResults.js
│   └── App.js
├── package.json
└── README.md
```

## Smart Contract

The Election smart contract (`Election.sol`) handles:
- Candidate management
- Vote casting
- Vote counting
- Prevention of double voting

## Security Considerations

- The system verifies college email addresses
- Each wallet address can only vote once
- All votes are recorded on the blockchain
- Vote counts are publicly visible and cannot be tampered with

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 