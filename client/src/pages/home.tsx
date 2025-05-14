import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Department } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import DepartmentIcon, { DepartmentIconName } from "@/lib/department-icons";
import { getDepartmentColor } from "@/lib/department-colors";

export default function Home() {
  const [, navigate] = useLocation();
  
  const { data: departments, isLoading, error } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Navigate to first department if available
  useEffect(() => {
    if (departments && departments.length > 0) {
      // Wait a bit for the UI to render before navigating
      const timer = setTimeout(() => {
        navigate(`/department/${departments[0].slug}`);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [departments, navigate]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary font-heading">
          Examen de Stat 2025
        </h1>
        <p className="text-gray-600 mt-2">
          Bine ați venit la platforma pentru Examenul de Stat 2025! Alegeți o secțiune din bara laterală sau de mai jos:
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-32 animate-pulse">
              <CardContent className="p-0 h-full bg-gray-200 rounded-md" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 bg-red-50 border-red-200">
          <p className="text-red-600">A apărut o eroare la încărcarea secțiunilor. Vă rugăm reîncercați.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments?.map((department) => (
            <Card 
              key={department.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/department/${department.slug}`)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: getDepartmentColor(department.slug) + "20", color: getDepartmentColor(department.slug) }}
                >
                  <DepartmentIcon 
                    name={department.icon as DepartmentIconName} 
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{department.name}</h2>
                  <p className="text-sm text-gray-500">Vezi materiale și teste</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
