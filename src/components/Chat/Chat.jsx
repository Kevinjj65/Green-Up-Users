import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "./../user/Footer/Footer";

const Chat = () => {
  const { organizerId, eventId, attendeeId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null); // "attendee" or "organizer"
  const [currentUserId, setCurrentUserId] = useState(null); // ID from participants or organizers table

  // Scroll to bottom of the messages container
  const scrollToBottom = () => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  // Fetch logged-in user's role and ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("User not authenticated");
        return;
      }

      const userEmail = authData.user.email;

      // Check if user is an attendee
      const { data: participantData, error: participantError } = await supabase
        .from("participants")
        .select("id")
        .eq("email_id", userEmail)
        .single();

      if (participantData && !participantError) {
        setCurrentUserRole("attendee");
        setCurrentUserId(participantData.id);
        return;
      }

      // Check if user is an organizer
      const { data: organizerData, error: organizerError } = await supabase
        .from("organizers")
        .select("id")
        .eq("email_id", userEmail)
        .single();

      if (organizerData && !organizerError) {
        setCurrentUserRole("organizer");
        setCurrentUserId(organizerData.id);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch event name based on eventId
  useEffect(() => {
    const fetchEventName = async () => {
      if (!eventId) return;

      try {
        const { data, error } = await supabase
          .from("events")
          .select("title")
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEventName(data?.title || "Unknown Event");
      } catch (error) {
        console.error("Error fetching event name:", error);
        setEventName("Unknown Event");
      }
    };

    fetchEventName();
  }, [eventId]);

  // Fetch messages and their sender names
  useEffect(() => {
    const fetchMessages = async () => {
      if (!eventId) return;

      setLoading(true);

      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select(`
            id,
            event_id,
            attendee_id,
            message,
            created_at,
            sent_by,
            organizer_id
          `)
          .eq("event_id", eventId)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;

        const attendeeIds = [...new Set(messagesData
          .filter((msg) => msg.sent_by)
          .map((msg) => msg.attendee_id)
          .filter((id) => id))];
        
        const organizerIds = [...new Set(messagesData
          .filter((msg) => !msg.sent_by)
          .map((msg) => msg.organizer_id)
          .filter((id) => id))];

        let participantsData = [];
        let organizersData = [];

        if (attendeeIds.length > 0) {
          const { data, error: participantsError } = await supabase
            .from("participants")
            .select("id, name")
            .in("id", attendeeIds);
          if (participantsError) throw participantsError;
          participantsData = data || [];
        }

        if (organizerIds.length > 0) {
          const { data, error: organizersError } = await supabase
            .from("organizers")
            .select("id, name")
            .in("id", organizerIds);
          if (organizersError) throw organizersError;
          organizersData = data || [];
        }

        const messagesWithNames = messagesData.map((message) => {
          let name = "Unknown";
          if (message.sent_by) {
            const participant = participantsData.find((p) => p.id === message.attendee_id);
            name = participant?.name || "Unknown";
          } else {
            const organizer = organizersData.find((o) => o.id === message.organizer_id);
            name = organizer?.name || "Unknown";
          }
          return { ...message, name };
        });

        setMessages(messagesWithNames);
      } catch (error) {
        console.error("Error in fetchMessages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [eventId]);

  // Real-time subscription to messages
  useEffect(() => {
    const messageSubscription = supabase
      .channel(`event:${eventId}`)  // Create a channel for this specific event
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const newMessage = payload.new;

        // Determine if the message is from an attendee or organizer
        let senderName = 'Unknown';

        if (newMessage.sent_by) {
          // Fetch attendee name
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
          // Fetch organizer name
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

        // Add the sender's name to the message and update state
        const messageWithName = { ...newMessage, name: senderName };
        setMessages((prevMessages) => [...prevMessages, messageWithName]);
      })
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      messageSubscription.unsubscribe();  // Use unsubscribe() instead of removeSubscription()
    };
  }, [eventId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentUserId || !currentUserRole) return;

    try {
      const newMessage = {
        event_id: eventId,
        message: messageInput,
        sent_by: currentUserRole === "attendee",
      };
      if (currentUserRole === "attendee") {
        newMessage.attendee_id = currentUserId;
        newMessage.organizer_id = organizerId;
      } else {
        newMessage.organizer_id = currentUserId;
        newMessage.attendee_id = attendeeId;
      }

      const { data: newMessageData, error: insertError } = await supabase
        .from("messages")
        .insert([newMessage])
        .select(`
          id,
          event_id,
          attendee_id,
          message,
          created_at,
          sent_by,
          organizer_id
        `)
        .single();

      if (insertError) throw insertError;

      let name = "Unknown";
      if (currentUserRole === "attendee") {
        const { data, error } = await supabase
          .from("participants")
          .select("name")
          .eq("id", currentUserId)
          .single();
        if (!error) name = data?.name || "Unknown";
      } else {
        const { data, error } = await supabase
          .from("organizers")
          .select("name")
          .eq("id", currentUserId)
          .single();
        if (!error) name = data?.name || "Unknown";
      }

      const newMessageWithName = { ...newMessageData, name };
      setMessages((prevMessages) => [...prevMessages, newMessageWithName]);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    scrollToBottom();  // Scroll to bottom on messages change
  }, [messages]);  // Only re-run when messages change

  return (
    <>
      <button
        onClick={() => navigate(`/afterregistration/${eventId}/${attendeeId}`)}
        style={{ position: "fixed", top: "0px", right: "0px", zIndex: 1000 }}
        className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Back
      </button>

      <div className="chat-container" style={{ minHeight: "200px", padding: "20px" }}>
        <h2>Chat for {eventName}</h2>

        <div id="messages-container" className="messages-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
          {loading ? (
            <p>Loading messages...</p>
          ) : (
            <div className="messages">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="message"
                    style={{
                      textAlign:
                        (message.sent_by && message.attendee_id === currentUserId) ||
                        (!message.sent_by && message.organizer_id === currentUserId)
                          ? "right"
                          : "left",
                    }}
                  >
                    <p>
                      <strong>{message.name || "Unknown"}:</strong> {message.message}
                    </p>
                    <small>{new Date(message.created_at).toLocaleString()}</small>
                  </div>
                ))
              ) : (
                <p>No messages yet. Be the first to send a message!</p>
              )}
            </div>
          )}
        </div>

        <div className="message-input-container">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Chat;
