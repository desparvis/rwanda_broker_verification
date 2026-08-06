# RWAREB: Decentralized Real Estate Broker Registry

**Author:** Credo Desparvis Gutabarwa  
**Project Type:** Summative Project

---

## Overview

The **RWAREB Registry** is a decentralized application (DApp) designed to securely manage and verify real estate broker licenses in Rwanda using blockchain technology.

Built on the **Ethereum blockchain**, the platform provides an immutable, transparent, and publicly verifiable registry of licensed real estate brokers. It enables anyone to instantly verify whether a broker is currently licensed or has had their license revoked, reducing fraud and improving trust in Rwanda's real estate sector.

The application combines a **Python Flask** administrative backend with an **Ethers.js** frontend that interacts directly with a **Solidity smart contract** deployed on the **Ethereum Sepolia Testnet**.

---

# System Architecture

```
                 +-------------------------+
                 |      Web Browser        |
                 |  HTML / CSS / JS UI     |
                 +------------+------------+
                              |
                              |
                       Ethers.js v6
                              |
                              |
                     MetaMask Wallet
                              |
                              |
                     Ethereum Blockchain
                     (Sepolia Testnet)
                              |
                     Solidity Smart Contract
                              |
                              |
                Flask Admin Dashboard (Python)
```

---

# Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contracts | Solidity (^0.8.26) |
| Development Framework | Hardhat |
| Blockchain | Ethereum Sepolia Testnet |
| Frontend | HTML, CSS, JavaScript |
| Blockchain Library | Ethers.js v6.11.1 |
| Backend | Python Flask |
| Wallet | MetaMask |
| RPC Provider | Alchemy API |

---

# Project Structure

```
rwanda_broker_verification/
│
├── contracts/             # Solidity smart contracts
├── scripts/               # Deployment scripts
├── test/                  # Hardhat test suite
├── static/
│   ├── css/
│   └── js/
│       └── app.js
├── templates/             # Flask HTML templates
├── app.py                 # Flask application
├── hardhat.config.js
├── package.json
├── requirements.txt
├── .env
└── README.md
```

---

# Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**
- **Python 3.x**
- **MetaMask** browser extension
- **SepoliaETH** (for gas fees)
- **Alchemy** account with a Sepolia API key

---

# Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd rwanda_broker_verification
```

---

## 2. Install Smart Contract Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

---

## 3. Install Backend Dependencies

```bash
pip install flask
```

---

# Environment Variables

Create a `.env` file in the project root.

> **Important:** Your MetaMask private key **must begin with `0x`**.

```env
FLASK_SECRET_KEY=your_secure_flask_key
ADMIN_PASSWORD=admin

ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

PRIVATE_KEY=0xYOUR_64_CHARACTER_METAMASK_PRIVATE_KEY
```

---

# Deploying the Smart Contract

## Deploy to Sepolia

Run the deployment script:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

After deployment, Hardhat will output something similar to:

```text
Success: AgentRegistry deployed to:
0x1234567890ABCDEF1234567890ABCDEF12345678
```

Copy the deployed contract address.

---

# Configure the Frontend

Open:

```
static/js/app.js
```

### Update the Contract Address

Replace:

```javascript
const REGISTRY_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS_HERE";
```

with your deployed contract address.

---

### Update the Read Provider

Use a public RPC endpoint for read-only verification:

```javascript
const readProvider = new ethers.JsonRpcProvider(
    "https://sepolia.drpc.org"
);
```

---

# Running the Application

Start the Flask server:

```bash
python app.py
```

Open your browser and navigate to:

```
http://127.0.0.1:5000
```

---

## Before Using the Dashboard

Make sure that:

- MetaMask is unlocked.
- MetaMask is connected to the **Sepolia Testnet**.
- Your administrator wallet is selected.
- Click **Connect Provider** to authorize the application.

---

# Testing

The project includes a comprehensive Hardhat test suite covering:

- Administrator permissions
- Broker registration
- License renewal
- License revocation
- License expiration logic
- Access control

Run all tests with:

```bash
npx hardhat test
```

---

# Smart Contract Capabilities

The deployed smart contract provides the following functionality:

- Register licensed brokers
- Revoke licenses
- Verify broker status
- Restrict administrative actions using role-based access control

---

# Blockchain Network

| Property | Value |
|----------|-------|
| Network | Ethereum |
| Testnet | Sepolia |
| Wallet | MetaMask |
| RPC Provider | Alchemy |

---

# Development Workflow

1. Clone the repository.
2. Install dependencies.
3. Configure the `.env` file.
4. Deploy the smart contract.
5. Update the contract address in `app.js`.
6. Start the Flask server.
7. Connect MetaMask.
8. Begin registering and verifying brokers.

---

# Author

**Credo Desparvis Gutabarwa**

---

## Acknowledgements

This project leverages the following technologies and open-source tools:

- Ethereum
- Solidity
- Hardhat
- Ethers.js
- Python Flask
- MetaMask
- Alchemy
- OpenZeppelin Contracts