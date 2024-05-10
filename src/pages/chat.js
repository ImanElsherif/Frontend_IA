import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you use React Router for navigation
import axios from 'axios';
import "./chat.css";

const ChatPage = () => {
  const { proposalId, receiverId } = useParams(); // Assuming proposalId and receiverId are passed as route parameters

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:5024/api/chat/${proposalId}/messages`);
      const messages = response.data;
  
      // Fetch sender names based on their roles
      const senderIds = messages.map(message => message.senderId);
      const uniqueSenderIds = [...new Set(senderIds)]; // Get unique sender IDs
      const senderNamesPromises = uniqueSenderIds.map(async id => {
        let role = ''; // Assuming role is stored as a number in your case
        let name = '';
  
        // Fetch the role of the sender (assuming it's stored as a number)
        try {
          const roleResponse = await axios.get(`http://localhost:5024/api/user/${id}`);
          role = roleResponse.data.userTypeId; // Assuming the role is returned as 'role'
        } catch (error) {
          console.error(`Failed to fetch role for sender ID ${id}:`, error);
        }
  
        // Fetch the name based on the role
        try {
          if (role === 2) { // Assuming role 1 is for employers
            const employerResponse = await axios.get(`http://localhost:5024/api/user/employer/${id}`);
            name = employerResponse.data.companyName;
            console.log("emp",name)
            console.log("emp",role)
          } else if (role === 3) { // Assuming role 2 is for job seekers
            const seekerResponse = await axios.get(`http://localhost:5024/api/user/seeker/${id}`);
            name = seekerResponse.data.name;
            console.log("seek",name)
            console.log("seek",role)
          }
        } catch (error) {
          console.error(`Failed to fetch name for sender ID ${id} and role ${role}:`, error);
        }
  
        return { id, name };
      });
  
      const senderNames = await Promise.all(senderNamesPromises);
     
  
      // Map sender IDs to sender names in messages
      messages.forEach(message => {
        const sender = senderNames.find(sender => sender.id === message.senderId);
        if (sender) {
          message.senderName = sender.name;
        }
      });

   console.log("test",senderNames)

      setMessages(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };
  
  useEffect(() => {
    fetchMessages();
  }, [proposalId]); // Re-fetch messages when proposalId changes

  const sendMessage = async () => {
    try {
      const data = {
        senderId: localStorage.getItem('userId'),
        receiverId: receiverId,
        message: newMessage
      };
  
      console.log('Sending message:', data); // Log the data being sent
  
      await axios.post(`http://localhost:5024/api/chat/${proposalId}/message`, data);
  
      setNewMessage('');
      fetchMessages(); // Refresh messages after sending a new message
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return (
    <div className="container">
      <h1>Chat</h1>
      <div className="chat-container">
      {messages.map((message, index) => (
  <div key={index} className={`message ${message.senderId === parseInt(localStorage.getItem('userId')) ? 'sent' : 'received'}`}>
    <div className="message-sender">{message.senderId === parseInt(localStorage.getItem('userId')) ? 'You' : message.senderName}</div>
    <div className="message-content">{message.message}</div>
  </div>
))}


      </div>
      <div className="input-group mt-3">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="btn btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
