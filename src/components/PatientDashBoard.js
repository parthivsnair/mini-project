import React, { useState } from 'react';
import axios from 'axios';
import NavBar_Logout from './NavBar_Logout';

function PatientDashboard() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [doctorUsername, setDoctorUsername] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You are not logged in.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/patient/upload', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'File upload failed');
    }
  };

  const handleGrantPermission = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You are not logged in.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/patient/grant-permission', { doctorUsername }, {
        headers: { Authorization: token },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to grant permission');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-800 text-white font-mono">
      <NavBar_Logout />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Patient Dashboard</h2>
        <form onSubmit={handleUpload} className="bg-gray-900 p-6 rounded-lg shadow-lg space-y-4">
          <div>
            <label className="block font-bold mb-2" htmlFor="file">
              Upload File
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-teal-500 text-white font-bold text-lg rounded-lg cursor-pointer transition-transform transition-colors duration-300 ease-in hover:bg-teal-600 active:bg-teal-700"
          >
            Upload File
          </button>
        </form>
        <form onSubmit={handleGrantPermission} className="bg-gray-900 p-6 rounded-lg shadow-lg space-y-4 mt-6">
          <div>
            <label className="block font-bold mb-2" htmlFor="doctorUsername">
              Grant Permission to Doctor
            </label>
            <input
              type="text"
              id="doctorUsername"
              value={doctorUsername}
              onChange={(e) => setDoctorUsername(e.target.value)}
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-teal-500 text-white font-bold text-lg rounded-lg cursor-pointer transition-transform transition-colors duration-300 ease-in hover:bg-teal-600 active:bg-teal-700"
          >
            Grant Permission
          </button>
        </form>
        {message && <p className="text-center text-lg mt-4">{message}</p>}
      </div>
    </div>
  );
}

export default PatientDashboard;