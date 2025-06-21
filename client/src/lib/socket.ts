import { io } from "socket.io-client";

// ❌ remove transports: ['websocket']
// ✅ allow fallback to polling (default behavior)
const socket = io("http://localhost:5000", {
  autoConnect: false,
  withCredentials: true, // ✅ important for CORS to match server
});
socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
});


export default socket;
