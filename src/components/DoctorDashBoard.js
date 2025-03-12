import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar_Logout from './NavBar_Logout';

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You are not logged in.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/doctor/patients', {
          headers: { Authorization: token },
        });
        setPatients(response.data.patients);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to fetch patients');
      }
    };

    fetchPatients();
  }, []);

  const handleViewFiles = async (patientId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You are not logged in.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/doctor/patient-files/${patientId}`, {
        headers: { Authorization: token },
      });
      setFiles(response.data.files);
      setSelectedPatient(patientId);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to fetch files');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-800 text-white font-mono">
      <NavBar_Logout />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Doctor Dashboard</h2>
        {patients.length > 0 ? (
          <ul className="space-y-4">
            {patients.map((patient) => (
              <li key={patient._id} className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <p className="text-xl font-semibold">Username: {patient.username}</p>
                <p className="text-lg">Email: {patient.email}</p>
                <button
                  onClick={() => handleViewFiles(patient._id)}
                  className="mt-4 py-2 px-4 bg-teal-500 text-white font-bold rounded-lg cursor-pointer transition-transform transition-colors duration-300 ease-in hover:bg-teal-600 active:bg-teal-700"
                >
                  View Files
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-lg">{message}</p>
        )}
        {selectedPatient && files.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Files for Patient: {selectedPatient}</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  <a
                    href={`http://localhost:5000/uploads/patients/${selectedPatient}/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:underline"
                  >
                    {file}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;