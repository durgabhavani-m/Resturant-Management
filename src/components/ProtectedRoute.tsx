import {Navigate, Outlet} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Permission } from "../types/permission";

interface ProtectedRouteProps {
    permission ?: Permission;
}

const ProtectedRoute = ({
    permission,
}:ProtectedRouteProps) => {
    const {user, hasPermission} = useAuth();

    if(!user) {
        return <Navigate to="/login" replace />;
    }


    if(permission && !hasPermission(permission)){
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;