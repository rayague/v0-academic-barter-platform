import {
  BookOpen,
  FileText,
  FlaskConical,
  GraduationCap,
  NotebookPen,
  Package,
} from "lucide-react"
import type { ElementType } from "react"

export const categoryIcons: Record<string, ElementType> = {
  "book-open": BookOpen,
  "file-text": FileText,
  "flask-conical": FlaskConical,
  "graduation-cap": GraduationCap,
  "notebook-pen": NotebookPen,
  "package": Package,
}

export function getCategoryIcon(iconName: string): ElementType {
  return categoryIcons[iconName] || Package
}