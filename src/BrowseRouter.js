import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import PatientDashboard from "./components/PatientDashBoard";
import DoctorDashboard from "./components/DoctorDashBoard";
import Login from "./components/login";
import Register from "./components/register";
import Footer from "./components/Footer";
import LandingPage_1 from "./components/LandingPage_1";
import ViewPatientRecords from "./components/ViewPatientRecords";
import ViewPatientList from "./components/ViewPatientList";

import ViewDoctorProfile from "./components/ViewDoctorProfile";

import AboutUs from "./components/AboutPage"; 



const BrowseRouter = () => {
   return (
    <BrowserRouter>

      <Routes>
      <Route path="/AboutPage" element={<AboutUs></AboutUs>}></Route>

        <Route path="/" element={<LandingPage_1></LandingPage_1>}></Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/profile" element={<Profile />} /> */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        
    
        
        
        
        
        <Route
          path="/doctor/:hhNumber/viewdoctorprofile"
          element={<ViewDoctorProfile />}
        ></Route>
        
        <Route
          path="/patient/:hhNumber/viewrecords"
          element={<ViewPatientRecords />}
        ></Route>
        
        
       
        <Route
          path="/doctor/:hhNumber/patientlist"
          element={<ViewPatientList />}
        ></Route>
       
       
      </Routes>
      <Footer></Footer>
    </BrowserRouter>
  );
};

export default BrowseRouter;
