import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar'; // Go up one level to get Navbar.js


const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* Outlet renders the child route's element */}
        <Outlet /> 
      </main>
    </>
  );
};

export default MainLayout;