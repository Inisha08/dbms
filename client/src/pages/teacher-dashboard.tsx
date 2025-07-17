import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Settings, Search, LogOut, Moon, Sun, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { ResultsTable } from "@/components/results-table";
import { UploadForm } from "@/components/upload-form";
import { getStoredAuth, logout } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { ResultWithDetails } from "@shared/schema";

const editSchema = z.object({
  grade: z.string().min(1, "Grade is required"),
});

type EditFormData = z.infer<typeof editSchema>;

export default function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ResultWithDetails | null>(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const auth = getStoredAuth();

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      grade: "",
    },
  });

  const { data: teacherResults = [], isLoading } = useQuery<ResultWithDetails[]>({
    queryKey: ["/api/results", "teacher", auth.user?.id],
    enabled: !!auth.user?.id,
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, grade }: { id: number; grade: string }) => {
      const gradePoints = getGradePoints(grade);
      return await apiRequest("PUT", `/api/results/${id}`, {
        grade,
        points: gradePoints.toString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Result updated successfully!",
      });
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update result. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/results/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Result deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete result. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    setLocation("/");
  };

  const handleEdit = (result: ResultWithDetails) => {
    setEditingResult(result);
    editForm.setValue("grade", result.grade);
    setIsEditModalOpen(true);
  };

  const handleDelete = (resultId: number) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      deleteMutation.mutate(resultId);
    }
  };

  const onEditSubmit = (data: EditFormData) => {
    if (editingResult) {
      editMutation.mutate({ id: editingResult.id, grade: data.grade });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getGradePoints = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      "A": 4.0,
      "A-": 3.7,
      "B+": 3.3,
      "B": 3.0,
      "B-": 2.7,
      "C+": 2.3,
      "C": 2.0,
      "C-": 1.7,
      "D": 1.0,
      "F": 0.0,
    };
    return gradeMap[grade] || 0;
  };

  const gradeOptions = [
    { value: "A", label: "A (4.0)" },
    { value: "A-", label: "A- (3.7)" },
    { value: "B+", label: "B+ (3.3)" },
    { value: "B", label: "B (3.0)" },
    { value: "B-", label: "B- (2.7)" },
    { value: "C+", label: "C+ (2.3)" },
    { value: "C", label: "C (2.0)" },
    { value: "C-", label: "C- (1.7)" },
    { value: "D", label: "D (1.0)" },
    { value: "F", label: "F (0.0)" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{auth.user?.name}</span>
            </span>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Results
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Settings className="h-4 w-4 mr-2" />
              Manage Results
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <UploadForm
              teacherId={auth.user?.id || 0}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/results"] });
              }}
            />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsTable
                  results={teacherResults}
                  showStudent={true}
                  showActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsTable
                  results={teacherResults}
                  showStudent={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <div className="p-2 bg-muted rounded-md text-sm">
                  {editingResult?.subject.name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Student</label>
                <div className="p-2 bg-muted rounded-md text-sm">
                  {editingResult?.student.name}
                </div>
              </div>

              <FormField
                control={editForm.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editMutation.isPending}>
                  {editMutation.isPending ? "Updating..." : "Update Result"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
