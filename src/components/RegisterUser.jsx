import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllUsers, registerUser } from "../utils/contractServices";
import trustscoreLogo from "../resources/trustscore_logo.png";

export default function RegisterUserComponent({ account, onUserRegistered }) {
  const [userType, setUserType] = useState("user");
  const [verifiableCredential, setVerifiableCredential] = useState("");
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

      if (!verifiableCredential) {
        toast.error("Please provide a valid Verifiable Credential!");
        return;
      }

      const isMarketplace = userType === "market";
      console.log("Is Marketplace:", isMarketplace);
      await registerUser(isMarketplace);
      toast.success("User successfully registered!");
      onUserRegistered();
    } catch (error) {
      console.error("Failed to register user:", error);
      toast.error("Failed to register user. Please try again.");
    }
  };

  return (
    <div className="flex justify-center bg-gray-50 px-4 py-12">
      <div className="flex flex-col items-center space-y-6 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="mx-auto" style={{ maxWidth: "500px" }}>
          <img
            alt="Trust Score"
            src={trustscoreLogo}
            className="w-full h-auto"
          />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-gray-800 text-center">
          Register Your Account
        </h2>

        {/* Form */}
        <form className="space-y-4 w-full">
          {/* User Type Selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Select your type:</p>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="user"
                  checked={userType === "user"}
                  onChange={() => setUserType("user")}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="text-gray-800">User</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="market"
                  checked={userType === "market"}
                  onChange={() => setUserType("market")}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="text-gray-800">Market</span>
              </label>
            </div>
          </div>

          {/* Verifiable Credential Input */}
          <div>
            <input
              type="text"
              value={verifiableCredential}
              onChange={(e) => setVerifiableCredential(e.target.value)}
              placeholder="Enter Verifiable Credential"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Button */}
          <div>
          <button type="button" onClick={handleRegisterUser} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Register Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}
