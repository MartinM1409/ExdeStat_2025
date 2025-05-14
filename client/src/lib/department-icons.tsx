import { 
  Heart, 
  Baby, 
  Syringe, 
  Scissors, 
  Slice, 
  Stethoscope, 
  Activity, 
  FileText, 
  HeartPulse,
  UserRound,
  Milk,
  Pill,
  Bone,
  Microscope
} from "lucide-react";

// Create a type for the supported icon components
export type DepartmentIconName = 
  | "Heart" 
  | "Baby" 
  | "Syringe" 
  | "Scissors" 
  | "Slice" 
  | "Stethoscope" 
  | "Activity" 
  | "FileText" 
  | "HeartPulse"
  | "UserRound"
  | "Milk"
  | "Pill"
  | "Bone"
  | "Microscope"
  | "Stomach"
  | "Kidney";

// Map for matching icon names to their components
const iconMap: Record<DepartmentIconName, React.ComponentType<any>> = {
  Heart,
  Baby,
  Syringe,
  Scissors,
  Slice,
  Stethoscope,
  Activity,
  FileText,
  HeartPulse,
  UserRound,
  Milk,
  Pill,
  Bone,
  Microscope,
  // These are custom icons because Lucide doesn't have specific icons for kidneys and stomach
  Stomach: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 14c2.2 0 4-1.8 4-4 0-1.7-1.3-3-3-3h-2c-1.7 0-3 1.3-3 3 0 .5-.2 1-.5 1.5l-3 4c-.8 1-1.5 2.5-1.5 4 0 3 2.5 5.5 5.5 5.5 1.8 0 3.4-.9 4.5-2.3"/>
      <path d="M7 11c-1.2-.1-2.3-.5-3-1-2.3-1.5-3-4-3-6 2 0 4 .5 5 2 .7 1 1 2.2 1 3.5"/>
    </svg>
  ),
  Kidney: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7.5c0 1-4 2.5-4 2.5s.5 3 2 3c2 0 5.5-5.5 5.5-5.5"/>
      <path d="M18.5 7c-.8-.8-3-1-6.5-1h-2C7 6 5 7 5.5 9.5c.5 2.5 3.5 2.5 4 4.5.5 2 3 2.5 5 2.5 1 0 5.5 1 5.5-5.5"/>
      <path d="M18.5 14.5c1-1 2-3 2-5.5"/>
    </svg>
  )
};

export interface DepartmentIconProps {
  name: DepartmentIconName;
  className?: string;
}

const DepartmentIcon = ({ name, className }: DepartmentIconProps) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    // Fallback to FileText icon if the requested icon doesn't exist
    return <FileText className={className} />;
  }
  
  return <IconComponent className={className} />;
};

export default DepartmentIcon;
