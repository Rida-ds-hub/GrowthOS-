import { LessonPlanProvider } from "../../context/LessonPlanContext";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LessonPlanProvider>{children}</LessonPlanProvider>;
}
