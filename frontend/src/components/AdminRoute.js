import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {jwtDecode} from 'jwt-decode';

const AdminRoute = () => {
    const { user } = useContext(AuthContext);

    if (!user || !user.token) {
        // Not logged in, redirect to login
        return <Navigate to="/login" />;
    }

    try {
        // Decode the token to check the isAdmin flag
        const decodedToken = jwtDecode(user.token);
        
        if (decodedToken.isAdmin) {
            // User is an admin, show the protected content
            return <Outlet />;
        } else {
            // Logged in, but not an admin, redirect to tournaments
            return <Navigate to="/tournaments" />;
        }
    } catch (error) {
        console.error("Invalid token:", error);
        // Token is bad, force logout/login
        return <Navigate to="/login" />;
    }
};

export default AdminRoute;