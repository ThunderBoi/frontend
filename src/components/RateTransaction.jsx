import React, { useState } from "react";
import { rateTransaction } from "../utils/contractServices";
import { toast } from "react-toastify";

function RateTransaction({ transactionId }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = async () => {
    try {
      if (rating < 1 || rating > 5) {
        toast.error("Rating must be between 1 and 5");
        return;
      }
      await rateTransaction(transactionId, rating, review);
      toast.success("Rating submitted successfully!");
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  return (
    <div>
      <h3>Submit Rating and Review</h3>
      <input
        type="number"
        placeholder="Rating (1-5)"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      />
      <textarea
        placeholder="Write a review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      ></textarea>
      <button onClick={handleSubmit}>Submit Rating</button>
    </div>
  );
}

export default RateTransaction;
