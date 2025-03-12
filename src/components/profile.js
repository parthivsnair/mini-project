import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You are not logged in.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: token },
        });
        setUser(response.data.user);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <h2>Profile</h2>
      {user ? (
        <div>
          <p>Username: {user.username}</p>
          <p>Role: {user.role}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

export default Profile;