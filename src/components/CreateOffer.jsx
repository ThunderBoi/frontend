import React, { useState } from "react";
import { createOffer } from "../utils/contractServices";
import { toast } from "react-toastify";

function CreateOffer({ onOfferCreated }) {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Control expanded state

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

    setIsSubmitting(true);

    try {
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
      if (error.data?.message) {
        toast.error(`Failed to create offer: ${error.data.message}`);
      } else if (error.message) {
        toast.error(`Failed to create offer: ${error.message}`);
      } else {
        toast.error("Failed to create offer. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-6 w-full max-w-lg mx-auto transition-all duration-300 ease-in-out ${
        isExpanded ? "h-auto" : "h-16 overflow-hidden"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Create a New Offer</h3>
      <form className="space-y-4">
        {/* Item Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <input
            type="text"
            placeholder="Enter item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
          <input
            type="number"
            placeholder="Enter price in €"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Enter a description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="button"
            onClick={handleCreateOffer}
            disabled={isSubmitting}
            className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Offer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateOffer;
