import Footer from "../Footer/Footer";

function UserProfile() {
    return (
        <div className="w-screen min-h-screen bg-[#1E1E1E] text-white flex flex-col items-center">
            
            {/* Main content - centered & limited height */}
            <div className="flex flex-col items-center justify-center w-[80vw] h-[90vh] space-y-8">
                
                {/* Profile Circle */}
                <div className="w-24 h-24 bg-[#2A2A2A] rounded-full border-2 border-white flex justify-center items-center">
                    <p>Profile</p>
                </div>

                {/* Divider Line with Border */}
                <div className="relative w-full">
                    <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>
                </div>

                {/* User Info Section */}
                <div className="flex flex-col w-full space-y-4">
                    
                    {/* Name */}
                    <div className="relative flex items-center w-full">
                        <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Name</p>
                        
                        {/* Vertical Divider (Now touching horizontal divider) */}
                        <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
                        
                        <p className="text-lg font-semibold ml-[10%]">John Doe</p>
                    </div>
                    <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>

                    {/* Email */}
                    <div className="relative flex items-center w-full">
                        <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Email</p>
                        
                        {/* Vertical Divider (Now touching horizontal divider) */}
                        <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
                        
                        <p className="text-md text-gray-300 ml-[10%]">johndoe@example.com</p>
                    </div>
                    <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>

                    {/* Phone */}
                    <div className="relative flex items-center w-full">
                        <p className="text-sm text-gray-400 w-[25%] ml-[5%]">Phone</p>
                        
                        {/* Vertical Divider (Now touching horizontal divider) */}
                        <div className="absolute bottom-[-2px] left-[30%] h-6 w-[2px] bg-white border border-white"></div>
                        
                        <p className="text-md text-gray-300 ml-[10%]">+1 234 567 890</p>
                    </div>
                    <div className="w-full h-[2px] bg-white border border-white rounded-md"></div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default UserProfile;
