import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../lib/auth.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  FolderKanban, 
  FilePlus,
  User,
  ShieldAlert
} from "lucide-react";

export default function AdminIndex() {
  const { isAdmin, isSemiAdmin } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not admin or semi-admin
  useEffect(() => {
    if (!isAdmin && !isSemiAdmin) {
      navigate("/");
    }
  }, [isAdmin, isSemiAdmin, navigate]);

  // Admin panels: full access for admins, restricted for semi-admins
  const adminPanels = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: <Users className="h-8 w-8 text-primary" />,
      path: "/admin/users",
      adminOnly: true
    },
    {
      title: "Department Management",
      description: "Create, edit, and organize medical departments",
      icon: <FolderKanban className="h-8 w-8 text-primary" />,
      path: "/admin/departments",
      adminOnly: true
    },
    {
      title: "Resource Management",
      description: "Manage links, PDFs, and learning materials",
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      path: "/admin/resources",
      adminOnly: false
    }
  ];

  // Filter panels based on user role
  const accessiblePanels = adminPanels.filter(panel => isAdmin || !panel.adminOnly);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">
            Admin Panel
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin 
              ? "Full administrator access to all system functions" 
              : "Semi-administrator access to content management"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-md">
          {isAdmin ? (
            <>
              <ShieldAlert className="h-5 w-5" />
              <span className="font-medium">Administrator</span>
            </>
          ) : (
            <>
              <User className="h-5 w-5" />
              <span className="font-medium">Semi-Administrator</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessiblePanels.map((panel, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="flex items-center gap-3">
                {panel.icon}
                <span>{panel.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-600 mb-4">{panel.description}</p>
              <Button 
                onClick={() => navigate(panel.path)}
                className="w-full"
              >
                Access
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
