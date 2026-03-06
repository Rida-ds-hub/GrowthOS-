import { useContext } from "react";
import { LessonPlanContext } from "../context/LessonPlanContext";

export function useLessonPlan() {
  const context = useContext(LessonPlanContext);
  if (context === undefined) {
    throw new Error("useLessonPlan must be used within a LessonPlanProvider");
  }
  return context;
}
