// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract AgentRegistry {
    address public admin;

    struct Broker {
        string nidaHash;
        string licenseNumber;
        string fullName;
        string agency;
        uint256 expirationTime;
        bool isRegistered;
    }

    mapping(address => Broker) public brokers;

    event BrokerRegistered(address indexed wallet, string licenseNumber, uint256 expirationTime);
    event BrokerRenewed(address indexed wallet, uint256 newExpirationTime);

    error OnlyAdmin();
    error BrokerAlreadyRegistered();
    error BrokerNotRegistered();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    constructor() {
        admin = msg.sender; // The deployer is the initial RWAREB admin
    }

    /// @notice Registers a new broker with their official details
    function registerBroker(
        address _wallet,
        string calldata _nidaHash,
        string calldata _licenseNumber,
        string calldata _fullName,
        string calldata _agency,
        uint256 _validityDays
    ) external onlyAdmin {
        if (brokers[_wallet].isRegistered) revert BrokerAlreadyRegistered();

        uint256 expireTime = block.timestamp + (_validityDays * 1 days);

        brokers[_wallet] = Broker({
            nidaHash: _nidaHash,
            licenseNumber: _licenseNumber,
            fullName: _fullName,
            agency: _agency,
            expirationTime: expireTime,
            isRegistered: true
        });

        emit BrokerRegistered(_wallet, _licenseNumber, expireTime);
    }

    /// @notice Renews an existing broker's license
    function renewBroker(address _wallet, uint256 _additionalDays) external onlyAdmin {
        if (!brokers[_wallet].isRegistered) revert BrokerNotRegistered();
        
        // If already expired, start from now. If active, add to current expiration.
        if (block.timestamp > brokers[_wallet].expirationTime) {
            brokers[_wallet].expirationTime = block.timestamp + (_additionalDays * 1 days);
        } else {
            brokers[_wallet].expirationTime += (_additionalDays * 1 days);
        }

        emit BrokerRenewed(_wallet, brokers[_wallet].expirationTime);
    }

    /// @notice Public function used by the frontend and Escrow contract to verify status
    function isAgentValid(address _agent) public view returns (bool) {
        Broker memory broker = brokers[_agent];
        return (broker.isRegistered && block.timestamp <= broker.expirationTime);
    }
}