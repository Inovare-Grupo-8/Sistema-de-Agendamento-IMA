import * as React from "react"
import { Badge, BadgeProps } from "./badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip"

interface StatusBadgeProps {
  status: string;
  className?: string;
  variant?: BadgeProps["variant"];
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, variant = "outline" }, ref) => {
    const statusText = () => {
      switch (status) {
        case 'agendada':
          return 'Agendada';
        case 'realizada':
          return 'Realizada';
        case 'cancelada':
          return 'Cancelada';
        case 'remarcada':
          return 'Remarcada';
        default:
          return status;
      }
    };

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            ref={ref} 
            variant={variant} 
            className={className}
          >
            {statusText()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {status === 'agendada' ? 'Consulta confirmada e agendada' : 
             status === 'realizada' ? 'Consulta já foi realizada' : 
             status === 'cancelada' ? 'Consulta foi cancelada' : 
             status === 'remarcada' ? 'Consulta foi remarcada' : 
             'Status desconhecido'}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }
);

StatusBadge.displayName = "StatusBadge";
