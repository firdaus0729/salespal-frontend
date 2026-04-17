import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { LayoutGrid, Layers } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
    return (
        <Card
            onClick={onClick}
            className="p-6 cursor-pointer hover:border-secondary/50 group transition-all duration-300 bg-white/[0.02]"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary/10 text-secondary rounded-lg group-hover:bg-secondary group-hover:text-primary transition-colors">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <div className="px-2 py-1 border border-white/10 rounded text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    {project.industry}
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-secondary transition-colors truncate">
                {project.name}
            </h3>

            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <Layers className="w-4 h-4" />
                <span>{project.modules?.length || 0} Modules Enabled</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {project.modules?.slice(0, 3).map(mod => (
                    <Badge key={mod} variant="secondary" className="text-[10px] py-0.5 px-2 capitalize bg-white/5 text-gray-400 border-white/10 group-hover:border-secondary/30 group-hover:text-secondary/80">
                        {mod}
                    </Badge>
                ))}
                {project.modules?.length > 3 && (
                    <span className="text-xs text-gray-500 self-center">+{project.modules.length - 3} more</span>
                )}
            </div>
        </Card>
    );
};

export default ProjectCard;
