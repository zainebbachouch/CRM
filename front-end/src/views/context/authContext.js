import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';


const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log(currentUser);
  }, [currentUser]);

  const handleLogin = async (formData) => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", formData, {
        //withCredentials: true, // Include credentials (cookies) in the request
      });
      console.log('Response:', response);
      console.log('User data:', response.data.user);

      setCurrentUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);//value role champ role

      console.log(response.data)

      document.cookie = "cookie:" + response.data.token;

    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /*
   const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/login", formData);
            navigate("/")
            console.log("Response from server:", response.data);
            // Faites quelque chose avec la réponse, comme rediriger l'utilisateur
        } catch (err) {
            console.error("Error object:", err);
            // Gérez les erreurs en cas de problème avec la requête
        }
    };*/

  /* const logout = () => {
     setCurrentUser(null);
     localStorage.removeItem('token');
   };*/

  return (
    <AuthContext.Provider value={{ currentUser, handleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
