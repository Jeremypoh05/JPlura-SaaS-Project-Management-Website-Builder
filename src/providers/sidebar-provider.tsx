"use client"; // Mark this as a client component since it uses React hooks

import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of our context data
interface SidebarContextType {
    isCollapsed: boolean;              // Tracks if sidebar is collapsed
    setIsCollapsed: (collapsed: boolean) => void;  // Function to update collapsed state
}

// Create a context with default values
// These values are used when a component tries to use the context without a provider
export const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: false,               // Default to expanded state
    setIsCollapsed: () => { },         // Empty function as placeholder
});

// The Provider component that will manage the state
export const SidebarProvider = ({
    children   // Accept any valid React nodes as children
}: {
    children: ReactNode
}) => {
    // Create state to track sidebar collapsed status
    // useState(false) means sidebar starts expanded
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    // Wrap children with context provider, passing current state and setter
    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
};

// Custom hook to easily access sidebar context
// This saves consumers from having to import useContext and SidebarContext separately
export const useSidebarContext = () => useContext(SidebarContext);