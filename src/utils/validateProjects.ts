// Utility to validate projects data structure
import projectsData from '@/data/projects.json';

export function validateProjectsData() {
  console.log('=== Projects Data Validation ===');
  
  // Check if it has the new structure
  if ('projects' in projectsData) {
    console.log('Using NEW structure (projects array)');
    console.log(`Total projects: ${projectsData.projects.length}`);
    console.log(`Featured projects: ${projectsData.projects.filter((p: any) => p.featured).length}`);
  } else if ('featuredProjects' in projectsData) {
    console.log('Using OLD structure (featuredProjects array)');
    console.log('Please update to new structure!');
  } else {
    console.log('Unknown structure!');
  }
  
  return projectsData;
}

// Auto-run validation in development
if (import.meta.env.DEV) {
  validateProjectsData();
}
