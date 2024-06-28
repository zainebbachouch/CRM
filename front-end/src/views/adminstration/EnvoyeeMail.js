import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from "socket.io-client"
import '../../style/viewsStyle/messenger.css';

import { format, isValid } from 'date-fns'; 

function EnvoyeeMailEmploye() {
  const { id, email } = useParams();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const refreshToken = localStorage.getItem('refreshToken');
  const [Messages, setMessages] = useState([]);
  const socket = io.connect("http://localhost:3300");

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Refresh-Token': `Bearer ${refreshToken}`,
      },
    };
  }, [token, refreshToken]);

  const [formData, setFormData] = useState({
    message: '', 
    rolesender: role,
    rolereciever: 'employe',
    receiver_id: id,
    sender_id: userId
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/listMessages', {
        ...config,
        params: {
          sender_id: userId,
          receiver_id: id
        },
      });
      setMessages(response.data.messages);
      console.log('Messages fetched:', response.data.messages);
      // Vérifier que l'élément chat existe avant d'essayer de faire défiler
    const chatElement = document.getElementsByClassName("messenger-body")[0];
    if (chatElement) {
      chatElement.scrollTop = chatElement.scrollHeight;
    } else {
      console.warn('Chat element not found');
    }
    } catch (error) {
      console.error('Error fetching Messages:', error);
    }
  };

  const sendMessage = () => {
    console.log('Sending message:', formData);
    socket.emit("sendMessage", formData);
    setFormData({ ...formData, message: '' }); 
  };


useEffect(()=>{
  fetchMessages();
}, [id, userId])



  useEffect(() => {
    socket.on("connect", () => {
      console.log("client connected");
    });
    socket.on("receiveMessage", (message) => {
      //console.log("New message received:", message); 

      fetchMessages()
      
    });

  }, [id, userId]);

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="messenger-container">
      <div className="messenger-header">
        <div className="messenger-title">to {email}</div>
      </div>
      <div className="messenger-body">
        <div className="messenger-chat">
          {Messages && Messages.length > 0 && Messages.map((message, index) => {
            const timestamp = new Date(message.timestamp);
       
            return (
              <div key={index} className={`messenger-message ${(message.sender_id == userId && message.rolesender==role) ? 'message-left' : 'message-right'}`}>
                {message && message.message && (
                  <div className="messenger-message-content">{message.message}</div>
                )}
                <span className="messenger-timestamp">
                  {isValid(timestamp) ? format(timestamp, 'HH:mm') : 'Invalid date'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="messenger-footer">
        <textarea
          name="message"
          value={formData.message} 
          onChange={handleChange}
          placeholder="Type your message here"
          className="messenger-input"
        ></textarea>
        <button type="button" onClick={(event) => { event.preventDefault(); sendMessage(); }} className="messenger-send-button">
          Send
        </button>
      </div>
    </div>
  );
}


function EnvoyeeMailClient() {
  const { id, email } = useParams();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const refreshToken = localStorage.getItem('refreshToken');
  const [Messages, setMessages] = useState([]);
  const socket = io.connect("http://localhost:3300");

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Refresh-Token': `Bearer ${refreshToken}`,
      },
    };
  }, [token, refreshToken]);

  const [formData, setFormData] = useState({
    message: '',
    rolesender: role,
    rolereciever: 'client',
    receiver_id: id,
    sender_id: userId
  });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/listMessages', {
        ...config,
        params: {
          rolesender: role,
          sender_id: userId,
        },
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching Messages:', error);
    }
  };

  const sendMessage = () => {
    console.log('Sending message:', formData);
    socket.emit("sendMessage", formData);
    setFormData({ ...formData, message: '' });
  };


  useEffect(() => {
    socket.on("connect", () => {
      console.log("client connected");
    });
    socket.on("receiveMessage", (message) => {
      //console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  
  }, [id]);

  return (
    <div className="col-md-9 messenger-container">
      <div className="messenger-header">
        <div className="messenger-title"> to {email}</div>
      </div>
      <div className="messenger-body">
        <div className="messenger-chat">
          {Messages && Messages.length > 0 && Messages.map((message, index) => (
            <div key={index} className={`messenger-message ${message.rolesender === role ? 'messenger-message-right' : 'messenger-message-left'}`}>
              {message && message.message && (
                <div className="messenger-message-content">{message.message}</div>
              )}
            </div>
          ))}
        </div>
      </div>



      <div className="messenger-footer">
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Type your message..."
          className="messenger-input"
        ></textarea>

        <button type="button" onClick={(event) => { event.preventDefault(); sendMessage(); }} className="messenger-send-button">
          Send
        </button>
      </div>
    </div>
  );
}

export { EnvoyeeMailEmploye, EnvoyeeMailClient };
