import {createContext, useContext, useEffect, useState, type ReactNode} from "react";
import type {User} from "../types/auth";

interface AuthContextType{
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "resturant_user";

export const AuthProvider = ({ children,}: {children: ReactNode;}) => {
    const [user, setUser] = useState<User | null>(()=>{
        const storedUser = localStorage.getItem(STORAGE_KEY);

        if(storedUser) {
            return JSON.parse(storedUser);
        }
        return null;
    });

    useEffect(()=>{
        if(user) {
            localStorage.removeItem(STORAGE_KEY);
        }
    },[user]);

    const login = (user:User) => {
        setUser(user);
    };

    const logout = () => {
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{user,login,logout,}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if(!context){
        throw new Error(
            "useAuth must be used inside AuthProvider"
        )
    }
    return context;
};