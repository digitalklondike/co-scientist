import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { Archive, ArchiveRestore, ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";

const rowClass = "h-10 rounded-sm hover:bg-primary/10 data-[active=true]:bg-white data-[active=true]:text-foreground data-[active=true]:hover:bg-white";

function ResearchRow({ record, active, onOpen }) {
  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            className={rowClass}
            data-testid="history-chat"
            isActive={active}
            onClick={() => onOpen(record)}
            aria-label={record.question}
          >
            <span className="truncate">{record.question.replace(/[?.]$/, "")}</span>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-72 text-[length:var(--text-navigation)] leading-relaxed">
          {record.isPreset ? `Prepared example · ${record.question}` : record.question}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  );
}

export function ResearchHistory({ history, search, expanded, onExpandedChange, active, view, task, onOpen, onPending, onArchive, onRestore, archivedCount }) {
  const moreId = useId();
  const reducedMotion = useReducedMotion();
  const [keyboardToggle, setKeyboardToggle] = useState(false);
  const instant = reducedMotion || keyboardToggle;
  const rows = (records) => records.map((record) => (
    <ResearchRow key={record.id} record={record} active={record.id === active && view === "answer"} onOpen={onOpen} />
  ));

  return (
    <SidebarGroup className="px-3">
      <div className="flex items-center justify-between">
        <SidebarGroupLabel>Recent research</SidebarGroupLabel>
        {(history.all.length > 0 || archivedCount > 0) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Research history actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              {history.all.length > 0 && (
                <DropdownMenuItem onSelect={onArchive}><Archive />Archive all research</DropdownMenuItem>
              )}
              {archivedCount > 0 && (
                <DropdownMenuItem onSelect={onRestore}><ArchiveRestore />Restore archived research</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {task && (
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className={rowClass} isActive={view === "loading"} onClick={onPending} data-testid="pending-chat" aria-label={`Research in progress: ${task.question}`}>
                    <Spinner className="size-4 shrink-0" />
                    <span className="truncate">{task.question.replace(/[?.]$/, "")}</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-72 text-[length:var(--text-navigation)] leading-relaxed">
                  {task.question} · Research in progress
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          )}
          {rows(search.trim() ? history.matching : history.recent)}
          {!search.trim() && history.more.length > 0 && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="h-10 rounded-sm text-muted-foreground"
                aria-expanded={expanded}
                aria-controls={moreId}
                onClick={(event) => {
                  setKeyboardToggle(event.detail === 0);
                  onExpandedChange(!expanded);
                }}
              >
                <span>{expanded ? "Show less" : "Show all research"}</span>
                <ChevronDown className={`ml-auto transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} style={keyboardToggle ? { transitionDuration: "0ms" } : undefined} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        {!search.trim() && (
          <motion.div
            id={moreId}
            aria-hidden={!expanded}
            inert={!expanded ? true : undefined}
            className="overflow-hidden"
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{ height: { duration: instant ? 0 : 0.22, ease: [0.23, 1, 0.32, 1] }, opacity: { duration: instant ? 0 : expanded ? 0.18 : 0.1 } }}
          >
            <SidebarMenu className="gap-1 pt-1">{rows(history.more)}</SidebarMenu>
          </motion.div>
        )}
        {!history.all.length && !task && (
          <p className="px-2 py-4 text-[length:var(--text-navigation)] leading-relaxed text-muted-foreground">Your research will appear here.</p>
        )}
        {search.trim() && history.all.length > 0 && !history.matching.length && (
          <p className="px-2 py-4 text-[length:var(--text-navigation)] leading-5 text-muted-foreground">No matching research.</p>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
