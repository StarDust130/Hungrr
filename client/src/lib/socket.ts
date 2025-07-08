import { io, Socket } from "socket.io-client";

// Ensure the URL is correct and does not have a trailing slash if not needed.
const URL = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

// Create the socket instance.
// The key options 'autoConnect: false' and 'transports: ["websocket"]' are crucial.
// We will manually connect it inside the component to avoid issues with server-side rendering.
const socket: Socket = io(URL, {
  autoConnect: false, // IMPORTANT: We will connect manually
  transports: ["websocket"], // Use WebSocket transport primarily
});

// Optional: Add a listener here for debugging connection errors globally
socket.on("connect_error", (err) => {
  console.error(`🔴 [Socket Connect Error] Reason: ${err.message}`);
});

export default socket;
