import React from "react";
import { confirmGoods } from "../utils/contractServices";
import { toast } from "react-toastify";

function ConfirmGoodsComponent({ transactionId }) {
  const handleConfirm = async () => {
    try {
      await confirmGoods(transactionId);
      toast.success("Goods confirmed successfully!");
    } catch (error) {
      console.error("Failed to confirm goods:", error);
      toast.error("Failed to confirm goods. Please try again.");
    }
  };

  return (
    <div>
      <h3>Confirm Received Goods</h3>
      <button onClick={handleConfirm}>Confirm Goods</button>
    </div>
  );
}

export default ConfirmGoodsComponent;
