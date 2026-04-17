import React from 'react';
import Card from '../../components/ui/Card';

const ModulePage = ({ title, description, icon: Icon }) => {
    return (
        <div className="max-w-4xl">
            <div className="mb-8 flex items-center gap-4">
                {Icon && (
                    <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                        <Icon className="w-8 h-8" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
                    <p className="text-gray-400">{description}</p>
                </div>
            </div>

            <Card className="p-12 text-center border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-6">
                    <span className="text-2xl font-bold">🚧</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Module Under Construction</h3>
                <p className="text-gray-400 max-w-md">
                    We are currently building out the {title} module capabilities. Check back soon for updates.
                </p>
            </Card>
        </div>
    );
};

export default ModulePage;
