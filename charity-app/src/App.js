import "./App.css";
import { PeraWalletConnect } from "@perawallet/connect";
import algosdk, { decodeAddress, waitForConfirmation } from "algosdk";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";

const peraWallet = new PeraWalletConnect();
const appIndex = 404687615;

const applicationaddress = algosdk.getApplicationAddress(appIndex);
console.log("app address", applicationaddress);

const algod = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  443
);

function App() {
  const [accountAddress, setAccountAddress] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [targetFunds, setTargetFunds] = useState(0);
  const [totalFunds, setTotalFunds] = useState(0);
  const [eventProgress, setEventProgress] = useState(0);
  const [startDate, setStartDate] = useState(0);
  const [endDate, setEndDate] = useState(0);
  const [receiver, setReceiver] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress;
  const now = Math.floor(new Date().getTime() / 1e3).toString();

  useEffect(() => {
    fetchCharityData();

    // Reconnect to session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    });
  }, []);

  // Get account info and store in state
  async function fetchCharityData() {
    try {
      const appInfo = await algod.getApplicationByID(appIndex).do();

      for (let i = 0; i < appInfo.params["global-state"].length; i++) {
        if (appInfo.params["global-state"][i].key === "VGFyZ2V0RnVuZA==") {
          //TargetFunds
          setTargetFunds(appInfo.params["global-state"][i].value.uint);
        } else if (appInfo.params["global-state"][i].key === "VG90YWxGdW5k") {
          //TotalFunds
          setTotalFunds(appInfo.params["global-state"][i].value.uint);
        } else if (
          appInfo.params["global-state"][i].key === "RXZlbnRQcm9ncmVzcw=="
        ) {
          //EventProgress
          setEventProgress(appInfo.params["global-state"][i].value.uint);
        } else if (appInfo.params["global-state"][i].key === "U3RhcnREYXRl") {
          //StartDate
          setStartDate(appInfo.params["global-state"][i].value.uint);
        } else if (appInfo.params["global-state"][i].key === "RW5kRGF0ZQ==") {
          //EndDate
          setEndDate(appInfo.params["global-state"][i].value.uint);
        } else if (appInfo.params["global-state"][i].key === "UmVjZWl2ZXI=") {
          //Receiver
          const encodedAddress = appInfo.params["global-state"][i].value.bytes;
          // Convert the base64-encoded address to bytes
          const addressBytes = Buffer.from(encodedAddress, "base64");
          setReceiver(algosdk.encodeAddress(addressBytes));

          console.log("Address Bytes:", addressBytes);
          console.log("Algorand Address", algosdk.encodeAddress(addressBytes));
        }
      }
    } catch (error) {
      console.error("Error fetching charity data:", error);
    }
  }

  // Function to convert timestamp to date and time
  function timestampToDateTime(timestamp) {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "GMT",
      timeZoneName: "short",
      dayFirst: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  // Function to handle the MAX button click
  const handleMaxButtonClick = () => {
    if (!eventProgress) {
      // Calculate the maximum donation amount (targetFunds - currentFunds)
      const maxDonationAmount = targetFunds - totalFunds;
      setDonationAmount(maxDonationAmount / 1e6);
    }
  };

  return (
    <div className="App background-image">
      <header className="App-header ">
        <img
          src="https://imageupload.io/ib/a6VihM0MkbAPsKn_1696153194.png"
          alt="DonorConnect Logo"
          className="app-logo"
        />
        <h1>DonorConnect</h1>
        <br />
        <br />
        <Row>
          <Col>
            <Button
              className="btn-wallet"
              onClick={
                isConnectedToPeraWallet
                  ? handleDisconnectWalletClick
                  : handleConnectWalletClick
              }
            >
              {isConnectedToPeraWallet
                ? "Disconnect"
                : "Connect to Pera Wallet"}
            </Button>
          </Col>
          <Col>
            <Button className="btn-wallet" onClick={() => optInToApp()}>
              Opt-in
            </Button>
          </Col>
        </Row>

        {accountAddress !== null ? (
          <Row>
            <Col>
              <span style={{ fontSize: "20px" }}>
                Address: {accountAddress.slice(0, 5)}.........
                {accountAddress.slice(-5)}
              </span>
            </Col>
            <Col> </Col>
          </Row>
        ) : null}

        <br />
        <br />
        <br />
        <br />

        <Row>
          <Col>
            <h3>Start Date</h3>
            <span className="text">{timestampToDateTime(startDate)}</span>
          </Col>
          <Col>
            <h3>End Date</h3>
            <span className="text">{timestampToDateTime(endDate)}</span>
          </Col>
        </Row>
        <br />
        <br />
        <br />
        <Container>
          <Row>
            <Col>
              <h3>Target Funds</h3>
              <span className="text">{targetFunds / 1e6} ALGO</span>
            </Col>
            <Col>
              <h3>Total Funds</h3>
              <span className="text">{totalFunds / 1e6} ALGO</span>
            </Col>
            <Col>
              <h3>Event Status</h3>
              <span className="text">
                {eventProgress === 0
                  ? "Event Ongoing"
                  : eventProgress === 1
                  ? "Event Ended"
                  : "Fund Claimed"}
              </span>
            </Col>
          </Row>
          <br />
          <br />
          {accountAddress === receiver ? (
            // If accountAddress is equal to receiver, show the "Claim" button
            <Button
              id="claim-button"
              onClick={() => {
                if (eventProgress === 1 || now >= endDate) {
                  callClaimApplication("Claim");
                }
              }}
              disabled={
                eventProgress === 2 ||
                (eventProgress !== 1 && now < endDate) ||
                (eventProgress === 1 && totalFunds === 0)
              }
            >
              {eventProgress === 2
                ? "Claimed"
                : eventProgress === 0 && new Date().getTime() >= endDate
                ? "End Event"
                : eventProgress === 1 && totalFunds === 0
                ? "No Funds to Claim"
                : "Claim"}
            </Button>
          ) : (
            // Otherwise, show the "Donation Amount" input field, "MAX" button, and "Submit Donation" button
            <Form>
              <Form.Group controlId="donationAmount">
                <Form.Label className="text">Donation Amount (ALGO)</Form.Label>
                <Form.Control
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  disabled={eventProgress >= 1}
                />
                <Button
                  id="max-button"
                  onClick={handleMaxButtonClick}
                  disabled={eventProgress >= 1}
                >
                  MAX
                </Button>
              </Form.Group>
              <Button
                id="submit-button"
                onClick={() => {
                  if (eventProgress === 0) {
                    callDonationApplication("Donation");
                  }
                }}
                disabled={eventProgress >= 1}
              >
                Donate it!
              </Button>
            </Form>
          )}
        </Container>
      </header>
    </div>
  );

  function handleConnectWalletClick() {
    peraWallet.connect().then((newAccounts) => {
      // setup the disconnect event listener
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

      setAccountAddress(newAccounts[0]);
      console.log("Wallet Conneted", newAccounts[0]);
    });
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    setAccountAddress(null);
  }

  async function optInToApp() {
    const suggestedParams = await algod.getTransactionParams().do();
    const optInTxn = algosdk.makeApplicationOptInTxn(
      accountAddress,
      suggestedParams,
      appIndex
    );

    const optInTxGroup = [{ txn: optInTxn, signers: [accountAddress] }];

    const signedTx = await peraWallet.signTransaction([optInTxGroup]);
    console.log(signedTx);
    const { txId } = await algod.sendRawTransaction(signedTx).do();
    const result = await waitForConfirmation(algod, txId, 2);
  }

  //Function to proceed donate and update global state/local state
  async function callDonationApplication(action) {
    try {
      if (eventProgress) {
        // Check if the event has ended
        alert("Event has already ended. You cannot make a donation.");
        return;
      }

      const requiredAmount = (targetFunds - totalFunds) / 1e6;

      if (donationAmount <= 0) {
        // Check if the donation amount is not valid
        alert("Donation amount must be greater than zero.");
        return;
      }

      if (donationAmount > requiredAmount) {
        // Check if the donation amount exceeds the required amount
        alert("Donation amount exceeds the required amount.");
        return;
      }

      const isConfirmed = window.confirm(
        `Confirm donation of ${donationAmount} ALGOs?`
      );

      if (!isConfirmed) {
        // User canceled the donation
        return;
      }

      const suggestedParams = await algod.getTransactionParams().do();
      const buffer = Buffer.alloc(8);
      buffer.writeUIntBE(donationAmount * 1e6, 0, 8);
      console.log("DONATIONAMOUNT", donationAmount);
      console.log(typeof donationAmount);

      const appArgs = [
        new Uint8Array(Buffer.from(action)),
        new Uint8Array(Buffer.from(buffer)), // Convert donationAmount to a string and create a Uint8Array
      ];

      // Create a payment transaction
      const paymentTx = algosdk.makePaymentTxnWithSuggestedParams(
        accountAddress,
        applicationaddress,
        donationAmount * 1e6,
        undefined,
        undefined,
        suggestedParams
      );

      // Create the donation transaction
      const donationTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs
      );

      //Grouped Multiple Transcation
      const actionTxnGroup = [{ txn: paymentTx, signers: [accountAddress] }];
      const donationTxnGroup = [{ txn: donationTx, signers: [accountAddress] }];
      try {
        const signedTxnGroups = await peraWallet.signTransaction([
          actionTxnGroup,
          donationTxnGroup,
        ]);
        for (const signedTxnGroup of signedTxnGroups) {
          const { txId } = await algod.sendRawTransaction(signedTxnGroup).do();
          const result = await waitForConfirmation(algod, txId, 2);
        }
      } catch (error) {
        console.log("Couldn't sign all txns", error);
      }

      // Check if the donation was successful
      let tempFunds = 0;
      const appInfo = await algod.getApplicationByID(appIndex).do();
      for (let i = 0; i < appInfo.params["global-state"].length; i++) {
        if (appInfo.params["global-state"][i].key === "VG90YWxGdW5k") {
          tempFunds = appInfo.params["global-state"][i].value.uint;
        }
      }
      if (totalFunds == tempFunds) {
        alert(`Event has ended.No more received funds.`);
      } else {
        // Update the current funds in the user-side by adding the donation amount.
        setTotalFunds(totalFunds + donationAmount * 1e6);
        if (totalFunds == targetFunds) {
          setEventProgress(1); //Set to Event Ended
        }
        alert(`Donation of ${donationAmount} ALGOs was successful.`);
      }
    } catch (error) {
      console.error("Error making donation:", error);
      alert("Error making donation. Please try again later.");
    }
  }

  // Function to claim the funds
  async function callClaimApplication(action) {
    try {
      if (eventProgress === 0 && now <= endDate) {
        // Check if the event has ended
        //Only can claim after event has ended
        alert("Event still ongoing. You cannot claim the funds.");
        return;
      }

      const isConfirmed = window.confirm(
        `Confirm claim of ${totalFunds / 1e6} ALGOs?`
      );

      if (!isConfirmed) {
        // User canceled the claim
        return;
      }

      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from(action)),
        new Uint8Array(Buffer.from(accountAddress)),
      ];

      const claimTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs
      );

      //Single Transcation
      const actionTxGroup = [{ txn: claimTx, signers: [accountAddress] }];
      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);

      const { txId } = await algod.sendRawTransaction(signedTx).do();
      const result = await waitForConfirmation(algod, txId, 2);
      console.log(result);
      alert(`Claim of ${totalFunds / 1e6} ALGOs was successful.`);
    } catch (e) {
      console.error("Error claiming funds:", e);
      alert("Error claiming funds. Please try again later.");
    }
  }
}

export default App;
