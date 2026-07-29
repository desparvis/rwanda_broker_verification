// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentRegistry {
    address public rwarebAdmin;

    enum LicenseStatus { Active, Suspended, Expired }

    struct Agent {
        string rwarebLicenseNo;
        string fullName;
        string agencyName;
        bytes32 nidaHash;
        LicenseStatus status;
        uint256 validUntil;
    }

    mapping(address => Agent) public agents;
    mapping(string => address) public licenseToAddress;

    event AgentRegistered(address indexed agentWallet, string licenseNo, string fullName);
    event StatusUpdated(address indexed agentWallet, LicenseStatus newStatus);

    modifier onlyAdmin() {
        require(msg.sender == rwarebAdmin, "Caller is not RWAREB admin");
        _;
    }

    constructor() {
        rwarebAdmin = msg.sender;
    }

    function registerAgent(
        address _agentWallet,
        string memory _licenseNo,
        string memory _fullName,
        string memory _agencyName,
        bytes32 _nidaHash,
        uint256 _durationDays
    ) external onlyAdmin {
        require(_agentWallet != address(0), "Invalid wallet address");
        
        agents[_agentWallet] = Agent({
            rwarebLicenseNo: _licenseNo,
            fullName: _fullName,
            agencyName: _agencyName,
            nidaHash: _nidaHash,
            status: LicenseStatus.Active,
            validUntil: block.timestamp + (_durationDays * 1 days)
        });

        licenseToAddress[_licenseNo] = _agentWallet;
        emit AgentRegistered(_agentWallet, _licenseNo, _fullName);
    }

    function isAgentValid(address _agentWallet) external view returns (bool) {
        Agent memory a = agents[_agentWallet];
        return (a.status == LicenseStatus.Active && a.validUntil > block.timestamp);
    }
}