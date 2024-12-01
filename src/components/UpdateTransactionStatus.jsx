import React from "react";
import { updateTransactionStatus } from "../utils/contractServices";
import { toast } from "react-toastify";

function UpdateTransactionStatusComponent({ transactionId, currentPhase }) {
  const handleUpdate = async (newPhase) => {
    try {
      await updateTransactionStatus(transactionId, newPhase);
      toast.success(`Transaction updated to phase: ${newPhase}`);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error("Failed to update transaction. Please try again.");
    }
  };

  return (
    <div>
      <h3>Update Transaction Status</h3>
      <button onClick={() => handleUpdate("Shipping")}>Confirm Shipping</button>
      <button onClick={() => handleUpdate("Delivered")}>Confirm Delivery</button>
    </div>
  );
}

export default UpdateTransactionStatusComponent;
