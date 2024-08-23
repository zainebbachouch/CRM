import React, { useState, useEffect, useMemo } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from "../../components/sidenav/TopNav";
import '../../style/viewsStyle/MessengerPage.css';
import axios from 'axios';
import io from "socket.io-client";
import { format, isToday, isYesterday, isThisWeek, isValid } from 'date-fns';
import { Link } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdAddCircle } from "react-icons/io";
import EmojiPicker from 'emoji-picker-react';


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

  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


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
  
  const handleAddFileClick = () => {
    document.getElementById("fileInput").click()
  }
  const handleFileChange = async (e) => {
    console.log(e.target.files[0])
    const { name, type, files } = e.target.files[0];

    const file = e.target.files[0];
    console.log('filemessenger', file);

    const formData1 = new FormData();
    formData1.append('file', file);
    formData1.append('upload_preset', 'xlcnkdgy'); // Nom de l'environnement cloud

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload/', formData1);
      const fileUrl = response.data.secure_url;
      setNewMessage("File " + fileUrl)
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: fileUrl,
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }

  }





  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      fetchConversations();
      fetchAllUsers();
    }
  }, [searchTerm]);


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
      // Handle conversation click
      setSelectedConversation(data);
      setFormData({
        ...formData,
        receiver_id: data.id,
        rolereciever: data.role,
      });
      fetchMessages(data.id);
    } else {
      // Handle user click - Start a new conversation
      const newConversation = {
        id: data.userId, // You can set a temporary ID for new conversations
        role: data.role,
        name: `${data.name} ${data.prenom}`,
        photo: data.photo,
      };
      console.log(' newConversation  newConversation ', newConversation)
      setSelectedConversation(newConversation);
      setFormData({
        ...formData,
        receiver_id: null,
        rolereciever: data.role,
      });
      // You may choose to fetch initial messages for new conversations here
      setMessages([]); // Clear messages for new conversation
    }
  };



  const handleSendMessage = () => {
    if (!selectedConversation || !selectedConversation.id) {
      // Handle case where there is no selected conversation
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




  // Filter out duplicate conversations based on their IDs
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


  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/searchUsers/${searchTerm}`, config);
      const searchResults = response.data.users;

      // Update both conversations and allUsers based on search results
      setConversations(searchResults);
      setAllUsers(searchResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEmojiPickerToggle = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (showEmojiPicker) => {   
    if (showEmojiPicker && showEmojiPicker.emoji) {
      setNewMessage(prevMessage => prevMessage + showEmojiPicker.emoji);
    }
    setShowEmojiPicker(false);
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
                <span className="input-group-addon">
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search for users..."
                    />
                  </form>
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
                      {message.message.indexOf("File ") == 0 ?
                       <span className="isFile" ><a href={message.message.substring(5)} target="_blank" download>
                        {message.message.substring(5)}</a></span>
                        : <span className="">{message.message}</span>}
                      <span className="messenger-timestamp">
                        {formatTimestamp(timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="conversation-footer">
                <IoMdAddCircle onClick={handleAddFileClick} />
                <input
                  type="file"
                  name="file_url"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,.doc,.docx"
                />
                <button type="button" onClick={handleEmojiPickerToggle}>😀</button>
                {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
              
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