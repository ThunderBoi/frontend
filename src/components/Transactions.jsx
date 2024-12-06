import React, { useEffect, useState } from "react";
import {
  confirmShipping,
  updateDeliveryState,
  finalizeTransaction,
  getAllTransactions,
  cancelTransaction,
  rateTransaction
} from "../utils/contractServices";

function Transactions({ account, isMarketplace }) {
  const [transactions, setTransactions] = useState([]);
  const [shippingDuration, setShippingDuration] = useState(7); // Default to 7 days
  const [loading, setLoading] = useState(true);
  const [deliveryState, setDeliveryState] = useState("Shipped");
  const [participantRating, setParticipantRating] = useState(4); // Default rating value
  const [marketplaceRating, setMarketplaceRating] = useState(4); // Default rating value

  // Refresh transactions list
  const refreshTransactions = async () => {
    try {
      const updatedTransactions = await getAllTransactions(account);
      console.log("Transactions fetched from contract:", updatedTransactions); // Debug log
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  };

  // Fetch transactions specific to the user
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const result = await getAllTransactions(account);
        setTransactions(result);
        console.log("Transactions fetched from contract:", result); // Debug log

      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (account) fetchTransactions();
  }, [account]);

  // Finalize transaction
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

  // Confirm shipping with a specified phase duration
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

  // Update delivery state
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


  // Rate participant
  const handleRating = async (transactionId, participantRating, marketplaceRating) => {
    try {
      await rateTransaction(transactionId, participantRating, marketplaceRating);
      alert("Participant rated successfully!");

      refreshTransactions();
    } catch (error) {
      console.error("Error rating participant:", error);
      alert("Failed to rate participant.");
    }
  };

  // Cancel transaction
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


  if (loading) return <div>Loading transactions...</div>;

  if (transactions.length === 0) return <p>No transactions available.</p>;

  return (
    <div>
      <h2>Transactions</h2>
      <ul>
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
            <li key={txn.transactionId}>

            {!txn.finalized && (
            <>
                <strong>Transaction ID: #</strong> {txn.transactionId} <br />
                <strong>Phase:</strong> {txn.phase} <br />
                <strong>Buyer:</strong> {txn.buyer} <br />
                <strong>Seller:</strong> {txn.seller} <br />
                <strong>Delivery Status:</strong> {txn.deliveryStateString} <br />
            </>
            )}


            {/* Conditionally render buttons based on permissions */}
            {canConfirmShipping && (
                <div>
                    <label>
                    Shipping Duration (in days):
                    <input
                        type="number"
                        min="1"
                        placeholder="Enter days"
                        value={shippingDuration}
                        onChange={(e) => setShippingDuration(e.target.value)}
                        style={{ marginLeft: "10px", width: "100px" }}
                    />
                    </label>
                    <button
                    onClick={() =>
                        handleConfirmShipping(txn.transactionId, shippingDuration * 24 * 60 * 60)
                    }
                    style={{ marginLeft: "10px" }}
                    >
                    Confirm Shipping
                    </button>
                </div>
                )}


            {canUpdateDeliveryState && (
                <div>
                  <select
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value)}
                  >
                    <option value="Shipped">Shipped</option>
                    <option value="NotShippedMissingData">Missing Data</option>
                    <option value="NotShippedDeliveryProblem">Delivery Problem</option>
                  </select>
                  <button
                    onClick={() => handleUpdateDeliveryState(txn.transactionId, deliveryState)}
                  >
                    Update Delivery State
                  </button>
                </div>
            )}

            {canRateTransactionAsBuyer && (
                <div>
                  <label>
                    Rate Seller:
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={participantRating}
                      onChange={(e) => setParticipantRating(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Rate Marektplace:
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={marketplaceRating}
                      onChange={(e) => setMarketplaceRating(Number(e.target.value))}
                    />
                  </label>
                  <button onClick={() => handleRating(txn.transactionId, participantRating, marketplaceRating)}>
                    Submit Rating
                  </button>
                </div>
              )}

            {canRateTransactionAsSeller && (
                <div>
                  <label>
                    Rate Buyer:
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={participantRating}
                      onChange={(e) => setParticipantRating(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Rate Marektplace:
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={marketplaceRating}
                      onChange={(e) => setMarketplaceRating(Number(e.target.value))}
                    />
                  </label>
                  <button onClick={() => handleRating(txn.transactionId, participantRating, marketplaceRating)}>
                    Submit Rating
                  </button>
                </div>
            )}
       
              {canFinalizeTransaction && (
                <button onClick={() => handleFinalizeTransaction(txn.transactionId)}>
                  Finalize Transaction
                </button>
              )}

            {/* Render cancel button for marketplace */}
            {isMarketplace && !txn.finalized &&(
              <button
                onClick={() => handleCancelTransaction(txn.transactionId)}
                style={{ marginTop: "10px" }}
              >
                Cancel Transaction
              </button>
            )}
            </li>    
          );
        })}
      </ul>
    </div>
  );
}

export default Transactions;
