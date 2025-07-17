import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, GraduationCap, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { login, setStoredAuth } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const authData = await login(data.email, data.password, userType);
      setStoredAuth(authData);
      
      toast({
        title: "Success",
        description: `Welcome ${authData.user?.name}!`,
      });
      
      setIsLoginOpen(false);
      setLocation(userType === "student" ? "/student" : "/teacher");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openLoginModal = (type: "student" | "teacher") => {
    setUserType(type);
    setIsLoginOpen(true);
    form.reset();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">SRMS</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="mx-auto h-24 w-24 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-6 sm:text-5xl">
              Student Result Management System
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage and access student results efficiently with our comprehensive dashboard system designed for educational institutions.
            </p>
          </div>

          {/* Login Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Student Login */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openLoginModal("student")}>
              <CardContent className="p-6">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Student Portal</h3>
                <p className="text-muted-foreground mb-4">View your semester results, GPA, and download transcripts</p>
                <Button className="w-full" onClick={() => openLoginModal("student")}>
                  Login as Student
                </Button>
              </CardContent>
            </Card>

            {/* Teacher Login */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openLoginModal("teacher")}>
              <CardContent className="p-6">
                <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Teacher Portal</h3>
                <p className="text-muted-foreground mb-4">Upload results, manage grades, and view student progress</p>
                <Button className="w-full" variant="secondary" onClick={() => openLoginModal("teacher")}>
                  Login as Teacher
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {userType === "student" ? "Student" : "Teacher"} Login
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter your email" />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Enter your password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Demo credentials: Use any email with password "password123" for students or "teacher123" for teachers
                </p>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
