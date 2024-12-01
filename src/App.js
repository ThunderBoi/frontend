import React, { useState, useEffect } from "react";
import ConnectWalletButton from "./components/ConnectWalletButton";
import ContractInfo from "./components/ContractInfo";
import CreateOffer from "./components/CreateOffer";
import OffersList from "./components/OffersList";
import RegisterUserComponent from "./components/RegisterUser";
import InitiateTransactionComponent from "./components/InitiateTransaction";
import UpdateTransactionStatusComponent from "./components/UpdateTransactionStatus";
import ConfirmGoodsComponent from "./components/ConfirmGoods";
import RateTransactionComponent from "./components/RateTransaction";
import { requestAccount, getUserProfile, getAllUsers, getTransactionPhase } from "./utils/contractServices";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [account, setAccount] = useState(null);
  const [isMarketplace, setIsMarketplace] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [transactionPhase, setTransactionPhase] = useState(null);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [transactionId, setTransactionId] = useState(null); // Add a state for transactionId
  const [buyerAddress, setBuyerAddress] = useState(null);  // Add a state for buyerAddress
  const [sellerAddress, setSellerAddress] = useState(null); // Add a state for sellerAddress

  useEffect(() => {
    const fetchAccount = async () => {
      const acc = await requestAccount();
      setAccount(acc);
      if (acc) {
        try {
          const users = await getAllUsers();
          const isUserRegistered = users.includes(acc);
          setIsRegistered(isUserRegistered);

          if (isUserRegistered) {
            const profile = await getUserProfile(acc);
            setIsMarketplace(profile.isMarketplace);
            setIsBuyer(profile.isBuyer);
            setIsSeller(profile.isSeller);
          }
        } catch (error) {
          console.error("Failed to fetch user profile or users list:", error);
        }
      }
    };
    fetchAccount();
  }, []);

  useEffect(() => {
    const fetchTransactionPhase = async () => {
      if (account) {
        try {
          const phase = await getTransactionPhase(account);
          setTransactionPhase(phase);
        } catch (error) {
          console.log("No Transactions available");
        }
      }
    };
    fetchTransactionPhase();
  }, [account]);

  const handleUserRegistered = async () => {
    try {
      const users = await getAllUsers();
      const isUserRegistered = users.includes(account);
      setIsRegistered(isUserRegistered);

      if (isUserRegistered) {
        const profile = await getUserProfile(account);
        setIsMarketplace(profile.isMarketplace);
        setIsBuyer(profile.isBuyer);
        setIsSeller(profile.isSeller);
      }
    } catch (error) {
      console.error("Failed to fetch user profile or users list after registration:", error);
    }
  };

  const handleSelectTransaction = (transaction) => {
    setTransactionId(transaction.transactionId);
    setBuyerAddress(transaction.buyer);
    setSellerAddress(transaction.seller);
  };

  return (
    <div className="app">
      <ToastContainer />
      {!account ? (
        <ConnectWalletButton setAccount={setAccount} />
      ) : !isRegistered ? (
        <RegisterUserComponent account={account} onUserRegistered={handleUserRegistered} />
      ) : (
        <div className="contract-interactions">
          <ContractInfo account={account} />

          {/* Display CreateOffer for users who are not marketplaces */}
          {!isMarketplace && <CreateOffer />}

          {/* Display OffersList for all users */}
          <OffersList account={account} onSelectTransaction={handleSelectTransaction} />

          {/* Initiate Transaction Component (only for marketplace) */}
          {isMarketplace && buyerAddress && sellerAddress && (
            <InitiateTransactionComponent buyer={buyerAddress} seller={sellerAddress} />
          )}

          {/* Update Transaction Status Component (only for marketplace) */}
          {isMarketplace && transactionPhase === "Phase1" && transactionId && (
            <UpdateTransactionStatusComponent transactionId={transactionId} currentPhase={transactionPhase} />
          )}

          {/* Confirm Goods Component (only for buyer in Phase 3) */}
          {isBuyer && transactionPhase === "Phase3" && transactionId && (
            <ConfirmGoodsComponent transactionId={transactionId} />
          )}

          {/* Rate Transaction Component (only for buyer or seller after transaction is finalized) */}
          {(isBuyer || isSeller) && transactionPhase === "Finalized" && transactionId && (
            <RateTransactionComponent transactionId={transactionId} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
