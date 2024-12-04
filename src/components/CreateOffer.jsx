import React, { useState } from "react";
import { createOffer } from "../utils/contractServices";
import { toast } from "react-toastify";

function CreateOffer({ onOfferCreated }) {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateOffer = async () => {
    try {
      if (!item || !price || !description) {
        toast.error("Enter correct values!");
        return;
      }
      await createOffer(item, price, description);
      toast.success("Offer created successfully!");
      setItem("");
      setPrice("");
      setDescription("");
      if (onOfferCreated) {
        onOfferCreated();
      }
    } catch (error) {
      console.error("Failed to create offer:", error);
      toast.error("Failed to create offer. Please try again.");
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
      <button onClick={handleCreateOffer}>Create Offer</button>
    </div>
  );
}

export default CreateOffer;
