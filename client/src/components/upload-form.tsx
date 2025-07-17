import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertResult, Student, Subject } from "@shared/schema";

const uploadSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().min(1, "Subject is required"),
  grade: z.string().min(1, "Grade is required"),
  semester: z.string().min(1, "Semester is required"),
  academicYear: z.string().min(1, "Academic year is required"),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  teacherId: number;
  onSuccess?: () => void;
}

export function UploadForm({ teacherId, onSuccess }: UploadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      studentId: "",
      subjectId: "",
      grade: "",
      semester: "",
      academicYear: "2023-2024",
    },
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      const gradePoints = getGradePoints(data.grade);
      const resultData: InsertResult = {
        studentId: parseInt(data.studentId),
        subjectId: parseInt(data.subjectId),
        grade: data.grade,
        points: gradePoints.toString(),
        semester: parseInt(data.semester),
        academicYear: data.academicYear,
        teacherId,
      };

      return await apiRequest("POST", "/api/results", resultData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Result uploaded successfully!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload result. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const onSubmit = (data: UploadFormData) => {
    uploadMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Result</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name} ({student.studentId})
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
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name} ({subject.code})
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

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
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
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="2023-2024" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "Uploading..." : "Upload Result"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
