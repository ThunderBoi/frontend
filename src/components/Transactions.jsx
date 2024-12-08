import React, { useEffect, useState } from "react";
import {
  confirmShipping,
  updateDeliveryState,
  finalizeTransaction,
  getAllTransactions,
  cancelTransaction,
  rateTransaction,
} from "../utils/contractServices";

function Transactions({ account, isMarketplace }) {
  const [transactions, setTransactions] = useState([]);
  const [shippingDuration, setShippingDuration] = useState(7); // Default to 7 days
  const [loading, setLoading] = useState(true);
  const [deliveryState, setDeliveryState] = useState("Shipped");
  const [participantRating, setParticipantRating] = useState(4); // Default rating value
  const [marketplaceRating, setMarketplaceRating] = useState(4); // Default rating value
  const [reviewText, setReviewText] = useState(""); // For storing reviews

  const refreshTransactions = async () => {
    try {
      const updatedTransactions = await getAllTransactions(account);
      console.log("Transactions fetched from contract:", updatedTransactions);
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const result = await getAllTransactions(account);
        setTransactions(result);
        console.log("Transactions fetched from contract:", result);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }

    };

    if (account) fetchTransactions();
  }, [account]);

  const handleFinalizeTransaction = async (transactionId) => {
    try {
      await finalizeTransaction(transactionId);
      alert("Transaction finalized successfully!");
      refreshTransactions();
    } catch (error) {
      console.error("Error finalizing transaction:", error);
      alert("Failed to finalize transaction.");
    }
  };

  const handleConfirmShipping = async (transactionId, shippingDuration) => {
    try {
      await confirmShipping(transactionId, shippingDuration);
      alert("Shipping confirmed successfully!");
      refreshTransactions();
    } catch (error) {
      console.error("Error confirming shipping:", error);
      alert("Failed to confirm shipping.");
    }
  };

  const handleUpdateDeliveryState = async (transactionId, deliveryState) => {
    try {
      await updateDeliveryState(transactionId, deliveryState);
      alert("Delivery state updated successfully!");
      refreshTransactions();
    } catch (error) {
      console.error("Error updating delivery state:", error);
      alert("Failed to update delivery state.");
    }
  };

  const handleRating = async (transactionId, participantRating, marketplaceRating, reviewText) => {
    try {
      await rateTransaction(transactionId, participantRating, marketplaceRating, reviewText);
      alert("Participant rated successfully!");
      setReviewText(""); // Clear review text after submission
      refreshTransactions();
    } catch (error) {
      console.error("Error rating participant:", error);
      alert("Failed to rate participant.");
    }
  };

  const handleCancelTransaction = async (transactionId) => {
    try {
      await cancelTransaction(transactionId);
      alert("Transaction cancelled successfully!");
      refreshTransactions();
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      alert("Failed to cancel transaction.");
    }
  };

  if (loading) return <div className="text-center py-6">Loading transactions...</div>;

  if (transactions.length === 0)
    return <p className="text-center text-gray-500 py-6">No transactions available.</p>;

  return (
    <div className="space-y-6">    
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {transactions.map((txn) => {
          const canConfirmShipping =
            isMarketplace && txn.phase === 1 && txn.marketplace === account && !txn.finalized;
          const canUpdateDeliveryState =
            isMarketplace && txn.phase === 2 && txn.marketplace === account && !txn.finalized;

          const canRateTransactionAsBuyer =
            txn.phase === 3 && txn.buyer === account && !txn.finalized && !txn.buyerRated;

          const canRateTransactionAsSeller =
            txn.phase === 3 && txn.seller === account && !txn.finalized && !txn.sellerRated;

          const canFinalizeTransaction =
            isMarketplace && txn.phase === 3 && !txn.finalized && txn.sellerRated && txn.buyerRated;

          return (
            <div
              key={txn.transactionId}
              className="bg-white shadow-lg rounded-lg p-4 space-y-4"
            >
              <p className="text-gray-700">
                <strong>Transaction ID:</strong> #{txn.transactionId}
              </p>
              <p className="text-gray-700">
                <strong>Phase:</strong> {txn.phase}
              </p>
              <p className="text-gray-700">
                <strong>Buyer:</strong> {txn.buyer}
              </p>
              <p className="text-gray-700">
                <strong>Seller:</strong> {txn.seller}
              </p>
              <p className="text-gray-700">
                <strong>Delivery Status:</strong> {txn.deliveryStateString}
              </p>

              <div className="space-y-2">
                {canConfirmShipping && (
                  <div className="space-y-2">
                    <label className="block text-sm">
                      Shipping Duration (in days):
                      <input
                        type="number"
                        min="1"
                        value={shippingDuration}
                        onChange={(e) => setShippingDuration(e.target.value)}
                        className="mt-1 w-full border rounded-md px-3 py-2"
                      />
                    </label>
                    <button
                      onClick={() =>
                        handleConfirmShipping(txn.transactionId, shippingDuration * 24 * 60 * 60)
                      }
                      className="bg-blue-500 text-white w-full py-2 rounded-md hover:bg-blue-600"
                    >
                      Confirm Shipping
                    </button>
                  </div>
                )}


                {canUpdateDeliveryState && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Update Delivery State</h3>
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-700">
                        Select Delivery State:
                        <select
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value)}
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Shipped">Shipped</option>
                          <option value="NotShippedMissingData">Missing Data</option>
                          <option value="NotShippedDeliveryProblem">Delivery Problem</option>
                        </select>
                      </label>
                    </div>
                    <button
                      onClick={() => handleUpdateDeliveryState(txn.transactionId, deliveryState)}
                      className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Update Delivery State
                    </button>
                  </div>
                )}


                {canRateTransactionAsBuyer && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Rate Seller</h3>
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-700">
                        Seller Rating (1-5):
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={participantRating}
                          onChange={(e) => setParticipantRating(Number(e.target.value))}
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Marketplace Rating (1-5):
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={marketplaceRating}
                          onChange={(e) => setMarketplaceRating(Number(e.target.value))}
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Review Seller:
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Write your review about the seller"
                        />
                      </label>
                    </div>
                    <button
                      onClick={() => handleRating(txn.transactionId, participantRating, marketplaceRating, reviewText)}
                      className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Submit Ratings
                    </button>
                  </div>
                )}

                {canRateTransactionAsSeller && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Rate Buyer</h3>
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-700">
                        Buyer Rating (1-5):
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={participantRating}
                          onChange={(e) => setParticipantRating(Number(e.target.value))}
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Marketplace Rating (1-5):
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={marketplaceRating}
                          onChange={(e) => setMarketplaceRating(Number(e.target.value))}
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                      <label className="block text-sm text-gray-700">
                        Review Buyer:
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Write your review about the buyer"
                        />
                      </label>
                    </div>
                    <button
                      onClick={() => handleRating(txn.transactionId, participantRating, marketplaceRating, reviewText)}
                      className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Submit Ratings
                    </button>
                  </div>
                )}

                {canFinalizeTransaction && (
                  <button
                    onClick={() => handleFinalizeTransaction(txn.transactionId)}
                    className="bg-purple-500 text-white w-full py-2 rounded-md hover:bg-purple-600"
                  >
                    Finalize Transaction
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Transactions;
