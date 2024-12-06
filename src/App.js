import React, { useState, useEffect } from "react";
import ConnectWalletButton from "./components/ConnectWalletButton";
import ContractInfo from "./components/ContractInfo";
import CreateOffer from "./components/CreateOffer";
import OffersList from "./components/OffersList";
import RegisterUserComponent from "./components/RegisterUser";
import Transactions from "./components/Transactions"; // Ensure Transactions is imported
import { requestAccount, getUserProfile, getAllUsers } from "./utils/contractServices";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [account, setAccount] = useState(null);
  const [isMarketplace, setIsMarketplace] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [buyerAddress, setBuyerAddress] = useState(null);
  const [sellerAddress, setSellerAddress] = useState(null);

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
          }
        } catch (error) {
          console.error("Failed to fetch user profile or users list:", error);
        }
      }
    };
    fetchAccount();
  }, []);

  const handleUserRegistered = async () => {
    try {
      const users = await getAllUsers();
      const isUserRegistered = users.includes(account);
      setIsRegistered(isUserRegistered);

      if (isUserRegistered) {
        const profile = await getUserProfile(account);
        setIsMarketplace(profile.isMarketplace);
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

          {/* Transactions Component */}
          <Transactions account={account} isMarketplace={isMarketplace} />
        </div>
      )}
    </div>
  );
}

export default App;
