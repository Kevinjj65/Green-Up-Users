import { useEffect, useState, useRef } from "react";
import { supabase } from "../../services/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import Footer from './OrganizerFooter'

const OrganizerChat = () => {
  const { eventId, attendeeId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [organizerId, setOrganizerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); // Ref for scrolling

  // Fetch logged-in organizer's ID
  useEffect(() => {
    const fetchOrganizerId = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.log("User not authenticated");
        return;
      }

      const userEmail = authData.user.email;
      const { data: organizer, error: organizerError } = await supabase
        .from("organizers")
        .select("id")
        .eq("email_id", userEmail)
        .single();

      if (organizerError || !organizer) {
        console.log("Organizer not found");
        return;
      }

      setOrganizerId(organizer.id);
    };

    fetchOrganizerId();
  }, []);

  // Fetch chat messages with sender names
  useEffect(() => {
    const fetchMessages = async () => {
      if (!organizerId || !eventId || !attendeeId) return;

      setLoading(true);

      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("event_id", eventId)
          .eq("attendee_id", attendeeId)
          .eq("organizer_id", organizerId)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          return;
        }

        if (!messagesData.length) {
          setMessages([]);
          return;
        }

        // Extract attendee_ids and organizer_ids
        const attendeeIds = [
          ...new Set(
            messagesData.filter((msg) => msg.sent_by === true).map((msg) => msg.attendee_id)
          ),
        ];
        const organizerIds = [
          ...new Set(
            messagesData.filter((msg) => msg.sent_by === false).map((msg) => msg.organizer_id)
          ),
        ];

        // Fetch names for participants (attendees)
        let participantsData = [];
        if (attendeeIds.length > 0) {
          const { data: participants, error: participantsError } = await supabase
            .from("participants")
            .select("id, name")
            .in("id", attendeeIds);

          if (participantsError) {
            console.error("Error fetching participant names:", participantsError);
          } else {
            participantsData = participants;
          }
        }

        // Fetch names for organizers
        let organizersData = [];
        if (organizerIds.length > 0) {
          const { data: organizers, error: organizersError } = await supabase
            .from("organizers")
            .select("id, name")
            .in("id", organizerIds);

          if (organizersError) {
            console.error("Error fetching organizer names:", organizersError);
          } else {
            organizersData = organizers;
          }
        }

        // Map messages to include sender names
        const messagesWithNames = messagesData.map((message) => {
          if (message.sent_by === true) {
            // Message sent by attendee
            const participant = participantsData.find((p) => p.id === message.attendee_id);
            return { ...message, senderName: participant?.name || "Unknown Attendee" };
          } else {
            // Message sent by organizer
            const organizer = organizersData.find((o) => o.id === message.organizer_id);
            return { ...message, senderName: organizer?.name || "Unknown Organizer" };
          }
        });

        setMessages(messagesWithNames);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [organizerId, eventId, attendeeId]);

  // Real-time subscription to messages
  useEffect(() => {
    const messageSubscription = supabase
      .channel(`event:${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const newMessage = payload.new;
        let senderName = 'Unknown';

        if (newMessage.sent_by === true) {
          const { data: attendee, error: attendeeError } = await supabase
            .from("participants")
            .select("name")
            .eq("id", newMessage.attendee_id)
            .single();

          if (attendeeError) {
            console.error("Error fetching attendee name:", attendeeError);
          } else {
            senderName = attendee?.name || "Unknown Attendee";
          }
        } else {
          const { data: organizer, error: organizerError } = await supabase
            .from("organizers")
            .select("name")
            .eq("id", newMessage.organizer_id)
            .single();

          if (organizerError) {
            console.error("Error fetching organizer name:", organizerError);
          } else {
            senderName = organizer?.name || "Unknown Organizer";
          }
        }

        const messageWithName = { ...newMessage, senderName };
        setMessages((prevMessages) => [...prevMessages, messageWithName]);
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [eventId]);

  // Scroll to the bottom of the messages container
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Trigger scroll whenever messages change

  // Send message function
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !organizerId) return;

    const { data, error } = await supabase
      .from("messages")
      .insert([{
        event_id: eventId,
        attendee_id: attendeeId,
        organizer_id: organizerId,
        message: messageInput,
        sent_by: false,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...data, senderName: "You" },
      ]);
      setMessageInput("");
    }
  };

  // Navigate back to the chat page
  const handleNavigateBack = () => {
    navigate(`/organizer/event/${eventId}/chat`);
  };

  return (
    <div className="chat-container">
      <button
        onClick={handleNavigateBack}
        className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Chat List
      </button>

      <h2>Chat with Attendee</h2>

      <div className="messages-container h-[400px] overflow-y-auto p-4 bg-white shadow-md rounded-lg">
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          <div className="messages">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message mb-2 ${message.sent_by === false && message.organizer_id === organizerId ? 'text-right text-blue-500' : 'text-left text-gray-700'}`}
                >
                  <p>
                    <strong>{message.senderName}:</strong> {message.message}
                  </p>
                  <small>{new Date(message.created_at).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>No messages yet. Start the conversation!</p>
            )}
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Invisible ref element to trigger scrolling */}
      </div>

      <div className="message-input-container mt-4">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="p-2 border rounded-l-md w-full"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>
      <Footer/>
    </div>
  );
};

export default OrganizerChat;
