import { Link } from "react-router-dom";

const OrganizerFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md py-3 flex justify-around border-t">
      <Link
        to="/organizer/events"
        className="flex flex-col items-center text-gray-700 hover:text-blue-500"
      >
        📅 <span className="text-sm">My Events</span>
      </Link>

      <Link
        to="/organizenew"
        className="flex flex-col items-center text-gray-700 hover:text-green-500"
      >
        ➕ <span className="text-sm">Organize New</span>
      </Link>

      <Link
        to="/organizer/profile"
        className="flex flex-col items-center text-gray-700 hover:text-purple-500"
      >
        👤 <span className="text-sm">Profile</span>
      </Link>
    </footer>
  );
};

export default OrganizerFooter;
