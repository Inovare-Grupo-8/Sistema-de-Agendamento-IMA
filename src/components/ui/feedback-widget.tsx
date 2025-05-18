import React, { useState } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Textarea } from "./textarea";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "./use-toast";

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma nota para sua experiência",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simular envio
    setTimeout(() => {
      toast({
        title: "Feedback enviado!",
        description: "Obrigado por nos ajudar a melhorar."
      });
      
      setFeedback("");
      setRating(null);
      setOpen(false);
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-50 bg-[#ED4231]"
          aria-label="Deixe seu feedback"
        >
          <MessageSquare className="mr-2 h-4 w-4" /> Feedback
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Sua opinião é importante</h3>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Como você avalia sua experiência?</p>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      rating && rating >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Compartilhe seus comentários (opcional)</p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="O que podemos melhorar?"
              className="resize-none h-24"
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !rating}
            className="w-full"
          >
            {loading ? "Enviando..." : "Enviar feedback"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
