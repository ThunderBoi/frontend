  import React, { useState, useEffect } from "react";
  import { toast } from "react-toastify";
  import { getAllUsers, getUserProfile } from "../utils/contractServices";

  function ContractInfo({ account }) {
    const [allUsers, setAllUsers] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
      const fetchContractData = async () => {
        try {
          // Call getAllUsers function from contractServices
          const users = await getAllUsers();
          setAllUsers(users);

          // Call getUserProfile function for the connected account
          if (account) {
            const profile = await getUserProfile(account);
            setUserProfile(profile);
          }
        } catch (error) {
          console.error("Failed to fetch contract data:", error);
          toast.error("Failed to fetch contract data. Please try again.");
        }
      };

      fetchContractData();
    }, [account]);

    return (
      <div>
        <h2>Contract Information</h2>
        <div>
          <h3>All Registered Users:</h3>
          <ul>
            {allUsers.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Your Trust Score Details:</h3>
          {userProfile ? (
            <div>
              <p>Address: {account}</p>
              <p>Score: {userProfile.score}</p>
              <p>Type: {userProfile.isMarketplace ? "Marketplace" : "User"}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    );
  }

  export default ContractInfo;
