import React, { useEffect, useState } from "react";
import NavBar_Logout from "./NavBar_Logout";

function ViewPatientRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/records")
      .then((response) => response.json())
      .then((data) => setRecords(data))
      .catch((error) => console.error("Error fetching records:", error));
  }, []);

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-gradient-to-b from-black to-gray-800 text-white p-10 font-mono">
        <h2 className="text-center text-2xl">Patient Records</h2>
        {records.length > 0 ? (
          <ul>
            {records.map((record) => (
              <li key={record._id}>
                <p>Patient Name: {record.patientName}</p>
                <p>Record Details: {record.recordDetails}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No records found.</p>
        )}
      </div>
    </div>
  );
}

export default ViewPatientRecords;
