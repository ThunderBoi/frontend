import React, { useState, useEffect } from "react";
import {
  getFilteredOffers,
  deleteOffer,
  initiateTransaction,
  acceptOffer,
  getUserProfile
} from "../utils/contractServices";
import { toast } from "react-toastify";

function OffersList({ account }) {
  const [offers, setOffers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchContractData = async () => {
      try{
        const profile = await getUserProfile(account);
        console.log("Fetched Profile in OffersList:", profile);
        setUserProfile(profile);
    
        const offersList = await getFilteredOffers();
        console.log("OffersList", offersList);
        setOffers(offersList);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to fetch data. Please try again.");
      }
    };

    fetchContractData();
  }, [account]);

  const handleDeleteOffer = async (offerID) => {
    try {
      await deleteOffer(offerID);
      setOffers((prevOffers) =>
        prevOffers.filter((offer) => offer.offerID !== offerID)
      );
      toast.success("Offer deleted successfully!");
    } catch (error) {
      console.error("Failed to delete offer:", error);
      toast.error("Failed to delete offer. Please try again.");
    }
  };

  const handleInitiateTransaction = async (buyer, seller, offerID) => {
    try {
      await initiateTransaction(buyer, seller, offerID);
      setOffers((prevOffers) =>
        prevOffers.filter((offer) => offer.offerID !== offerID)
      );
      toast.success("Transaction initiated successfully!");
    } catch (error) {
      console.error("Failed to initiate transaction:", error);
      toast.error("Failed to initiate transaction. Please try again.");
    }
  };

  const handleAcceptOffer = async (offerID) => {
    try {
      const transaction = await acceptOffer(offerID);
      if (transaction && transaction.wait) {
        await transaction.wait();
      }
      toast.success("Offer accepted successfully!");
      setOffers((prevOffers) =>
        prevOffers.filter((offer) => offer.offerID !== offerID)
      );
    } catch (error) {
      console.error("Failed to accept offer:", error);
      toast.error("Failed to accept offer. Please try again.");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer, index) => (
          <div
            key={offer.offerID || index}
            className="bg-white shadow-md rounded-lg p-4 space-y-2 break-words"
          >
            <h3 className="text-lg font-semibold text-gray-800">{offer.item}</h3>
            <p className="text-gray-600">
              <strong>Price:</strong> {offer.price} EUR
            </p>
            <p className="text-gray-600">
              <strong>Description:</strong> {offer.description}
            </p>
            <p className="text-gray-600">
              <strong>Seller:</strong> {offer.seller}
            </p>
            <p className="text-gray-600">
              <strong>Buyer:</strong>{" "}
              {offer.buyer !== "0x0000000000000000000000000000000000000000"
                ? offer.buyer
                : "No buyer yet"}
            </p>
            {account === offer.seller && (
              <button
                onClick={() => handleDeleteOffer(offer.offerID)}
                className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
              >
                Delete Offer
              </button>
            )}
            {userProfile?.isMarketplace && (
              <button
                onClick={() =>
                  handleInitiateTransaction(offer.buyer, offer.seller, offer.offerID)
                }
                className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600"
              >
                Initiate Transaction
              </button>
            )}
            {!userProfile?.isMarketplace && account !== offer.seller && !offer.buyerAccept && (
                <button
                  onClick={() => handleAcceptOffer(offer.offerID)}
                  className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                >
                  Accept Offer
                </button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OffersList;
