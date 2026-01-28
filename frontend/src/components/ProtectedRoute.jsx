import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    // For demo purposes, if firebase.js isn't configured, we might want to allow access or mock login.
    // But strictly, we check currentUser.
    // If you want to bypass auth for dev until config is ready:
    // return children; 

    // Uncomment this for real protection:
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
