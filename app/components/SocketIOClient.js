"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function SocketIOClient() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [room, setRoom] = useState("general");
  const [roomInput, setRoomInput] = useState("general");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:8080", {
      reconnection: true,
    });
    setSocket(newSocket);

    newSocket.on("requestUsername", () => {
      console.log("Requesting username from server...");
    });

    newSocket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("userList", (userList) => {
      setUsers(userList);
    });

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSetUsername = () => {
    if (socket && usernameInput.trim() && roomInput.trim()) {
      setUsername(usernameInput);
      setRoom(roomInput);
      setIsUsernameSet(true);
      socket.emit("setUsername", { username: usernameInput, room: roomInput });
    }
  };

  const sendMessage = () => {
    if (socket && input && isUsernameSet) {
      socket.emit("sendMessage", { message: input, room });
      setInput("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat រ៉ោករ៉ាក</h1>

      {!isUsernameSet ? (
        <div className="mb-4">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="border p-2 mr-2"
            placeholder="Enter your username..."
          />
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            className="border p-2 mr-2"
            placeholder="Enter room name..."
          />
          <button
            onClick={handleSetUsername}
            className="bg-green-500 text-white p-2 rounded"
          >
            Join Chat
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Room: {room}</h2>
            <h2 className="text-lg font-semibold">Online Users:</h2>
            <ul className="list-disc pl-5">
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-2 mr-2"
              placeholder="Type a message..."
              disabled={!isUsernameSet}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded"
              disabled={!isUsernameSet}
            >
              Send
            </button>
          </div>

          <div className="border p-4 h-64 overflow-y-auto">
            <h2 className="text-lg font-semibold">Messages:</h2>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
