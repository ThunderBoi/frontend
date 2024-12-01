import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllUsers, registerUser } from "../utils/contractServices";

function RegisterUserComponent({ account, onUserRegistered }) {
  const [userType, setUserType] = useState("user");
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  const handleRegisterUser = async () => {
    try {
      if (allUsers.includes(account)) {
        toast.error("User already registered!");
        return;
      }
      const isMarketplace = userType === "market";
      await registerUser(isMarketplace);  
      toast.success("User successfully registered!");
      // Call the callback function to trigger any updates needed in the parent component
      window.location.reload();
    } catch (error) {
      console.error("Failed to register user:", error);
      toast.error("Failed to register user. Please try again.");
    }
  };

  return (
    <div>
      <h2>Register User</h2>
      <div>
        <div>
          <label>
            <input
              type="radio"
              value="user"
              checked={userType === "user"}
              onChange={() => setUserType("user")}
            />
            User
          </label>
          <label>
            <input
              type="radio"
              value="market"
              checked={userType === "market"}
              onChange={() => setUserType("market")}
            />
            Market
          </label>
        </div>
        <button onClick={handleRegisterUser}>Register User</button>
      </div>
    </div>
  );
}

export default RegisterUserComponent;
