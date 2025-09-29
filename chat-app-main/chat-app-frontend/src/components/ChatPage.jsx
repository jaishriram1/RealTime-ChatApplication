import { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // Load messages on page init
  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessagess(roomId);
        setMessages(messages);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        /* empty */
      }
    }
    if (connected) {
      loadMessages();
    }
  }, [connected, roomId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Init stomp client and subscribe
  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId, connected]);

  // Send message
  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };

  function handleLogout() {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  return (
    <div className="flex flex-col h-screen dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-gray-800">
        <div>
          <h1 className="text-lg font-semibold text-white">Room: {roomId}</h1>
          <p className="text-xs text-gray-400">Logged in as {currentUser}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full text-white"
        >
          Leave
        </button>
      </header>

      {/* Messages */}
      <main
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
      >
        {messages.map((message, index) => {
          const isOwnMessage = message.sender === currentUser;
          return (
            <div
              key={index}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow 
                ${
                  isOwnMessage
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-700 text-white rounded-bl-none"
                }`}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-semibold text-blue-300 mb-1">
                    {message.sender}
                  </p>
                )}
                <p>{message.content}</p>
                <span className="absolute bottom-0 right-1 text-[10px] text-gray-300">
                  {timeAgo(message.timeStamp)}
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Input box */}
      <div className="px-4 py-3 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-700 text-gray-300">
            <MdAttachFile size={20} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            type="text"
            placeholder="Message"
            className="flex-1 px-4 py-2 rounded-full bg-gray-700 text-white focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <MdSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
