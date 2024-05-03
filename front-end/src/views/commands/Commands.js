import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import CompleteCommand from '../../components/sidenav/completeCommand'; // Correct the import statement

function Commands() {
  console.log('Commands component rendered');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  //console.log('location.search:', location.search);
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('idcommand');

 // console.log('Extracted id:', id);
  const [commandData, setCommandData] = useState(null); // Define commandData state variable

  useEffect(() => {
    const currentCommandeId = localStorage.getItem('currentCommandeId');

    if (id) {
      // Fetch command details using the id from query parameter
     console.log('fetch id uselocation ',id)
      fetchData(id);
    } else if (currentCommandeId) {
      // Fetch command details using the currentCommandeId from local storage
      fetchData(currentCommandeId);
      console.log('localStorage  currentCommandeId',currentCommandeId)
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchData = async (currentCommandeId) => {
    try {
     // console.log('Fetching data for ID:', currentCommandeId);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('http://127.0.0.1:5000/api/completeCommand', { currentCommandeId }, config);
      console.log('Fetched data:', response.data);
      setCommandData(response.data); // Set the command state variable to the fetched data
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : commandData ? (
        <CompleteCommand commandData={commandData} />
      ) : (
        <div>No command details found.</div>
      )}
    </div>
  );
}

export default Commands;