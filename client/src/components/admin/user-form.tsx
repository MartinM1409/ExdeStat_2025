import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole, UserStatus, insertUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/form";

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Create the form schema based on whether we're adding or editing
  const formSchema = user
    ? insertUserSchema
        .partial()
        .extend({
          // When editing, password is optional
          password: z.string().min(5).max(100).optional(),
        })
    : insertUserSchema.extend({
        // When creating, password is required
        password: z.string().min(5).max(100),
      });

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      password: "",
      role: user?.role || UserRole.USER,
      status: user?.status || UserStatus.ACTIVE,
    },
  });

  // Create or update user mutation
  const userMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      try {
        const url = user
          ? `/api/users/${user.id}`
          : "/api/users";
        const method = user ? "PATCH" : "POST";
        
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
          throw new Error(errorData.message || "Failed to save user");
        }

        return await response.json();
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: user ? "User Updated" : "User Created",
        description: user
          ? "The user has been updated successfully"
          : "The user has been created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save user",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    userMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{user ? "New Password (leave blank to keep current)" : "Password"}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.SEMI_ADMIN}>Semi-Admin</SelectItem>
                  <SelectItem value={UserRole.USER}>User</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={UserStatus.DISABLED}>Disabled</SelectItem>
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
              ? user
                ? "Updating..."
                : "Creating..."
              : user
              ? "Update User"
              : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
