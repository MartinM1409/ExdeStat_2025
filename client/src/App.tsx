import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/components/login";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Department from "@/pages/department";
import AdminIndex from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminDepartments from "@/pages/admin/departments";
import AdminResources from "@/pages/admin/resources";
import { useAuth, AuthProvider } from "./lib/auth.tsx";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/department/:slug" component={Department} />
        <Route path="/admin" component={AdminIndex} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/departments" component={AdminDepartments} />
        <Route path="/admin/resources" component={AdminResources} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
