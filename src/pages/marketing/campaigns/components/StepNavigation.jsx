import React from 'react';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import Button from '../../../../components/ui/Button';

const StepNavigation = ({ onNext, onBack, isFirstStep, isLastStep, nextDisabled, nextLabel }) => {
    return (
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <Button
                variant="outline"
                onClick={onBack}
                disabled={isFirstStep}
                className={isFirstStep ? 'opacity-0 pointer-events-none' : ''}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <Button
                variant="primary"
                onClick={onNext}
                disabled={(isLastStep && onNext.name !== 'handleLaunch' && !isLastStep) || nextDisabled} // Simplified logic: if nextDisabled is true, disable. Also keep existing logic if any (none really)
            >
                {isLastStep ? (
                    <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Launch Campaign
                    </>
                ) : (
                    <>
                        {nextLabel || 'Next Step'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                )}
            </Button>
        </div>
    );
};

export default StepNavigation;
