import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import DepartmentIcon, { DepartmentIconName } from "@/lib/department-icons";
import { File, UploadCloud, X } from "lucide-react";

// Define schema for form validation
const formSchema = z.object({
  departmentId: z.number().min(1, "Please select a department"),
  file: z.instanceof(File, { message: "Please select a PDF file" }).refine(
    (file) => file.type === "application/pdf", {
      message: "File must be a PDF",
    }
  ).refine(
    (file) => file.size <= 20 * 1024 * 1024, {
      message: "File size must be less than 20MB",
    }
  ),
});

interface PdfFormProps {
  departments: Department[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PdfForm({ 
  departments,
  onSuccess, 
  onCancel 
}: PdfFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set up form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departmentId: departments[0]?.id || 0,
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("file", file);
      form.trigger("file");
    }
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    form.resetField("file");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("departmentId", data.departmentId.toString());
      formData.append("file", data.file);

      const response = await fetch("/api/pdfs", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload PDF");
      }

      toast({
        title: "PDF Uploaded",
        description: "The PDF has been uploaded successfully",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value.toString()}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department">
                      {departments.find(d => d.id === field.value)?.name || "Select a department"}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      <div className="flex items-center">
                        <DepartmentIcon
                          name={department.icon as DepartmentIconName}
                          className="w-4 h-4 mr-2"
                          style={{ color: department.color }}
                        />
                        {department.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The department this PDF belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>PDF File</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {/* Hidden file input */}
                  <input
                    {...fieldProps}
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      handleFileChange(e);
                      onChange(e.target.files?.[0]);
                    }}
                    className="hidden"
                    disabled={isLoading}
                  />
                  
                  {/* Custom upload button */}
                  {!selectedFile ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload PDF
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF up to 20MB
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <File className="h-8 w-8 text-red-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[240px]">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={clearFile}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !selectedFile}>
            {isLoading ? "Uploading..." : "Upload PDF"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
