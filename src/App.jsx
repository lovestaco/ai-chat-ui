import { useState, useEffect } from "react";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatSessionId] = useState(Math.floor(Math.random() * 1000));
  const customerId = "beae239c-a2cc-45f2-a4a3-25d181f32363";
  const apiUrl = "https://lioncharge.app.n8n.cloud/webhook/ai-chat-model";
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      chat: input,
      customer_id: customerId,
      chat_session_id: chatSessionId,
    };

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userMessage),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // Handle different response types
      if (data.type === "city") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.value },
          {
            sender: "bot",
            text: data.payload
              .map((station) => station.station_name)
              .join(", "),
          },
        ]);
      } else if (data.type === "station") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.value },
          { sender: "bot", text: data.payload[0].available_points.join(", ") },
        ]);
      } else if (data.type === "charging_point") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.value },
          {
            sender: "bot",
            text: data.payload
              .map((point) => `Connector ID: ${point.connector_id}`)
              .join(", "),
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: data.value }]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between p-4">
      <div className="overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-300 text-black self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded-lg p-2 flex-grow"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="bg-blue-600 text-white p-2 rounded-lg"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
