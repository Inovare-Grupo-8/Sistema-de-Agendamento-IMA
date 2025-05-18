import React, { useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Textarea } from "./textarea";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "./use-toast";

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, dê uma nota para sua experiência",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simular envio de feedback
    setTimeout(() => {
      setLoading(false);
      setIsOpen(false);
      setFeedback("");
      setRating(null);
      
      toast({
        title: "Feedback enviado!",
        description: "Agradecemos por compartilhar sua opinião conosco."
      });
    }, 1000);
  };
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Deixe seu feedback"
      >
        <MessageSquare className="h-4 w-4 text-[#ED4231]" />
        <span>Feedback</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deixe seu feedback</DialogTitle>
            <DialogDescription>
              Sua opinião é importante para melhorarmos nossos serviços.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex justify-center items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none focus:ring-2 focus:ring-[#ED4231] p-1 rounded-full"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      rating && star <= rating
                        ? "fill-[#ED4231] text-[#ED4231]"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Conte-nos sobre sua experiência..."
              className="min-h-[120px]"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!rating || loading}
              className="bg-[#ED4231]"
            >
              {loading ? "Enviando..." : "Enviar feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
