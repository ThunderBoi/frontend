import React, { useState, useEffect } from "react";
import { getAllOffers, deleteOffer, initiateTransaction, acceptOffer, getUserProfile } from "../utils/contractServices";
import { toast } from "react-toastify";

function OffersList({ account }) {
  const [offers, setOffers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile and offers
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        if (account) {
          // Fetch user profile
          const profile = await getUserProfile(account);
          setUserProfile(profile);
        }

        // Fetch offers
        const offersList = await getAllOffers();
        console.log("Offers fetched from contract:", offersList); // Debug log
        setOffers(offersList);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to fetch data. Please try again.");
      }
    };

    fetchContractData();
  }, [account]);

  // Handle deleting an offer without full page reload
  const handleDeleteOffer = async (offerID) => {
    try {
      await deleteOffer(offerID);
      setOffers((prevOffers) => prevOffers.filter((offer) => offer.offerID !== offerID));
      toast.success("Offer deleted successfully!");
    } catch (error) {
      console.error("Failed to delete offer:", error);
      toast.error("Failed to delete offer. Please try again.");
    }
  };

  // Handle initiating a transaction without full page reload
  const handleInitiateTransaction = async (offerID, buyer, seller) => {
    try {
      const transaction = await initiateTransaction(buyer, seller, offerID);
      if (transaction && transaction.wait) {
        await transaction.wait();
      }
      toast.success("Transaction initiated successfully!");
      // Update offers after transaction initiation (instead of full reload)
      setOffers((prevOffers) => prevOffers.filter((offer) => offer.offerID !== offerID));
    } catch (error) {
      console.error("Failed to initiate transaction:", error);
      toast.error("Failed to initiate transaction. Please try again.");
    }
  };

  // Handle accepting an offer without full page reload
  const handleAcceptOffer = async (offerID) => {
    try {
      const transaction = await acceptOffer(offerID);
      if (transaction && transaction.wait) {
        await transaction.wait();
      }
      toast.success("Offer accepted successfully!");
      // Update offers after accepting the offer (instead of full reload)
      setOffers((prevOffers) => prevOffers.filter((offer) => offer.offerID !== offerID));
    } catch (error) {
      console.error("Failed to accept offer:", error);
      toast.error("Failed to accept offer. Please try again.");
    }
  };

  return (
    <div className="offers-list">
      <h3>Available Offers</h3>
      {offers.length === 0 ? (
        <p>No offers available</p>
      ) : (
        <ul>
          {offers.map((offer) => (
            <li key={offer.offerID}>
              <p>Item: {offer.item}</p>
              <p>Price: {offer.price} EUR</p>
              <p>Description: {offer.description}</p>
              <p>Seller: {offer.seller}</p>
              {offer.buyer !== "0x0000000000000000000000000000000000000000" && (
                <p>Buyer: {offer.buyer}</p>
              )}
              {account === offer.seller && (
                <button onClick={() => handleDeleteOffer(offer.offerID)}>Delete Offer</button>
              )}
              {userProfile && userProfile.isMarketplace && account !== offer.seller && (
                <button onClick={() => handleInitiateTransaction(offer.offerID, account, offer.seller)}>
                  Initiate Transaction
                </button>
              )}
              {userProfile && !userProfile.isMarketplace && account !== offer.seller && (
                <button onClick={() => handleAcceptOffer(offer.offerID)}>Buy Offer</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OffersList;
