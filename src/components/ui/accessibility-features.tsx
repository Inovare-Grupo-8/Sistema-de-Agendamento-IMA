import React, { useState } from "react";
import { Button } from "./button";
import { ZoomIn, ZoomOut, Type, Eye, MousePointer } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useLocalStorage("app-font-size", 1);
  const [highContrast, setHighContrast] = useLocalStorage("app-high-contrast", false);
  const [dyslexiaFont, setDyslexiaFont] = useLocalStorage("app-dyslexia-font", false);
  
  React.useEffect(() => {
    document.documentElement.style.setProperty('--font-size-multiplier', fontSize.toString());
    
    if (highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
    
    if (dyslexiaFont) {
      document.body.classList.add('dyslexia-friendly');
    } else {
      document.body.classList.remove('dyslexia-friendly');
    }
  }, [fontSize, highContrast, dyslexiaFont]);
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-20 z-50 bg-[#ED4231]"
        aria-label="Opções de acessibilidade"
      >
        <Eye className="mr-2 h-4 w-4" /> Acessibilidade
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">Opções de Acessibilidade</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Tamanho do texto</h3>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setFontSize(prev => Math.max(0.8, prev - 0.1))} size="sm" variant="outline">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-[#ED4231] rounded-full" 
                      style={{ width: `${((fontSize - 0.8) / 0.7) * 100}%` }}
                    ></div>
                  </div>
                  <Button onClick={() => setFontSize(prev => Math.min(1.5, prev + 0.1))} size="sm" variant="outline">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Alto contraste</span>
                <Button
                  onClick={() => setHighContrast(prev => !prev)}
                  variant={highContrast ? "default" : "outline"}
                  className={highContrast ? "bg-[#ED4231]" : ""}
                >
                  {highContrast ? "Ativado" : "Desativado"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span>Fonte amigável para dislexia</span>
                <Button
                  onClick={() => setDyslexiaFont(prev => !prev)}
                  variant={dyslexiaFont ? "default" : "outline"}
                  className={dyslexiaFont ? "bg-[#ED4231]" : ""}
                >
                  {dyslexiaFont ? "Ativada" : "Desativada"}
                </Button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsOpen(false)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
