import { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};

export const RoleProvider = ({ children }) => {
    const [role, setRole] = useState(() => {
        // Get role from localStorage on initial load
        return localStorage.getItem('userRole') || null;
    });

    const [userEmail, setUserEmail] = useState(() => {
        // Get email from localStorage
        return localStorage.getItem('userEmail') || '';
    });

    const setUserRole = (newRole) => {
        setRole(newRole);
        localStorage.setItem('userRole', newRole);
    };

    const setEmail = (email) => {
        setUserEmail(email);
        localStorage.setItem('userEmail', email);
    };

    const clearRole = () => {
        setRole(null);
        setUserEmail('');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
    };

    const value = {
        role,
        userEmail,
        setUserRole,
        setEmail,
        clearRole,
        isHR: role === 'hr',
        isCandidate: role === 'candidate'
    };

    return (
        <RoleContext.Provider value={value}>
            {children}
        </RoleContext.Provider>
    );
};
