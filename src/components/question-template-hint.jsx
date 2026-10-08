import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export const QUESTION_TEMPLATE_HELP = "Replace the text in brackets with your own research topic.";

export function QuestionTemplateHint({ question, notice, onDismiss }) {
  const [open, setOpen] = useState(false);
  const visible = Boolean(notice) || open;
  useEffect(() => setOpen(false), [question]);

  const changeOpen = (next) => {
    setOpen(next);
    if (!next && notice) onDismiss();
  };

  return (
    <span className="inline-flex items-center">
      <span id="question-template-instructions" className="sr-only">{QUESTION_TEMPLATE_HELP}</span>
      {notice && <span id="question-notice" role="status" className="sr-only">{notice}</span>}
      <Tooltip open={visible} onOpenChange={changeOpen} delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={`max-sm:size-11 ${visible ? "bg-accent text-primary" : "text-muted-foreground"}`}
            aria-label="Question template help"
            onClick={(event) => {
              event.preventDefault();
              changeOpen(!visible);
            }}
          >
            <CircleHelp />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" sideOffset={8} collisionPadding={16} className="max-w-72 text-[14px] leading-5 motion-reduce:animate-none">
          {QUESTION_TEMPLATE_HELP}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
