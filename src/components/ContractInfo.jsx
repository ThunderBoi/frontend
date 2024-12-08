import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllUsers, getUserProfile } from "../utils/contractServices";

function ContractInfo({ account }) {
  const [allUsers, setAllUsers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        // Fetch all users
        const users = await getAllUsers();
        console.log("Fetched Users:", users);
        setAllUsers(users);

        // Fetch the profile of the current account
        if (account) {
          const profile = await getUserProfile(account);
          console.log("Fetched User Profile:", profile);
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
    <div className="flex flex-col md:flex-row justify-center items-start px-4 py-8 bg-gray-50 gap-x-6 mx-auto">
      {/* User Profile Section */}
      <div className="w-full md:w-2/5 bg-white shadow-md rounded-lg p-8 space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Your Trust Score Details</h3>
        {userProfile ? (
          <div>
            <p className="text-gray-700 break-words">
              <strong>Address:</strong> {account}
            </p>
            <p className="text-gray-700">
              <strong>Type:</strong> {userProfile.isMarketplace ? "Marketplace" : "User"}
            </p>
            <div className="flex items-center mt-2">
              <svg
                className="w-4 h-4 text-yellow-300 me-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
              <p className="ms-2 text-sm font-bold text-gray-900">
                {userProfile.ratingCount > 0
                  ? (Number(userProfile.ratingSum) / Number(userProfile.ratingCount)).toFixed(2)
                  : "0"}
              </p>
              <span className="w-1 h-1 mx-1.5 bg-gray-500 rounded-full"></span>
              <span className="text-sm text-gray-700">{`${userProfile.ratingCount} ratings`}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}
      </div>

      {/* Users Table Section */}
      <div className="w-full md:w-3/5 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">All Registered Users</h3>
        <table className="w-full text-sm text-left text-gray-700 border-collapse border border-gray-200">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 border border-gray-300">
                User Address
              </th>
              <th scope="col" className="px-6 py-3 border border-gray-300">
                Type
              </th>
              <th scope="col" className="px-6 py-3 border border-gray-300">
                Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {allUsers.length > 0 ? (
              allUsers.map((user, index) => (
                <tr key={index} className="bg-white border-b">
                  <td
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border border-gray-300"
                  >
                    {user.userAddress}
                  </td>
                  <td className="px-6 py-4 text-gray-700 border border-gray-300">
                    {user.isMarketplace ? "Marketplace" : "User"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 border border-gray-300">
                    {user.ratingCount > 0
                      ? (Number(user.ratingSum) / Number(user.ratingCount)).toFixed(2)
                      : "0"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-4 text-gray-500 border border-gray-300" colSpan="3">
                  No users registered
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContractInfo;
