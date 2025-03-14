import React, { useState, useMemo } from "react";
import { Project, ProjectImage } from "@/types";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectPhotoFilters from "@/components/project/shared/ProjectPhotoFilters";
import ImageGallery from "@/components/ui/ImageGallery";
import ProjectStatusUpdate from "@/components/project/admin/ProjectStatusUpdate";
import { toast } from "sonner";
import { updateProject } from "@/services/projectService";
import { updateProjectImage } from "@/services/imageService";

interface BuilderProjectViewProps {
  project: Project;
  projectImages: ProjectImage[];
  onProjectUpdate: (updatedProject: Project) => void;
  onImageUpload: (newImages: ProjectImage[]) => void;
  onImageDelete: (deletedImageId: string) => void;
  onImageUpdate: (updatedImage: ProjectImage) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BuilderProjectView: React.FC<BuilderProjectViewProps> = ({
  project,
  projectImages,
  onProjectUpdate,
  onImageUpload,
  onImageDelete,
  onImageUpdate,
}) => {
  // Get current year and month for default filters
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = MONTHS[currentDate.getMonth()];

  // State for filters
  const [yearFilter, setYearFilter] = useState<string>(currentYear);
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle project update
  const handleProjectUpdate = async (updatedProjectData: Partial<Project>) => {
    if (!project) return;
    
    setIsUpdating(true);
    try {
      const updatedProject = await updateProject(project.id, updatedProjectData);
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter images based on selected year and month
  const filteredImages = useMemo(() => {
    return projectImages.filter(image => {
      const imageDate = new Date(image.createdAt);
      const imageYear = imageDate.getFullYear().toString();
      const imageMonth = MONTHS[imageDate.getMonth()];
      
      const yearMatch = yearFilter === 'All' || imageYear === yearFilter;
      const monthMatch = monthFilter === 'All' || imageMonth === monthFilter;
      
      return yearMatch && monthMatch;
    });
  }, [projectImages, yearFilter, monthFilter]);

  return (
    <div className="container mx-auto px-4 md:max-w-screen-xl py-6">
      <ProjectHeader 
        project={project} 
        isAdmin={false}
      />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
        <div className="col-span-2">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold mb-4 md:mb-0">Project Photos</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <ProjectPhotoFilters
                  yearFilter={yearFilter}
                  setYearFilter={setYearFilter}
                  monthFilter={monthFilter}
                  setMonthFilter={setMonthFilter}
                />
              </div>
            </div>
            
            {filteredImages.length > 0 ? (
              <ImageGallery 
                images={filteredImages} 
                editable={true}
                onDelete={onImageDelete}
                onUpdate={(imageId, updates) => {
                  updateProjectImage(imageId, updates)
                    .then(updatedImage => {
                      if (updatedImage) {
                        onImageUpdate(updatedImage);
                      }
                    })
                    .catch(error => {
                      console.error("Error updating image:", error);
                      toast.error("Failed to update image");
                    });
                }}
              />
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No photos found for the selected filters</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Project Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1 capitalize">{project.status.replace("-", " ")}</dd>
                </div>
                <hr className="my-2" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Homeowner</dt>
                  <dd className="mt-1">{project.homeownerName}</dd>
                </div>
                <hr className="my-2" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd className="mt-1">{project.address}</dd>
                </div>
                <hr className="my-2" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created On</dt>
                  <dd className="mt-1">{new Date(project.createdAt).toLocaleDateString()}</dd>
                </div>
                <hr className="my-2" />
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="mt-1">{new Date(project.updatedAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <ProjectStatusUpdate 
            project={project}
            onProjectUpdate={onProjectUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default BuilderProjectView; 