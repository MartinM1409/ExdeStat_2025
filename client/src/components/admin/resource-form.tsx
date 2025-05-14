import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Resource, Department, insertResourceSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ResourceFormProps {
  resource?: Resource;
  departments: Department[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResourceForm({ 
  resource, 
  departments,
  onSuccess, 
  onCancel 
}: ResourceFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Extend the schema to validate URL
  const formSchema = insertResourceSchema
    .omit({ createdById: true }) // This will be set by the server
    .extend({
      url: z.string().url("Please enter a valid URL"),
    });

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource?.title || "",
      url: resource?.url || "",
      departmentId: resource?.departmentId || (departments[0]?.id || 0),
    },
  });

  // Create or update resource mutation
  const resourceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      try {
        const url = resource
          ? `/api/resources/${resource.id}`
          : "/api/resources";
        const method = resource ? "PATCH" : "POST";
        
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save resource");
        }

        return await response.json();
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: resource ? "Resource Updated" : "Resource Created",
        description: resource
          ? "The resource has been updated successfully"
          : "The resource has been created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save resource",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    resourceMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter a descriptive title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
              </FormControl>
              <FormDescription>
                Users will be redirected to this URL when clicking the resource
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value.toString()}
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
                The department this resource belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? resource
                ? "Updating..."
                : "Creating..."
              : resource
              ? "Update Resource"
              : "Create Resource"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
