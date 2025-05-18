import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
}

export function UserTutorial({ steps, pageId }: { steps: TutorialStep[], pageId: string }) {
  const [showTutorial, setShowTutorial] = useLocalStorage(`tutorial-${pageId}`, true);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const handleClose = () => {
    if (dontShowAgain) {
      setShowTutorial(false);
    }
    setCurrentStep(0);
  };
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  if (!showTutorial) return null;
  
  return (
    <Dialog open={showTutorial} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {steps[currentStep].image && (
            <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
              <img 
                src={steps[currentStep].image} 
                alt={steps[currentStep].title}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <p className="text-sm">{steps[currentStep].description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>{currentStep + 1} de {steps.length}</div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dontShow"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <Label htmlFor="dontShow">Não mostrar novamente</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
