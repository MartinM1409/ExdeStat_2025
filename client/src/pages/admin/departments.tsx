import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash, PencilLine, AlertTriangle, FolderPlus } from "lucide-react";
import DepartmentIcon, { DepartmentIconName } from "@/lib/department-icons";
import DepartmentForm from "@/components/admin/department-form";

export default function AdminDepartments() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin");
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage departments",
        variant: "destructive"
      });
    }
  }, [isAdmin, navigate, toast]);

  // Fetch departments
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
    enabled: isAdmin
  });

  // Delete department mutation
  const deleteDepartment = useMutation({
    mutationFn: async (departmentId: number) => {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete department");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({
        title: "Department Deleted",
        description: "The department and all its resources have been successfully deleted"
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete department",
        variant: "destructive"
      });
    }
  });

  // Handle edit department
  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  // Handle delete department
  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteDepartment.mutate(selectedDepartment.id);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">
            Department Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and organize medical departments
          </p>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add New Department
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments?.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.slug}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DepartmentIcon 
                          name={department.icon as DepartmentIconName} 
                          className="h-5 w-5 mr-2"
                          style={{ color: department.color }}
                        />
                        {department.icon}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-5 h-5 rounded-full" 
                          style={{ backgroundColor: department.color }}
                        />
                        <span>{department.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(department)}>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(department)}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <DepartmentForm 
            onSuccess={() => {
              setIsAddDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          {selectedDepartment && (
            <DepartmentForm 
              department={selectedDepartment}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="mb-2">Are you sure you want to delete this department?</p>
            <p className="font-medium">{selectedDepartment?.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              This will also delete all resources and PDFs associated with this department.
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteDepartment.isPending}
            >
              {deleteDepartment.isPending ? "Deleting..." : "Delete Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
