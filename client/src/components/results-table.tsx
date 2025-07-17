import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { GradeBadge } from "./grade-badge";
import type { ResultWithDetails } from "@shared/schema";

interface ResultsTableProps {
  results: ResultWithDetails[];
  showStudent?: boolean;
  showActions?: boolean;
  onEdit?: (result: ResultWithDetails) => void;
  onDelete?: (resultId: number) => void;
}

export function ResultsTable({ 
  results, 
  showStudent = false, 
  showActions = false, 
  onEdit,
  onDelete 
}: ResultsTableProps) {
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = results.filter(result => {
    const matchesSemester = !semesterFilter || result.semester.toString() === semesterFilter;
    const matchesSearch = !searchTerm || 
      result.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (showStudent && result.student.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSemester && matchesSearch;
  });

  const semesters = Array.from(new Set(results.map(r => r.semester))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={showStudent ? "Search by student or subject..." : "Search by subject..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Semesters</SelectItem>
            {semesters.map(semester => (
              <SelectItem key={semester} value={semester.toString()}>
                Semester {semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {showStudent && <TableHead>Student</TableHead>}
              <TableHead>Subject</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Semester</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={showStudent ? (showActions ? 7 : 6) : (showActions ? 6 : 5)} 
                  className="text-center py-8 text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map(result => (
                <TableRow key={result.id}>
                  {showStudent && (
                    <TableCell className="font-medium">
                      {result.student.name}
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {result.subject.name}
                  </TableCell>
                  <TableCell>{result.subject.credits}</TableCell>
                  <TableCell>
                    <GradeBadge grade={result.grade} />
                  </TableCell>
                  <TableCell>{result.points}</TableCell>
                  <TableCell>{result.semester}</TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit?.(result)}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete?.(result.id)}
                          className="text-destructive hover:text-destructive/80 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
