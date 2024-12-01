import { ethers } from "ethers";
import ReputationStateMachine from "../utils/ReputationStateMachine.json";
import { CONTRACT_ADDRESS } from "../utils/constants";

let provider;
let contract;

// Initialize the provider and contract
const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request access to MetaMask accounts
      contract = new ethers.Contract(CONTRACT_ADDRESS, ReputationStateMachine.abi, provider);
      console.log("Provider and contract initialized successfully");
    } catch (error) {
      console.error("Failed to initialize provider and contract:", error);
    }
  } else {
    console.error("Please install MetaMask!");
  }
};

// Call initialize when the module is loaded
initialize();

// Function to request account access from MetaMask
export const requestAccount = async () => {
  try {
    if (!provider) {
      console.error("Provider is not initialized");
      await initialize();
    }
    await provider.send("eth_requestAccounts", []);
    const accounts = await provider.listAccounts();
    return accounts.length > 0 ? accounts[0].address : null;
  } catch (error) {
    console.error("Error requesting account:", error);
    return null;
  }
};

// Function to get all registered users
export const getAllUsers = async () => {
  try {
    if (!contract) {
      console.error("Contract is not initialized");
      await initialize();
    }
    console.log("Getting all users...");
    console.log(await contract.test());
    const users = await contract.getAllUsers();
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

// Function to get user profile by address
export const getUserProfile = async (address) => {
  try {
    if (!contract) {
      console.error("Contract is not initialized");
      await initialize();
    }
    const userProfile = await contract.getUserProfile(address);
    const [score, isMarketplace] = userProfile;

    return {
      score: parseInt(score, 10), // Ensure the returned score is a plain integer
      isMarketplace: isMarketplace,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Function to register a user, passing whether the user is a marketplace or not
export const registerUser = async (isMarketplace) => {
  try {
    if (!provider || !contract) {
      console.error("Provider or contract is not initialized");
      await initialize();
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    // Explicitly adding gas limit to ensure enough gas for execution
    await contractWithSigner.registerUser(isMarketplace);
    console.log("User successfully registered!");
  } catch (error) {
    if (error.code === "CALL_EXCEPTION") {
      console.error("Call exception occurred. Likely a require condition failed in the smart contract.");
    } else {
      console.error("Error registering user:", error);
    }
    throw error;
  }
};

// Function to create an offer
export const createOffer = async (item, price, description) => {
  try {
    if (!provider || !contract) {
      console.error("Provider or contract is not initialized");
      await initialize();
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.createOffer(item, price, description);
    console.log("Offer created successfully");
  } catch (error) {
    console.error("Error creating offer:", error);
    throw error;
  }
};

// Function to get all offers
export const getAllOffers = async () => {
  try {
    if (!contract) {
      console.error("Contract is not initialized");
      await initialize();
    }
    const offers = await contract.getAllOffers();
    return offers.map((offer) => ({
      item: offer.item,
      price: offer.price,
      description: offer.description,
      seller: offer.seller,
    }));
  } catch (error) {
    console.error("Error fetching offers:", error);
    throw error;
  }
};

// Function to delete an offer
export const deleteOffer = async (offerID) => {
  try {
    if (!provider || !contract) {
      console.error("Provider or contract is not initialized");
      await initialize();
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.deleteOffer(offerID);
    console.log("Offer deleted successfully");
  } catch (error) {
    console.error("Error deleting offer:", error);
    throw error;
  }
};

// Function to initiate a transaction
export const initiateTransaction = async (buyer, seller, offerID) => {
  try {
    if (!provider || !contract) {
      console.error("Provider or contract is not initialized");
      await initialize();
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.initiateTransaction(buyer, seller, offerID);
    console.log("Transaction initiated successfully");
  } catch (error) {
    console.error("Error initiating transaction:", error);
    throw error;
  }
};

// Function to accept an offer
export const acceptOffer = async (offerID) => {
  try {
    if (!provider || !contract) {
      console.error("Contract is not initialized");
      await initialize();
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.acceptOffer(offerID);
    console.log("Offer accepted successfully");
  } catch (error) {
    console.error("Error accepting offer:", error);
    throw error;
  }
};

// Function to rate a transaction
export const rateTransaction = async (transactionId, rating, review) => {
  try {
    if (!provider || !contract) {
      console.error("Provider or contract is not initialized");
      await initialize();
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.submitRating(transactionId, rating, review);
    console.log("Rating submitted successfully");
  } catch (error) {
    console.error("Error submitting rating:", error);
    throw error;
  }
};

// Function to update the transaction status
export const updateTransactionStatus = async (transactionId, newPhase) => {
  try {
    if (!provider || !contract) {
      console.error("Provider or contract is not initialized");
      await initialize();
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.updateTransactionStatus(transactionId, newPhase);
    console.log("Transaction status updated successfully");
  } catch (error) {
    console.error("Error updating transaction status:", error);
    throw error;
  }
};

// Function to get the current transaction status
export const getTransactionPhase = async (transactionId) => {
  try {
    if (!contract) {
      console.error("Contract is not initialized");
      await initialize();
    }
    const status = await contract.getTransactionPhase(transactionId);
    return status; // Assuming it returns a phase that can be understood by the frontend
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    throw error;
  }
};

// Function to confirm goods
export const confirmGoods = async (transactionId) => {
  try {
    if (!provider || !contract) {
      console.error("Provider or contract is not initialized");
      await initialize();
    }
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.confirmGoods(transactionId);
    console.log("Goods confirmed successfully");
  } catch (error) {
    console.error("Error confirming goods:", error);
    throw error;
  }
};
