import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Resource, Pdf, Department } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { Trash, PencilLine, AlertTriangle, Link, FileUp, Download } from "lucide-react";
import ResourceForm from "@/components/admin/resource-form";
import PdfForm from "@/components/admin/pdf-form";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export default function AdminResources() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("links");
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] = useState(false);
  const [isDeleteResourceDialogOpen, setIsDeleteResourceDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  const [isAddPdfDialogOpen, setIsAddPdfDialogOpen] = useState(false);
  const [isDeletePdfDialogOpen, setIsDeletePdfDialogOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<Pdf | null>(null);

  // Fetch resources
  const { data: resources, isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  // Fetch PDFs
  const { data: pdfs, isLoading: pdfsLoading } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs"],
  });

  // Fetch departments for dropdowns
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Delete resource mutation
  const deleteResource = useMutation({
    mutationFn: async (resourceId: number) => {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete resource");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Resource Deleted",
        description: "The resource has been successfully deleted"
      });
      setIsDeleteResourceDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete resource",
        variant: "destructive"
      });
    }
  });

  // Delete PDF mutation
  const deletePdf = useMutation({
    mutationFn: async (pdfId: number) => {
      const response = await fetch(`/api/pdfs/${pdfId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete PDF");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs"] });
      toast({
        title: "PDF Deleted",
        description: "The PDF file has been successfully deleted"
      });
      setIsDeletePdfDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete PDF",
        variant: "destructive"
      });
    }
  });

  // Handle edit resource
  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsEditResourceDialogOpen(true);
  };

  // Handle delete resource
  const handleDeleteResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDeleteResourceDialogOpen(true);
  };

  // Handle delete PDF
  const handleDeletePdf = (pdf: Pdf) => {
    setSelectedPdf(pdf);
    setIsDeletePdfDialogOpen(true);
  };

  // Handle download PDF
  const handleDownloadPdf = (pdfId: number) => {
    window.open(`/api/pdfs/${pdfId}/download`, "_blank");
  };

  // Get department name by id
  const getDepartmentName = (departmentId: number): string => {
    const department = departments?.find(d => d.id === departmentId);
    return department?.name || "Unknown";
  };

  // Confirm delete resource
  const confirmDeleteResource = () => {
    if (selectedResource) {
      deleteResource.mutate(selectedResource.id);
    }
  };

  // Confirm delete PDF
  const confirmDeletePdf = () => {
    if (selectedPdf) {
      deletePdf.mutate(selectedPdf.id);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">
            Resource Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage links, PDFs, and learning materials
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsAddResourceDialogOpen(true)}>
            <Link className="mr-2 h-4 w-4" />
            Add Link Resource
          </Button>
          <Button onClick={() => setIsAddPdfDialogOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="links" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="links">Link Resources</TabsTrigger>
          <TabsTrigger value="pdfs">PDF Resources</TabsTrigger>
        </TabsList>
      
        <TabsContent value="links">
          <Card>
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle>Link Resources</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {resourcesLoading ? (
                <div className="p-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources?.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell>{getDepartmentName(resource.departmentId)}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {resource.url}
                          </a>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditResource(resource)}>
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(resource)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {resources?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          No link resources found. Add some using the button above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pdfs">
          <Card>
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle>PDF Resources</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pdfsLoading ? (
                <div className="p-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pdfs?.map((pdf) => (
                      <TableRow key={pdf.id}>
                        <TableCell className="font-medium">{pdf.originalFilename}</TableCell>
                        <TableCell>{getDepartmentName(pdf.departmentId)}</TableCell>
                        <TableCell>{formatFileSize(pdf.size)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownloadPdf(pdf.id)}
                          >
                            <Download className="h-4 w-4 text-primary" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeletePdf(pdf)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pdfs?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          No PDF resources found. Upload some using the button above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Resource Dialog */}
      <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Link Resource</DialogTitle>
          </DialogHeader>
          <ResourceForm 
            departments={departments || []}
            onSuccess={() => {
              setIsAddResourceDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
            }}
            onCancel={() => setIsAddResourceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditResourceDialogOpen} onOpenChange={setIsEditResourceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Link Resource</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <ResourceForm 
              resource={selectedResource}
              departments={departments || []}
              onSuccess={() => {
                setIsEditResourceDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
              }}
              onCancel={() => setIsEditResourceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add PDF Dialog */}
      <Dialog open={isAddPdfDialogOpen} onOpenChange={setIsAddPdfDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload PDF</DialogTitle>
          </DialogHeader>
          <PdfForm 
            departments={departments || []}
            onSuccess={() => {
              setIsAddPdfDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/pdfs"] });
            }}
            onCancel={() => setIsAddPdfDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Resource Confirmation Dialog */}
      <Dialog open={isDeleteResourceDialogOpen} onOpenChange={setIsDeleteResourceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="mb-2">Are you sure you want to delete this resource?</p>
            <p className="font-medium">{selectedResource?.title}</p>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteResourceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteResource} 
              disabled={deleteResource.isPending}
            >
              {deleteResource.isPending ? "Deleting..." : "Delete Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete PDF Confirmation Dialog */}
      <Dialog open={isDeletePdfDialogOpen} onOpenChange={setIsDeletePdfDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="mb-2">Are you sure you want to delete this PDF?</p>
            <p className="font-medium">{selectedPdf?.originalFilename}</p>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeletePdfDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePdf} 
              disabled={deletePdf.isPending}
            >
              {deletePdf.isPending ? "Deleting..." : "Delete PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
