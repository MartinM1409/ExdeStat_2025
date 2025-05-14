import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Department } from "@shared/schema";
import DepartmentIcon, { DepartmentIconName } from "@/lib/department-icons";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SidebarProps {
  closeSidebar?: () => void;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  
  // Fetch departments data
  const { data: departments, isLoading, error } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Navigate to department page and close sidebar on mobile
  const navigateToDepartment = (slug: string) => {
    navigate(`/department/${slug}`);
    if (closeSidebar) {
      closeSidebar();
    }
  };

  // Check if current location is active department
  const isActive = (slug: string) => {
    return location === `/department/${slug}`;
  };

  return (
    <div className="h-full bg-white shadow-md flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-primary font-heading">Departments</h2>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {isLoading ? (
            // Show loading placeholders
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <div 
                  key={index} 
                  className="h-10 bg-gray-200 rounded-md animate-pulse my-2"
                />
              ))}
            </>
          ) : error ? (
            // Show error message
            <div className="p-2 text-destructive">
              Failed to load departments
            </div>
          ) : (
            // Render departments
            <>
              {departments?.map((department: Department) => (
                <button
                  key={department.id}
                  className={cn(
                    "w-full flex items-center p-2 rounded-md text-gray-700 hover:bg-primary/10 hover:text-primary",
                    isActive(department.slug) && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => navigateToDepartment(department.slug)}
                >
                  <DepartmentIcon 
                    name={department.icon as DepartmentIconName} 
                    className="w-5 h-5 mr-3" 
                  />
                  <span className="text-left">{department.name}</span>
                </button>
              ))}
            </>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
