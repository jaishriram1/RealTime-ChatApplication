import { useState } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("Joined..");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error in joining room");
        }
        console.log(error);
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);
        toast.success("Room Created Successfully !!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.log(error);
        if (error.status === 400) {
          toast.error("Room already exists !!");
        } else {
          toast.error("Error in creating room");
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#17212B]">
      <div className="p-8 w-full max-w-md shadow-lg bg-[#1F2C3B] border border-gray-700 flex flex-col gap-6">
        
        <div className="text-center text-gray-300 mb-4 size-lg font-semibold">
          Welcome to the Chat App! Please enter your name and room ID to join or create a chat room.
        </div>
        {/* Input: Username */}
        <div>
          <label
            htmlFor="name"
            className="block font-medium mb-1 text-gray-300"
          >
            Your Name
          </label>
          <input
            onChange={handleFormInputChange}
            value={detail.userName}
            type="text"
            id="name"
            name="userName"
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Input: Room ID */}
        <div>
          <label
            htmlFor="roomId"
            className="block font-medium mb-1 text-gray-300"
          >
            Room ID
          </label>
          <input
            name="roomId"
            onChange={handleFormInputChange}
            value={detail.roomId}
            type="text"
            id="roomId"
            placeholder="Enter room ID"
            className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={joinChat}
            className="w-1/2 py-3 font-medium text-white bg-blue-500 hover:bg-blue-600 transition"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="w-1/2 py-3 font-medium text-white bg-green-500 hover:bg-green-600 transition"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;