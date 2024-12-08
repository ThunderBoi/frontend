import React, { useState, useEffect } from "react";
import ConnectWalletButton from "./components/ConnectWalletButton";
import ContractInfo from "./components/ContractInfo";
import CreateOffer from "./components/CreateOffer";
import OffersList from "./components/OffersList";
import RegisterUserComponent from "./components/RegisterUser";
import Transactions from "./components/Transactions";
import { requestAccount, getUserProfile } from "./utils/contractServices";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [account, setAccount] = useState(null);
  const [isMarketplace, setIsMarketplace] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // Store the current user's profile

  useEffect(() => {
    const fetchAccount = async () => {
      const acc = await requestAccount();
      console.log("Fetched Account:", acc);
      setAccount(acc);
      if (acc) {
        try {
          const profile = await getUserProfile(acc); // Fetch the user's profile
          console.log("Fetched Profile:", profile);

          // Check if the profile exists and update state
          const isUserRegistered = Boolean(profile.exists);
          setIsRegistered(isUserRegistered);

          if (isUserRegistered) {
            setIsMarketplace(profile.isMarketplace);
            setUserProfile(profile); // Store the profile for use in the app
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchAccount();
  }, []); // Run on component mount

  const handleUserRegistered = async () => {
    console.log("App.js: handleUserRegistered: address: ", account);
    if (!account) {
      console.error("No account available to fetch user profile.");
      return;
    }
    try {
      const profile = await getUserProfile(account); // Fetch the user's profile using the current account
      console.log("Profile after registration:", profile);
  
      // Update the registration status
      const isUserRegistered = Boolean(profile.exists);
      setIsRegistered(isUserRegistered);
  
      if (isUserRegistered) {
        setIsMarketplace(profile.isMarketplace); // Update the marketplace status
        setUserProfile(profile); // Store the profile for later use
      }
    } catch (error) {
      console.error("Error during registration process:", error);
    }
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
      <main className="flex-grow container mx-auto px-4 py-6">
        <ToastContainer />
        {!account ? (
          <ConnectWalletButton setAccount={setAccount} />
        ) : !isRegistered ? (
          <RegisterUserComponent account={account} onUserRegistered={handleUserRegistered} />
        ) : (
          <div className="space-y-6">
            <ContractInfo account={account} userProfile={userProfile} />
            <div className="flex flex-col lg:flex-row lg:space-x-6">
            {/* Conditionally render Create Offer Section for non-marketplace users */}
            {!isMarketplace && (
              <div className="lg:w-1/3 w-full">
                <CreateOffer />
              </div>
            )}

            {/* Offers List Section is always visible */}
            <div className={`w-full ${isMarketplace ? "" : "lg:w-2/3"}`}>
              <OffersList account={account} />
            </div>
</div>

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
