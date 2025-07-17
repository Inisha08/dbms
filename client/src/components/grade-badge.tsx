import { cn } from "@/lib/utils";

interface GradeBadgeProps {
  grade: string;
  className?: string;
}

export function GradeBadge({ grade, className }: GradeBadgeProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
      case "A-":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "B+":
      case "B":
      case "B-":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "C+":
      case "C":
      case "C-":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "D":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "F":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        getGradeColor(grade),
        className
      )}
    >
      {grade}
    </span>
  );
}
