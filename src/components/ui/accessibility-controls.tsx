import React from "react";
import { Button } from "./button";
import { ZoomIn, ZoomOut, Type, MousePointer } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function AccessibilityControls() {
  const [fontSize, setFontSize] = useLocalStorage("accessibility-font-size", 1);
  const [highContrast, setHighContrast] = useLocalStorage("accessibility-contrast", false);
  const [cursorSize, setCursorSize] = useLocalStorage("accessibility-cursor", 1);
  
  // Aplicar configurações ao documento quando mudarem
  React.useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontSize.toString());
    
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    if (cursorSize > 1) {
      document.body.classList.add('large-cursor');
    } else {
      document.body.classList.remove('large-cursor');
    }
  }, [fontSize, highContrast, cursorSize]);
  
  const increaseFontSize = () => {
    if (fontSize < 1.5) setFontSize(prev => prev + 0.1);
  };
  
  const decreaseFontSize = () => {
    if (fontSize > 0.8) setFontSize(prev => prev - 0.1);
  };
  
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };
  
  const toggleCursorSize = () => {
    setCursorSize(prev => prev === 1 ? 1.5 : 1);
  };

  return (
    <div className="fixed right-6 top-20 z-20 flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        className="bg-white dark:bg-gray-800 shadow-md"
        onClick={increaseFontSize}
        aria-label="Aumentar tamanho do texto"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="bg-white dark:bg-gray-800 shadow-md"
        onClick={decreaseFontSize}
        aria-label="Diminuir tamanho do texto"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant={highContrast ? "default" : "outline"}
        size="sm"
        className={highContrast ? "bg-[#ED4231]" : "bg-white dark:bg-gray-800 shadow-md"}
        onClick={toggleHighContrast}
        aria-label="Alternar alto contraste"
      >
        <Type className="h-4 w-4" />
      </Button>
      
      <Button
        variant={cursorSize > 1 ? "default" : "outline"}
        size="sm"
        className={cursorSize > 1 ? "bg-[#ED4231]" : "bg-white dark:bg-gray-800 shadow-md"}
        onClick={toggleCursorSize}
        aria-label="Alternar tamanho do cursor"
      >
        <MousePointer className="h-4 w-4" />
      </Button>
    </div>
  );
}
