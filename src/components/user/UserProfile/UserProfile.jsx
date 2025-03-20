import React, { useEffect, useState } from "react";
import { supabase } from "../../../services/supabaseClient.jsx" // Adjust the path if needed
import Footer from "../Footer/Footer";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError("");

      // Get current authenticated user
      const { data: authUser, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser?.user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const userId = authUser.user.id; // Supabase user ID

      // Fetch user details from 'participants' table
      const { data: userData, error: userError } = await supabase
        .from("participants")
        .select("name, email_id, phone_number")
        .eq("id", userId)
        .single(); // Assuming each user has a unique ID

      if (userError) {
        setError("Failed to fetch user data.");
      } else {
        setUser(userData);
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="w-screen min-h-screen bg-[#1E1E1E] text-white flex flex-col items-center">
      {/* Main content */}
      <div className="flex flex-col items-center justify-center w-[80vw] h-[90vh] space-y-8">
        {/* Profile Circle */}
        <div className="w-24 h-24 bg-[#2A2A2A] rounded-full border-2 border-white flex justify-center items-center">
          <p>Profile</p>
        </div>

        {/* Divider */}
        <div className="relative w-full">
          <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>
        </div>

        {/* Display Loading or Error */}
        {loading ? (
          <p className="text-gray-400">Loading profile...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="flex flex-col w-full space-y-4">
            {/* Name */}
            <div className="relative flex items-center w-full">
              <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Name</p>
              <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
              <p className="text-lg font-semibold ml-[10%]">{user?.name || "N/A"}</p>
            </div>
            <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>

            {/* Email */}
            <div className="relative flex items-center w-full">
              <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Email</p>
              <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
              <p className="text-md text-gray-300 ml-[10%]">{user?.email || "N/A"}</p>
            </div>
            <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>

            {/* Phone */}
            <div className="relative flex items-center w-full">
              <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Phone</p>
              <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
              <p className="text-md text-gray-300 ml-[10%]">{user?.phone || "N/A"}</p>
            </div>
            <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default UserProfile;
