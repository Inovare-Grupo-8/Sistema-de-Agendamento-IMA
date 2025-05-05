import { Button } from "@/components/ui/button";

interface TimeSlotSectionProps {
  title: string;
  timeSlots: string[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  highlightColor?: string;
  animateSelection?: boolean;
}

const TimeSlotSection = ({ 
  title, 
  timeSlots, 
  selectedTime, 
  onSelectTime, 
  highlightColor = "",
  animateSelection = false
}: TimeSlotSectionProps) => {
  return (
    <div className={`bg-white rounded-lg p-4 ${highlightColor}`}>
      <div className="mb-2">
        <h3 className="font-bold text-white bg-indigo-900 py-1 px-4 rounded-md inline-block">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {timeSlots.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            onClick={() => onSelectTime(time)}
            className={`text-center transition-all duration-300 ${selectedTime === time ? "bg-blue-600 scale-105 shadow-lg" : "bg-white"} ${animateSelection ? "hover:scale-105" : ""}`}
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSection;