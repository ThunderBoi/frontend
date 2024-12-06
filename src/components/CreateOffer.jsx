import React, { useState } from "react";
import { createOffer } from "../utils/contractServices";
import { toast } from "react-toastify";

function CreateOffer({ onOfferCreated }) {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks submission state

  const validateInputs = () => {
    if (!item.trim() || !description.trim()) {
      toast.error("Item name and description cannot be empty!");
      return false;
    }
    if (isNaN(price) || price <= 0) {
      toast.error("Price must be a positive number!");
      return false;
    }
    return true;
  };

  const handleCreateOffer = async () => {
    if (!validateInputs()) return;

    setIsSubmitting(true); // Disable the button while processing

    try {
      await createOffer(item, price, description);

      toast.success("Offer created successfully!");
      
      // Reset input fields
      setItem("");
      setPrice("");
      setDescription("");

      // Notify parent component of the new offer
      if (onOfferCreated) {
        onOfferCreated();
      }
    } catch (error) {
      console.error("Failed to create offer:", error);

      // Display specific error messages if available
      if (error.data?.message) {
        toast.error(`Failed to create offer: ${error.data.message}`);
      } else if (error.message) {
        toast.error(`Failed to create offer: ${error.message}`);
      } else {
        toast.error("Failed to create offer. Please try again.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };

  return (
    <div className="create-offer">
      <h3>Create a New Offer</h3>
      <input
        type="text"
        placeholder="Item"
        value={item}
        onChange={(e) => setItem(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price in €"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleCreateOffer} disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Offer"}
      </button>
    </div>
  );
}

export default CreateOffer;
