import { Resource, Department } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDepartmentCardClass } from "@/lib/department-colors";

interface ResourceCardProps {
  resource: Resource;
  department: Department;
}

export default function ResourceCard({ resource, department }: ResourceCardProps) {
  const cardClass = getDepartmentCardClass(department.slug);
  
  const handleClick = () => {
    // Open the URL in a new tab
    window.open(resource.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card 
      className="block overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className={`p-4 text-white ${cardClass}`}>
        <h3 className="text-lg font-semibold truncate">{resource.title}</h3>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-gray-600 text-sm">
          {`Materiale pentru secțiunea ${department.name}`}
        </p>
      </CardContent>
    </Card>
  );
}
