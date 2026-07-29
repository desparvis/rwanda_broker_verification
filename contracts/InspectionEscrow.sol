// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Minimal interface to call the registry
interface IAgentRegistry {
    function isAgentValid(address _agent) external view returns (bool);
}

contract InspectionEscrow {
    IAgentRegistry public registry;
    uint256 public nextBookingId = 1;

    enum EscrowState { AwaitingInspection, Completed, Refunded }

    struct Booking {
        address buyer;
        address broker;
        uint256 amount;
        uint256 deadline;
        EscrowState state;
    }

    mapping(uint256 => Booking) public bookings;

    event InspectionBooked(uint256 indexed bookingId, address indexed buyer, address indexed broker, uint256 amount);
    event InspectionConfirmed(uint256 indexed bookingId, address indexed broker, uint256 amount);
    event RefundClaimed(uint256 indexed bookingId, address indexed buyer, uint256 amount);

    error InvalidBroker();
    error InvalidAmount();
    error NotBuyer();
    error InvalidState();
    error TimeLockActive();
    error TransferFailed();

    constructor(address _registryAddress) {
        registry = IAgentRegistry(_registryAddress);
    }

    /// @notice Buyer locks the viewing fee into the escrow
    function bookInspection(address _broker) public payable returns (uint256) {
        if (!registry.isAgentValid(_broker)) revert InvalidBroker();
        if (msg.value == 0) revert InvalidAmount();

        uint256 bookingId = nextBookingId++;
        
        bookings[bookingId] = Booking({
            buyer: msg.sender,
            broker: _broker,
            amount: msg.value,
            deadline: block.timestamp + 24 hours, // 24-hour time lock
            state: EscrowState.AwaitingInspection
        });

        emit InspectionBooked(bookingId, msg.sender, _broker, msg.value);
        return bookingId;
    }

    /// @notice Buyer confirms the inspection was good, releasing funds to the broker
    function confirmInspection(uint256 _bookingId) public {
        Booking storage booking = bookings[_bookingId];
        
        if (msg.sender != booking.buyer) revert NotBuyer();
        if (booking.state != EscrowState.AwaitingInspection) revert InvalidState();

        // CEI Pattern: State changes before external interactions
        booking.state = EscrowState.Completed;
        uint256 amountToRelease = booking.amount;

        (bool success, ) = payable(booking.broker).call{value: amountToRelease}("");
        if (!success) revert TransferFailed();

        emit InspectionConfirmed(_bookingId, booking.broker, amountToRelease);
    }

    /// @notice If 24 hours pass and the broker flakes, the buyer reclaims their funds
    function claimRefund(uint256 _bookingId) public {
        Booking storage booking = bookings[_bookingId];

        if (msg.sender != booking.buyer) revert NotBuyer();
        if (booking.state != EscrowState.AwaitingInspection) revert InvalidState();
        if (block.timestamp <= booking.deadline) revert TimeLockActive();

        // CEI Pattern: State changes before external interactions
        booking.state = EscrowState.Refunded;
        uint256 amountToRefund = booking.amount;

        (bool success, ) = payable(booking.buyer).call{value: amountToRefund}("");
        if (!success) revert TransferFailed();

        emit RefundClaimed(_bookingId, booking.buyer, amountToRefund);
    }
}