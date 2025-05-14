import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole, UserStatus } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash, PencilLine, AlertTriangle, UserPlus } from "lucide-react";
import UserForm from "@/components/admin/user-form";

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin");
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage users",
        variant: "destructive"
      });
    }
  }, [isAdmin, navigate, toast]);

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted"
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      });
    }
  });

  // Handle edit user
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle delete user
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser.mutate(selectedUser.id);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle>Users</CardTitle>
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
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === UserRole.ADMIN ? "default" : user.role === UserRole.SEMI_ADMIN ? "secondary" : "outline"}>
                        {user.role === UserRole.ADMIN 
                          ? "Admin" 
                          : user.role === UserRole.SEMI_ADMIN 
                            ? "Semi-Admin" 
                            : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === UserStatus.ACTIVE ? "success" : "destructive"}>
                        {user.status === UserStatus.ACTIVE ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(user)}>
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

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <UserForm 
            onSuccess={() => {
              setIsAddDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm 
              user={selectedUser}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/users"] });
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
            <p className="mb-2">Are you sure you want to delete this user?</p>
            <p className="font-medium">{selectedUser?.username}</p>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
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
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
