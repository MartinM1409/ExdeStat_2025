// Department color codes based on department slugs
const departmentColors: Record<string, string> = {
  'cardiologie': '#ef4444', // Red
  'chirurgie-pediatrica': '#f97316', // Orange
  'chirurgie-generala-semiologie': '#f59e0b', // Amber
  'chirurgie-1': '#84cc16', // Lime
  'chirurgie-2': '#10b981', // Emerald
  'gastroenterologie': '#06b6d4', // Cyan
  'nefrologie': '#3b82f6', // Blue
  'obstetrica-ginecologie': '#8b5cf6', // Violet
  'pediatrie': '#d946ef', // Fuchsia
  'pneumologie': '#ec4899', // Pink
  'reumatologie': '#f43f5e', // Rose
  'toate-testele': '#64748b', // Slate
};

// Get color for department by slug
export function getDepartmentColor(slug: string): string {
  return departmentColors[slug] || '#64748b'; // Default to slate if slug not found
}

// Get CSS class for department card by slug
export function getDepartmentCardClass(slug: string): string {
  const cssSlug = slug.replace(/-/g, '-');
  return `department-card-${cssSlug}`;
}

export default departmentColors;
