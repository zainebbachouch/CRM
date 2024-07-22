import React, { useState, useEffect, useMemo } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from "../../components/sidenav/TopNav";
import '../../style/viewsStyle/MessengerPage.css';
import axios from 'axios';
import io from "socket.io-client";
import { format, isToday, isYesterday, isThisWeek, isValid } from 'date-fns';
import { Link } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";




function MessengerPage() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const socket = io.connect("http://localhost:3300");


  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]); 


  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,

      },
    };
  }, [token]);



  const [formData, setFormData] = useState({
    message: '',
    rolesender: role,
    receiver_id: null,
    rolereciever: null,
    sender_id: userId,
  });



 


  useEffect(() => {
    fetchConversations();
    fetchAllUsers(); 
  }, []);


  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);



  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log('New message received:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);


  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/allUsers', config);
      setAllUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/conversations', {
        ...config,
        params: {
          userId,
        },
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };


  const fetchMessages = async (conversationId) => {

    try {

      const response = await axios.get('http://127.0.0.1:5000/api/listMessages', {
        ...config,
        params: {
          sender_id: userId,
          receiver_id: conversationId
        },
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }

  };


/*  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setFormData({
      ...formData,
      receiver_id: conversation.id,
      rolereciever: conversation.role,
    });
    fetchMessages(conversation.id);
  };*/

  const handleConversationClick = (data) => {
    if (data.hasOwnProperty('id')) {
      setSelectedConversation(data);
      setFormData({
        ...formData,
        receiver_id: data.id,
        rolereciever: data.role,
      });
      fetchMessages(data.id);
    } else {
      const newConversation = {
        id: data.userId, 
        role: data.role,
        name: `${data.name} ${data.prenom}`,
        photo: data.photo,
      };
      console.log(' newConversation  newConversation ', newConversation )
      setSelectedConversation(newConversation);
      setFormData({
        ...formData,
        receiver_id: null,
        rolereciever: data.role,
      });
      setMessages([]); 
    }
  };
  


  const handleSendMessage = () => {
    if (!selectedConversation || !selectedConversation.id) {
      console.error('No conversation selected');
      return;
    }
  
    if (newMessage.trim() === '') return;
  
    const message = {
      sender_id: userId,
      rolesender: role,
      receiver_id: selectedConversation.id,
      rolereciever: selectedConversation.role,
      message: newMessage,
    };
  
    socket.emit('sendMessage', message);
    setNewMessage('');
  };
  



  const uniqueConversations = conversations.filter((conversation, index) => (
    conversations.findIndex((c) => 
      c.id === conversation.id && 
      c.name === conversation.name && 
      c.prenom === conversation.prenom
    ) === index
  ));
  

  const formatTimestamp = (timestamp) => {
    if (!isValid(timestamp)) return 'Invalid date';

    if (isToday(timestamp)) {
      return `Today, ${format(timestamp, 'HH:mm')}`;
    } else if (isYesterday(timestamp)) {
      return `Yesterday, ${format(timestamp, 'HH:mm')}`;
    } else if (isThisWeek(timestamp)) {
      return format(timestamp, 'EEEE, HH:mm'); 
    } else {
      return format(timestamp, 'dd MMM yyyy, HH:mm'); 
    }
  };


  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column">
        <TopBar />
        <div className="container-fluid p-2 d-flex">
          <div className="sidebar">
            <div className="srch_bar">
              <div className="stylish-input-group">
                <input type="text" className="search-bar" placeholder="Search" />
                <span className="input-group-addon">
                  <button type="button"> <i className="fa fa-search" aria-hidden="true"></i> </button>
                </span>
              </div>
  </div>


  <div className='uniqueConversations'>
  <ul>
  <GiHamburgerMenu />
  {uniqueConversations.map((conversation, index) => (
    <li key={index} onClick={() => handleConversationClick(conversation)}>
      <img src={conversation.photo} />
      <span> {`${conversation.name} ${conversation.prenom}`}  </span>
      <span>{conversation.role}</span>
      {conversation.message && (
        <span>{conversation.message.slice(0, 5)}</span>
      )}
    </li>
  ))}
</ul>
  </div>


<div className="all-users">
  <h3>All Users</h3>
  <ul>
    {allUsers
  .filter((user) => !conversations.find((conversation) => conversation.id === user.userId))
  .map((user, index) => (
    <li key={index} onClick={() => handleConversationClick(user)}>
      <img src={user.photo} alt={`${user.name} ${user.prenom}`} />
      <span>{user.role}</span>
      
    </li>
))}

  </ul>
</div>



            </div>


           

            {selectedConversation && (
            <div className="conversation">
              <div className="conversation-header">
                <span>{selectedConversation.rolereciever}</span>
              </div>
              <div className="conversation-body">
                {messages.map((message, index) => {
                  const timestamp = new Date(message.timestamp);
                  return (
                    <div key={index} className={`message ${message.sender_id == userId ? 'message-right' : 'message-left'}`}>
                      <span>{message.message}</span>
                      {}
                      <span className="messenger-timestamp">
                        {formatTimestamp(timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="conversation-footer">
                <input
                  type="text"
                  name="message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here"
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>

  );

}


export default MessengerPage;
