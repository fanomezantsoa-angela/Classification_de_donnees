import React, { createContext, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import io from "socket.io-client";
import { MarkAsSeen, GetHistoriques } from "../Api/HistoriqueApi";
import "react-toastify/dist/ReactToastify.css";
const socket = io("http://127.0.0.1:5000");
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const histos = await GetHistoriques();
      if (histos.response.status === 200) {
        setMessages(histos.response.data);
        const unseenCount = histos.response.data.filter(
          (msg) => !msg.is_seen
        ).length;
        setUnseenCount(unseenCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  fetchNotifications();
}, []);
  useEffect(() => {
    console.log("Setting up WebSocket connection...");

    socket.on("new_histo", (data) => {
      console.log("New notification received:", data);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, data];
        console.log("Updated Messages:", updatedMessages);
        return updatedMessages;
      });
      setUnseenCount((prevCount) => {
        const updatedCount = prevCount + 1;
        console.log("Updated Unseen Count:", updatedCount);
        return updatedCount;
      });
     
      // Show toast notification
      toast.info(New notification: ${data.nom_user}   ${data.details}, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });

    return () => {
      socket.off("new_histo");
    };
    
  }, []);



  // Mark notifications as seen
    const markAllAsSeen = async() => {
    await MarkAsSeen();
    setUnseenCount(0);
    setMessages((prevMessages) =>
      prevMessages.map((msg) => ({ ...msg, is_seen: true }))
    );
  };

  return (
    <NotificationContext.Provider
      value={{ messages, unseenCount, markAllAsSeen, setMessages, setUnseenCount }}
    >
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};