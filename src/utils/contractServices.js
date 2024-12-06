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
    const users = await contract.getAllUsers();
    console.log("All Users:", users);
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
    // Check if the provider and contract are initialized
    try {
      if (!provider || !contract) {
        console.error("Provider or contract is not initialized");
        await initialize(); // Assuming this initializes provider and contract
        console.log("Provider and contract initialized successfully.");
      }
    } catch (initializeError) {
      console.error("Error during initialization:", initializeError);
      throw new Error("Initialization failed.");
    }

    // Get signer from provider
    let signer;
    try {
      signer = await provider.getSigner();
      console.log("Signer retrieved successfully:", await signer.getAddress());
    } catch (signerError) {
      console.error("Error retrieving signer:", signerError);
      throw new Error("Failed to retrieve signer.");
    }

    // Connect contract with signer
    let contractWithSigner;
    try {
      contractWithSigner = contract.connect(signer);
      console.log("Contract connected with signer successfully.");
    } catch (contractConnectionError) {
      console.error("Error connecting contract with signer:", contractConnectionError);
      throw new Error("Failed to connect contract with signer.");
    }

    // Call the registerUser function on the smart contract
    try {
      // Explicitly adding gas limit to ensure enough gas for execution
      const tx = await contractWithSigner.registerUser(isMarketplace, { gasLimit: 300000 });
      console.log("Transaction sent successfully. Hash:", tx.hash);
      await tx.wait(); // Wait for transaction confirmation
      console.log("Transaction confirmed successfully.");
    } catch (transactionError) {
      if (transactionError.code === "CALL_EXCEPTION") {
        console.error(
          "Call exception occurred. Likely a require condition failed in the smart contract."
        );
      } else if (transactionError.data?.message) {
        console.error("Revert Reason:", transactionError.data.message);
      } else {
        console.error("Error during transaction execution:", transactionError);
      }
      throw new Error("Transaction failed.");
    }

    console.log("User successfully registered!");
  } catch (error) {
    // Top-level catch for any other uncaught errors
    console.error("Failed to register user:", error);
    throw error;
  }
};

export const getOfferCount = async () => {
  try {
    if (!contract) await initialize();
    const offerCount = await contract.getOfferCount();
    return offerCount; // Convert BigInt to number
  } catch (error) {
    console.error("Failed to fetch offer count:", error);
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
export const getFilteredOffers = async () => {
  try {
    if (!contract) {
      console.error("Contract is not initialized");
      await initialize();
    }
    const offers = await contract.getFilteredOffers();
    return offers.map((offer) => ({
      offerID: offer.offerID,
      item: offer.item,
      price: offer.price.toString(),
      description: offer.description,
      seller: offer.seller,
      buyer: offer.buyer,
      buyerAccept: offer.buyerAccept,
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

    console.log(`Attempting to delete offer with ID: ${offerID}`);
    const tx = await contractWithSigner.deleteOffer(offerID);
    console.log("Transaction sent. Hash:", tx.hash);

    // Wait for the transaction to be confirmed
    const receipt = await tx.wait();
    console.log("Transaction confirmed. Receipt:", receipt);

    return receipt;
  } catch (error) {
    console.error("Error deleting offer:", error);

    // Capture specific revert reasons if available
    if (error.data?.message) {
      console.error("Revert reason:", error.data.message);
    }

    throw error; // Re-throw the error for frontend handling
  }
};


// Function to get all transactions
// Function to get all transactions
export const getAllTransactions = async () => {
  try {
    if (!contract) {
      console.error("Contract is not initialized");
      await initialize();
    }

    const transactions = await contract.getAllTransactions();

    // Map the transactions from the contract to a JavaScript-friendly format
    return transactions.map((transaction) => ({
      transactionId: transaction.transactionID.toString(),
      buyer: transaction.buyer,
      seller: transaction.seller,
      marketplace: transaction.marketplace,
      startTime: transaction.startTime ? new Date(Number(transaction.startTime) * 1000) : null, // Handle possible null or missing
      phase1EndTime: transaction.phase1EndTime
        ? new Date(Number(transaction.phase1EndTime) * 1000)
        : null,
      phase2EndTime: transaction.phase2EndTime && Number(transaction.phase2EndTime) > 0
        ? new Date(Number(transaction.phase2EndTime) * 1000)
        : null,
      phase3EndTime: transaction.phase3EndTime && Number(transaction.phase3EndTime) > 0
        ? new Date(Number(transaction.phase3EndTime) * 1000)
        : null,
      phaseEndTime: transaction.phaseEndTime
        ? new Date(Number(transaction.phaseEndTime) * 1000)
        : null,
      deliveryState: transaction.deliveryState,      
      deliveryStateString:  transaction.deliveryState.toString() === "0" ? "Not Shipped" :
                            transaction.deliveryState.toString() === "1" ? "Shipped" :
                            transaction.deliveryState.toString() === "2" ? "NotShippedMissingData" :
                            transaction.deliveryState.toString() === "3" ? "NotShippedDeliveryProblem" :
                            "Unknown",
      buyerRated: transaction.buyerRated,
      sellerRated: transaction.sellerRated,
      marketplaceRatedByBuyer: transaction.marketplaceRatedByBuyer,
      marketplaceRatedBySeller: transaction.marketplaceRatedBySeller,
      phase: Number(transaction.phase),
      finalized: transaction.finalized,
    }));
    
    
  } catch (error) {
    console.error("Error fetching all transactions:", error);
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

// Function to confirm shipping
export const confirmShipping = async (transactionId, phase2Duration) => {
  try {
    const signer = await provider.getSigner();
    console.log("transactionId", transactionId);
    console.log("phase2Duration", phase2Duration);
    const contractWithSigner = contract.connect(signer);    
    await contractWithSigner.confirmShipping(transactionId, phase2Duration);
  } catch (error) {
    console.error("Error confirming shipping:", error);
    throw error;
  }
};

// Function to update delivery state
export const updateDeliveryState = async (transactionId, deliveryState) => {
  try {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);   

    // Define the mapping from string to number
    const deliveryStateMapping = {
      "NotShipped": 0,
      "Shipped": 1,
      "NotShippedMissingData": 2,
      "NotShippedDeliveryProblem": 3
    };

    const deliveryStateNumber = deliveryStateMapping[deliveryState];


    await contractWithSigner.updateDeliveryState(transactionId, deliveryStateNumber);
  } catch (error) {
    console.error("Error updating delivery state:", error);
    throw error;
  }
};


// Function to rate the transaction
export const rateTransaction = async (transactionId, ratingParticipant, ratingMarketplace) => {
  try {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);   
    await contractWithSigner.rateParticipant(transactionId, ratingParticipant, ratingMarketplace);

  } catch (error) {
    console.error("Error rating transaction:", error);
    throw error;
  }
};

// Function to finalize transaction
export const finalizeTransaction = async () => {
  try {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);   
    await contractWithSigner.finalizeTransaction();
  } catch (error) { 
    console.error("Error finalizing transaction:", error);
  }
};

// Function to get the current phase/state of a transaction
export const getTransactionPhase = async (transactionId) => {
  try {
    const phase = await contract.getTransactionPhase(transactionId);
    return phase;
  } catch (error) {
    console.error("Error getting transaction phase:", error);
    throw error;
  }
};

// Function to cancel a transaction
export const cancelTransaction = async (transactionId) => {
  try {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.cancelTransaction(transactionId);
  } catch (error) {
    console.error("Error cancelling transaction:", error);
    throw error;
  }
};