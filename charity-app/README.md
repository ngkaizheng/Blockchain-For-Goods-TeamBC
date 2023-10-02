# Charity Application README

Welcome to the Charity Application, a web-based platform for managing charitable events on the Algorand blockchain. This application provides a seamless experience for donors, organizers, and recipients to facilitate transparent and secure fundraising.

## Introduction

The Charity Application is built using React and Algorand's JavaScript SDK. It leverages Algorand's smart contract capabilities to manage the charity event's lifecycle, including accepting donations, tracking funds, and allowing the receiver to claim the collected funds after the event ends.

## Features

### Real-time Event Information

- The application fetches real-time information from the Algorand blockchain, providing users with essential details about the ongoing charity event.

### Pera Wallet Integration

- Users can connect their Pera Wallet to the application, enabling seamless interactions with Algorand smart contracts and the ability to make donations.

### Donations

- Donors can contribute to the charity event by specifying the donation amount in ALGOs.
- The application calculates the maximum donation amount, ensuring donors do not exceed the required funds.

### Event Status

- The application displays the start date, end date, target funds, total funds raised, and the current event status (ongoing, ended, or funds claimed) based on smart contract data.

### Opt-In to Application

- Participants need to opt-in to the charity application to participate in the event. This is a one-time process that connects their Algorand address to the smart contract.

### Claiming Funds

- After the event ends, the receiver has the option to claim the collected funds by clicking the "Claim" button.
- Funds can only be claimed once the event has ended, ensuring transparency and security.

## Usage

1. **Connect Your Pera Wallet:**

   - Click the "Connect to Pera Wallet" button to link your wallet to the application.

2. **Opt-In to the Application:**

   - Click the "Opt-in" button to associate your Algorand address with the charity event.

3. **Donations:**

   - If you are not the receiver, you can enter a donation amount in ALGOs and click "Donate it!" to make a contribution.
   - You can also use the "MAX" button to donate the maximum allowable amount.

4. **Claim Funds:**
   - If you are the receiver and the event has ended, click the "Claim" button to collect the funds.
   - Funds can only be claimed after the event has ended.

## Implementation Details

- The application uses Algorand's JavaScript SDK to interact with the Algorand blockchain.
- It fetches global state variables from the smart contract to display event information.
- Smart contract actions (Donation and Claim) are triggered through Algorand transactions.
- Real-time confirmation of transactions is ensured using the `waitForConfirmation` function.

## Support and Feedback

If you have any questions, encounter issues, or would like to provide feedback, please feel free to reach out to our support team. We are here to assist you in using the Charity Application effectively.

Thank you for using our charity application to make a positive impact in the world!
