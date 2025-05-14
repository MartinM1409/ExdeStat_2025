import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Department, insertDepartmentSchema } from "@shared/schema";
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

// Available icon options
const iconOptions: DepartmentIconName[] = [
  "Heart",
  "Baby",
  "Syringe",
  "Scissors",
  "Scalpel",
  "Stethoscope",
  "Activity",
  "FileText",
  "Lungs",
  "UserRound",
  "BabyBottle",
  "Pill",
  "Bone",
  "Microscope",
  "Stomach",
  "Kidney"
];

// Color options with names and hex codes
const colorOptions = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Lime", value: "#84cc16" },
  { name: "Emerald", value: "#10b981" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Slate", value: "#64748b" },
];

// Helper for generating slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface DepartmentFormProps {
  department?: Department;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DepartmentForm({ 
  department, 
  onSuccess, 
  onCancel 
}: DepartmentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!department);

  // Create the form schema
  const formSchema = department
    ? insertDepartmentSchema
    : insertDepartmentSchema;

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: department?.name || "",
      slug: department?.slug || "",
      icon: department?.icon || "Heart",
      color: department?.color || "#3b82f6",
    },
  });

  // Watch the name field to auto-generate slug
  const nameValue = form.watch("name");
  if (autoSlug && nameValue) {
    const generatedSlug = generateSlug(nameValue);
    form.setValue("slug", generatedSlug);
  }

  // Create or update department mutation
  const departmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      try {
        const url = department
          ? `/api/departments/${department.id}`
          : "/api/departments";
        const method = department ? "PATCH" : "POST";
        
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
          throw new Error(errorData.message || "Failed to save department");
        }

        return await response.json();
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: department ? "Department Updated" : "Department Created",
        description: department
          ? "The department has been updated successfully"
          : "The department has been created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save department",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    departmentMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input 
                    {...field} 
                    disabled={autoSlug}
                    className={autoSlug ? "bg-gray-100" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAutoSlug(!autoSlug);
                      if (autoSlug) {
                        // If turning off auto-slug, update one last time
                        form.setValue("slug", generateSlug(nameValue));
                      }
                    }}
                  >
                    {autoSlug ? "Edit" : "Auto"}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Used in URL: /department/your-slug
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon">
                      <div className="flex items-center">
                        <DepartmentIcon
                          name={field.value as DepartmentIconName}
                          className="w-4 h-4 mr-2"
                        />
                        {field.value}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center">
                        <DepartmentIcon
                          name={icon}
                          className="w-4 h-4 mr-2"
                        />
                        {icon}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: field.value }}
                        />
                        {colorOptions.find(c => c.value === field.value)?.name || field.value}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              ? department
                ? "Updating..."
                : "Creating..."
              : department
              ? "Update Department"
              : "Create Department"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
