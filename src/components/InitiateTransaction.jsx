import React from "react";
import { initiateTransaction } from "../utils/contractServices";
import { toast } from "react-toastify";

function InitiateTransactionComponent({ buyer, seller }) {
  const handleInitiate = async () => {
    try {
      await initiateTransaction(buyer, seller);
      toast.success("Transaction initiated successfully!");
    } catch (error) {
      console.error("Failed to initiate transaction:", error);
      toast.error("Failed to initiate transaction. Please try again.");
    }
  };

  return (
    <div>
      <h3>Initiate Transaction</h3>
      <button onClick={handleInitiate}>Initiate Transaction</button>
    </div>
  );
}

export default InitiateTransactionComponent;
