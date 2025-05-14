import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Department, Resource } from "@shared/schema";
import ResourceCard from "@/components/resource-card";
import PdfList from "@/components/pdf-list";
import DepartmentIcon, { DepartmentIconName } from "@/lib/department-icons";
import { getDepartmentColor } from "@/lib/department-colors";

export default function DepartmentPage() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch department data
  const { data: department, isLoading: departmentLoading } = useQuery<Department>({
    queryKey: [`/api/departments/${slug}`],
  });

  // Fetch resources for department
  const { data: resources, isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources", slug],
    queryFn: async () => {
      const res = await fetch(`/api/resources?department=${slug}`);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return res.json();
    },
    enabled: !!slug,
  });

  const isLoading = departmentLoading || resourcesLoading;

  return (
    <div>
      {/* Department Title and Welcome Message */}
      <div className="mb-8 flex items-center gap-3">
        {department && (
          <div 
            className="p-2 rounded-md"
            style={{ 
              backgroundColor: getDepartmentColor(department.slug) + "20", 
              color: getDepartmentColor(department.slug) 
            }}
          >
            <DepartmentIcon 
              name={department.icon as DepartmentIconName} 
              className="w-6 h-6" 
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">
            {isLoading ? "Încărcare..." : department?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Bine ați venit la secțiunea de teste pentru Examenul de Stat 2025!
          </p>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading placeholders
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-gray-200 h-32 rounded-lg animate-pulse" />
          ))
        ) : resources && resources.length > 0 ? (
          // Display resources
          resources.map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              department={department!} 
            />
          ))
        ) : (
          // No resources message
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <p className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              Nu există resurse pentru această secțiune. Reveniți mai târziu!
            </p>
          </div>
        )}
      </div>

      {/* PDF Resources Section */}
      <PdfList departmentSlug={slug} />
    </div>
  );
}
