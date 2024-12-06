import React, { useState, useEffect } from "react";
import { getFilteredOffers, deleteOffer, initiateTransaction, acceptOffer, getUserProfile, getOfferCount } from "../utils/contractServices";
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
        const count = await getOfferCount();
        console.log("Offer count fetched from contract:", count); // Debug log
        // Fetch offers & offer Count
        const offersList = await getFilteredOffers();
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
      const offer = offers.find((o) => o.offerID === offerID);
      if (!offer) {
        toast.error("Invalid offer ID.");
        return;
      }
  
      const receipt = await deleteOffer(offerID);
      console.log("Offer deleted successfully:", receipt);
  
      setOffers((prevOffers) => prevOffers.filter((offer) => offer.offerID !== offerID));
      toast.success("Offer deleted successfully!");
    } catch (error) {
      console.error("Failed to delete offer:", error);
      toast.error("Failed to delete offer. Please try again.");
    }
  };
  
  
  // Handle initiating a transaction without full page reload
  const handleInitiateTransaction = async (buyer, seller, offerID) => {
    try {
      await initiateTransaction(buyer, seller, offerID);
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
<ul>
  {offers.map((offer, index) => (
    <li key={offer.offerID || index}> {/* Use index as a fallback */}
      <p>[{`OfferID #${offer.offerID}`}]</p>
      <p>Item {offer.item}</p>
      <p>Price: {offer.price} EUR</p>
      <p>Description: {offer.description}</p>
      <p>Seller: {offer.seller}</p>
      {offer.buyer !== "0x0000000000000000000000000000000000000000" ? (
        <p>Buyer: {offer.buyer}</p>
      ) : (
        <p>Buyer: No buyer yet</p>
      )}
      {account === offer.seller && (
        <button onClick={() => handleDeleteOffer(offer.offerID)}>Delete Offer</button>
      )}
      {userProfile.isMarketplace && offer.buyerAccept && (
        <button onClick={() => handleInitiateTransaction(offer.buyer, offer.seller, offer.offerID)}>
          Initiate Transaction
        </button>
      )}
      {!userProfile.isMarketplace && account !== offer.seller && !offer.buyerAccept &&(
        <button onClick={() => handleAcceptOffer(offer.offerID)}>Accept Offer</button>
      )}
    </li>
  ))}
</ul>

  );
}

export default OffersList;
