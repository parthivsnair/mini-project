import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const cancelOperation = () => {
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token); // Save token to localStorage

      // Redirect based on role
      if (response.data.role === 'doctor') {
        navigate('/doctor-dashboard'); // Redirect to Doctor Dashboard
      } else if (response.data.role === 'patient') {
        navigate('/patient-dashboard'); // Redirect to Patient Dashboard
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-black to-gray-800 min-h-screen flex flex-col justify-center items-center p-4 font-mono text-white">
        <div className="w-full max-w-4xl bg-gray-900 p-20 rounded-lg shadow-lg">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Patient Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block font-bold text-white" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover-bg-gray-800 transition duration-200"
              />
            </div>

            <div className="flex flex-col w-full mb-4">
              <label className="mb-2 font-bold">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 w-full text-white bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-800 transition duration-200"
                required
              />
            </div>

            <div className="space-x-4 text-center mt-6">
              <button
                type="submit"
                className="px-6 py-3 bg-teal-500 text-white font-bold text-lg rounded-lg cursor-pointer transition-transform transition-colors duration-300 ease-in hover:bg-teal-600 active:bg-teal-700"
              >
                Login
              </button>

              <button
                type="button"
                onClick={cancelOperation}
                className="px-6 py-3 bg-teal-500 text-white font-bold text-lg rounded-lg cursor-pointer transition-transform transition-colors duration-300 ease-in hover:bg-teal-600 active:bg-teal-700"
              >
                Close
              </button>
            </div>
          </form>
          {message && <p className="text-red-500 mt-4">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;