import React, { useState, useEffect } from "react";
import ConnectWalletButton from "./components/ConnectWalletButton";
import ContractInfo from "./components/ContractInfo";
import CreateOffer from "./components/CreateOffer";
import OffersList from "./components/OffersList";
import RegisterUserComponent from "./components/RegisterUser";
import Transactions from "./components/Transactions";
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Marketplace DApp</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
        <ToastContainer />
        {!account ? (
          <ConnectWalletButton setAccount={setAccount} />
        ) : !isRegistered ? (
          <RegisterUserComponent account={account} onUserRegistered={handleUserRegistered} />
        ) : (
          <div className="space-y-6">
            <ContractInfo account={account} />
            {!isMarketplace && <CreateOffer />}
            <OffersList account={account} onSelectTransaction={handleSelectTransaction} />
            <Transactions account={account} isMarketplace={isMarketplace} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Marketplace DApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
