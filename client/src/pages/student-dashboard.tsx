import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, LogOut, Moon, Sun, TrendingUp, Calculator, BookOpen } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { ResultsTable } from "@/components/results-table";
import { getStoredAuth, logout } from "@/lib/auth";
import { calculateCGPA, getSemesterWiseGPA } from "@/lib/gpa-calculator";

import type { Student, ResultEntry } from "@/lib/gpa-calculator";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const auth = getStoredAuth();

  const { data: studentData, isLoading } = useQuery<Student>({
    queryKey: ["/api/students", auth.user?.id, "with-results"],
    enabled: !!auth.user?.id,
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    setLocation("/");
  };

  const handleDownloadTranscript = () => {
    toast({
      title: "Download Started",
      description: "Your transcript is being generated and will be downloaded shortly.",
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Safely get results as ResultEntry[]
  const results: ResultEntry[] = studentData?.results || [];
  const cgpaData = calculateCGPA(results);
  const semesterGPAs = getSemesterWiseGPA(results);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Student Dashboard</h1>
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
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">
              <FileText className="h-4 w-4 mr-2" />
              View Results
            </TabsTrigger>
            <TabsTrigger value="gpa">
              <TrendingUp className="h-4 w-4 mr-2" />
              GPA Summary
            </TabsTrigger>
            <TabsTrigger value="transcript">
              <Download className="h-4 w-4 mr-2" />
              Download Transcript
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Semester Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Pass results as ResultEntry[] */}
                <ResultsTable results={results} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gpa" className="space-y-6">
            {/* GPA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Current CGPA</p>
                      <p className="text-2xl font-bold">{cgpaData.gpa.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                      <p className="text-2xl font-bold">{cgpaData.totalCredits}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Grade Points</p>
                      <p className="text-2xl font-bold">{cgpaData.totalGradePoints.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Semester-wise Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Semester-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {semesterGPAs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No semester data available
                    </p>
                  ) : (
                    semesterGPAs.map(({ semester, gpa, credits }) => (
                      <div key={semester} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Semester {semester}</p>
                          <p className="text-sm text-muted-foreground">Credits: {credits}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{gpa.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">GPA</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcript" className="space-y-6">
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Download className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Download Official Transcript</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Get your official academic transcript with all semester results and GPA information.
                  </p>
                  <Button onClick={handleDownloadTranscript} size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download Transcript (PDF)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
