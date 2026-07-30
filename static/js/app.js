const REGISTRY_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace with your deployed contract address

const REGISTRY_ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [], "name": "BrokerAlreadyRegistered", "type": "error" },
    { "inputs": [], "name": "BrokerNotRegistered", "type": "error" },
    { "inputs": [], "name": "OnlyAdmin", "type": "error" },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
        { "indexed": false, "internalType": "string", "name": "licenseNumber", "type": "string" },
        { "indexed": false, "internalType": "uint256", "name": "expirationTime", "type": "uint256" }
      ],
      "name": "BrokerRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "newExpirationTime", "type": "uint256" }
      ],
      "name": "BrokerRenewed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" }
      ],
      "name": "BrokerRevoked",
      "type": "event"
    },
    { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "brokers",
      "outputs": [
        { "internalType": "string", "name": "nidaHash", "type": "string" },
        { "internalType": "string", "name": "licenseNumber", "type": "string" },
        { "internalType": "string", "name": "fullName", "type": "string" },
        { "internalType": "string", "name": "agency", "type": "string" },
        { "internalType": "uint256", "name": "expirationTime", "type": "uint256" },
        { "internalType": "bool", "name": "isRegistered", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "_agent", "type": "address" }],
      "name": "isAgentValid",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "_wallet", "type": "address" },
        { "internalType": "string", "name": "_nidaHash", "type": "string" },
        { "internalType": "string", "name": "_licenseNumber", "type": "string" },
        { "internalType": "string", "name": "_fullName", "type": "string" },
        { "internalType": "string", "name": "_agency", "type": "string" },
        { "internalType": "uint256", "name": "_validityDays", "type": "uint256" }
      ],
      "name": "registerBroker",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "_wallet", "type": "address" },
        { "internalType": "uint256", "name": "_additionalDays", "type": "uint256" }
      ],
      "name": "renewBroker",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" }],
      "name": "revokeBroker",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalBrokers",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    // NEW ABI ENTRY FOR THE LEDGER
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "brokerAddresses",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    }
];

let provider;
let signer;

// ==========================================
// CUSTOM MODAL LOGIC 
// ==========================================
function showModal(title, message) {
  const modal = document.getElementById('customModal');
  if (modal) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    modal.style.display = 'flex';
  }
}

const modalCloseBtn = document.getElementById('modalCloseBtn');
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    document.getElementById('customModal').style.display = 'none';
  });
}

// ==========================================
// ADMIN PORTAL
// ==========================================
const connectWalletBtn = document.getElementById("connectWalletBtn");
if (connectWalletBtn) {
  connectWalletBtn.addEventListener("click", async () => {
    if (window.ethereum) {
      try {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        
        const address = await signer.getAddress();
        document.getElementById("adminAccount").innerText = `${address.substring(0, 6)}...${address.substring(38)}`;
        connectWalletBtn.innerText = "Provider Connected";

        const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
        
        // 1. Update Total Count
        const total = await registryContract.getTotalBrokers();
        const countSpan = document.getElementById("totalBrokersCount");
        if (countSpan) countSpan.innerText = total.toString();

        // 2. Populate the Ledger Table
        const tableBody = document.getElementById("brokerTableBody");
        if (tableBody && total > 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Fetching ${total} records from blockchain...</td></tr>`;
            let rowsHtml = "";
            
            for (let i = 0; i < total; i++) {
                const brokerAddr = await registryContract.brokerAddresses(i);
                const data = await registryContract.brokers(brokerAddr);
                
                const statusBadge = data.isRegistered 
                    ? `<span style="background:#E6F4EA; color:#137333; padding:4px 8px; border-radius:4px; font-weight:600;">Active</span>`
                    : `<span style="background:#FCE8E6; color:#C5221F; padding:4px 8px; border-radius:4px; font-weight:600;">Revoked</span>`;
                
                const actionBtn = data.isRegistered
                    ? `<button class="btn btn-secondary fill-revoke-btn" data-address="${brokerAddr}" style="padding:6px 10px; font-size:11px; color:#FF3B30;">Auto-Fill Revoke</button>`
                    : `<span style="color:var(--text-muted); font-size: 12px;">Revoked</span>`;

                rowsHtml += `
                    <tr>
                        <td><strong>${data.fullName}</strong><br><span style="color:var(--text-muted); font-family:monospace; font-size:11px;">${brokerAddr}</span></td>
                        <td><span style="font-family: monospace; background: #E5E5EA; padding: 2px 6px; border-radius: 4px;">${data.licenseNumber}</span></td>
                        <td>${data.agency}</td>
                        <td>${statusBadge}</td>
                        <td style="text-align: right;">${actionBtn}</td>
                    </tr>
                `;
            }
            tableBody.innerHTML = rowsHtml;

            // Attach listeners to the new "Auto-Fill Revoke" buttons
            document.querySelectorAll(".fill-revoke-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const targetAddr = e.target.getAttribute("data-address");
                    const revokeInput = document.getElementById("revokeAddress");
                    revokeInput.value = targetAddr;
                    revokeInput.focus();
                    revokeInput.style.border = "2px solid #FF3B30"; 
                });
            });
        } else if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No brokers registered yet.</td></tr>`;
        }

      } catch (error) {
        console.error("Connection failed:", error);
        showModal("Connection Error", "Failed to connect to the Ethereum provider.");
      }
    } else {
      showModal("Missing Requirement", "MetaMask is not installed or detected in this browser.");
    }
  });
}

// REGISTER BROKER
const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    if (!signer) return showModal("Authentication Required", "You must connect the Admin provider first.");

    const wallet = document.getElementById("regAddress").value.trim();
    const nida = document.getElementById("regNida").value.trim();
    const license = document.getElementById("regLicense").value.trim();
    const name = document.getElementById("regName").value.trim();
    const agency = document.getElementById("regAgency").value.trim();
    const days = parseInt(document.getElementById("regDays").value);

    if (!ethers.isAddress(wallet)) return showModal("Validation Error", "The provided Ethereum address format is invalid.");
    if (!nida || !license || !name || !agency || isNaN(days)) return showModal("Validation Error", "All fields require valid data inputs.");

    try {
      const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      
      showModal("Action Required", "Please confirm the transaction signature in your Web3 wallet.");
      const tx = await registryContract.registerBroker(wallet, nida, license, name, agency, days);
      
      showModal("Transaction Processing", `Hash: ${tx.hash}\n\nAwaiting network confirmation...`);
      await tx.wait(); 
      
      showModal("Transaction Complete", `License ${license} for ${name} has been successfully written to the blockchain registry.`);
      document.querySelectorAll("input").forEach(input => input.value = "");

      // Update the counter safely
      const total = await registryContract.getTotalBrokers();
      const countSpan = document.getElementById("totalBrokersCount");
      if (countSpan) {
        countSpan.innerText = total.toString();
      }

      // Automatically refresh the ledger table after a successful registration
      if (connectWalletBtn) connectWalletBtn.click();

    } catch (error) {
      console.error("Transaction failed:", error);
      showModal("Transaction Failed", "The registration could not be completed. Ensure you are using the authorized Admin wallet and the address isn't already registered.");
    }
  });
}

// REVOKE BROKER
const revokeBtn = document.getElementById("revokeBtn");
if (revokeBtn) {
  revokeBtn.addEventListener("click", async () => {
    if (!signer) return showModal("Authentication Required", "Connect the Admin provider first.");

    const wallet = document.getElementById("revokeAddress").value.trim();
    if (!ethers.isAddress(wallet)) return showModal("Validation Error", "Invalid Ethereum address.");

    try {
      const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
      
      showModal("Action Required", "Confirm the REVOCATION transaction in MetaMask.");
      const tx = await registryContract.revokeBroker(wallet);
      
      showModal("Processing", "Revoking license on the blockchain...");
      await tx.wait();
      
      showModal("Success", `Broker at ${wallet} has been permanently revoked.`);
      
      // Clear the input field and remove the red highlight
      const revokeInput = document.getElementById("revokeAddress");
      revokeInput.value = "";
      revokeInput.style.border = "1px solid var(--border-color)";

      // Automatically refresh the ledger table after a successful revocation
      if (connectWalletBtn) connectWalletBtn.click();
      
    } catch (error) {
      console.error(error);
      showModal("Transaction Failed", "Could not revoke. Are they already revoked, or are you using the wrong Admin wallet?");
    }
  });
}

// ==========================================
// USER PORTAL
// ==========================================
const verifyBtn = document.getElementById("verifyBtn");
if (verifyBtn) {
  verifyBtn.addEventListener("click", async () => {
    const agentAddr = document.getElementById("agentAddressInput").value.trim();
    
    if (!ethers.isAddress(agentAddr)) return showModal("Validation Error", "The provided Ethereum address format is invalid.");

    const resultBox = document.getElementById("verifyResult");
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = "<span style='font-size: 13px; color: var(--text-muted);'>Querying decentralized network...</span>";
    resultBox.style.borderLeft = "1px solid var(--border-color)";

    try {
      const readProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/alch_AjQMul9KAW7cp6UpWFKOY");
      const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, readProvider);
      
      const isValid = await registryContract.isAgentValid(agentAddr);

      if (isValid) {
        const brokerData = await registryContract.brokers(agentAddr);
        
        resultBox.innerHTML = `
          <div style="margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #15803d;">
            Status: Valid & Authorized
          </div>
          <div style="font-size: 13px; line-height: 1.8; color: var(--text-main);">
            <strong>Legal Name:</strong> ${brokerData.fullName} <br>
            <strong>Agency:</strong> ${brokerData.agency} <br>
            <strong>License ID:</strong> <span style="font-family: monospace; background: #E5E5EA; padding: 2px 6px; border-radius: 4px;">${brokerData.licenseNumber}</span>
          </div>
        `;
        resultBox.style.borderLeft = "4px solid #34C759";
      } else {
        resultBox.innerHTML = `
          <div style="font-size: 14px; font-weight: 600; color: #b91c1c;">
            Status: Invalid, Revoked, or Expired
          </div>
          <div style="font-size: 13px; margin-top: 4px; color: var(--text-muted);">
            No active authorization found for this address.
          </div>
        `;
        resultBox.style.borderLeft = "4px solid #FF3B30";
      }
    } catch (error) {
      console.error("RPC Error:", error);
      showModal("Network Error", "Unable to connect to the blockchain RPC provider. Please ensure the local node is running on port 8545.");
      resultBox.classList.add("hidden");
    }
  });
}