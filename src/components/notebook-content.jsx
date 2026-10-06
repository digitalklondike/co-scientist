import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Pencil,
  BookmarkPlus,
  Check,
  MessageSquare,
  ArrowUp,
  BookOpen,
  ArrowUpRight,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { markdown } from "../data.js";
import { notebookReply } from "../notebook.js";

export function NotebookMarkdown({ children }) {
  return (
    <div className="space-y-4 break-words text-base leading-relaxed [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-secondary [&_pre]:p-3 [&_code]:text-xs">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm text-primary underline underline-offset-4 hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs [&_th]:p-3 [&_td]:p-3 [&_tr]:border-b">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function FindingContent({
  finding,
  onSave,
  onDiscuss,
  documentView = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const savedDocument = markdown(finding).replace(/^# [^\n]+\n\s*\n/, "").split("\n").filter((line) => !finding.result.sources.some((source) => line === `- [${source.title}](${source.url})`)).join("\n");
  const analysisStart = savedDocument.search(/^## /m);
  const summary = analysisStart < 0 ? savedDocument : savedDocument.slice(0, analysisStart);
  const analysis = analysisStart < 0 ? "" : savedDocument.slice(analysisStart);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setDraft(markdown(finding));
            setEditing(true);
          }}
          disabled={editing}
        >
          <Pencil />
          Edit answer
        </Button>
        {onDiscuss && (
          <Button variant="secondary" size="sm" onClick={onDiscuss}>
            <MessageSquare />
            Discuss finding
          </Button>
        )}
        {finding.contentMarkdown !== undefined && (
          <span className="ml-auto self-center text-xs text-muted-foreground">Edited in Notebook</span>
        )}
      </div>
      {editing ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            onSave(draft);
            setEditing(false);
          }}
        >
          <Label htmlFor={`answer-editor-${finding.id}`}>
            Answer in Markdown
          </Label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Edit or remove sections here. Your original research and source
            links are kept.
          </p>
          <Textarea
            id={`answer-editor-${finding.id}`}
            autoFocus
            className="min-h-80 font-mono text-base"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={!draft.trim()}>
              Save changes
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel editing
            </Button>
          </div>
        </form>
      ) : documentView ? (
        <div className="space-y-6">
          <NotebookMarkdown>{summary}</NotebookMarkdown>
          {analysis && <>
            <motion.div id={`saved-analysis-${finding.id}`}
              aria-hidden={!analysisOpen} inert={!analysisOpen}
              initial={false} animate={{ height: analysisOpen ? "auto" : 144 }}
              transition={{ duration: reducedMotion ? 0 : .5, ease: [.4, 0, .2, 1] }}
              className="relative overflow-hidden">
              <NotebookMarkdown>{analysis}</NotebookMarkdown>
              <motion.div aria-hidden="true" initial={false} animate={{ opacity: analysisOpen ? 0 : 1 }}
                transition={{ duration: reducedMotion ? 0 : .2 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            </motion.div>
            <div className="flex justify-center"><Button variant="secondary" className="h-11 px-5" aria-expanded={analysisOpen} aria-controls={`saved-analysis-${finding.id}`} onClick={() => setAnalysisOpen((previous) => !previous)}>{analysisOpen ? "Hide full analysis" : "Read full analysis"}<ChevronDown className={`transition-transform duration-200 motion-reduce:transition-none ${analysisOpen ? "rotate-180" : ""}`} /></Button></div>
          </>}
        </div>
      ) : (
        <>
          {finding.contentMarkdown === undefined && (
            <NotebookMarkdown>{finding.result.summary}</NotebookMarkdown>
          )}
          <Accordion
            type="single"
            collapsible
            defaultValue={
              finding.contentMarkdown !== undefined ? "answer" : undefined
            }
          >
            <AccordionItem value="answer" className="border-0">
              <AccordionTrigger className="py-2 text-xs">
                {finding.contentMarkdown !== undefined
                  ? "Edited answer"
                  : "Full saved answer"}
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <NotebookMarkdown>{markdown(finding)}</NotebookMarkdown>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  );
}

export function NotebookConversation({
  finding,
  onConversation,
  onSaveReply,
  workspace = false,
  onClose,
  detached = false,
}) {
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(null);
  const [latestReply, setLatestReply] = useState(null);
  const timer = useRef(null);
  const log = useRef(null);
  const follow = useRef(true);
  const reducedMotion = useReducedMotion();
  const messages = finding.conversation || [];
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (follow.current && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages.length, pending]);
  function send(event) {
    event.preventDefault();
    if (!question.trim() || timer.current !== null) return;
    const prompt = question.trim();
    const id = crypto.randomUUID();
    follow.current = true;
    setPending({ id, question: prompt });
    setQuestion("");
    // Brief local-demo processing state; no simulated reasoning or live AI claim.
    timer.current = setTimeout(() => {
      onConversation([...messages, { id, question: prompt, answer: notebookReply(finding, prompt) }]);
      setLatestReply(id);
      setPending(null);
      timer.current = null;
    }, 700);
  }
  function userMessage(prompt) {
    return <div className="ml-8 flex flex-col items-end gap-2">
      <span className="text-xs text-muted-foreground">You</span>
      <p className="max-w-full whitespace-pre-wrap break-words rounded-xl bg-accent px-4 py-3 text-base leading-relaxed">{prompt}</p>
    </div>;
  }
  return (
    <section
      aria-label="Notebook conversation"
      className={
        workspace
          ? (detached ? "flex h-full min-h-0 flex-col gap-4 p-5" : "flex h-full min-h-0 flex-col gap-4 rounded-2xl bg-secondary/70 p-5")
          : "flex flex-col gap-4 rounded-2xl bg-secondary/70 p-5 xl:h-[calc(100svh-12rem)] xl:min-h-[32rem] xl:max-h-[44rem]"
      }
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="size-4" />
          Discuss this finding
        </h3>{onClose && <Button variant="ghost" size="icon" aria-label="Close discussion" onClick={onClose}><X /></Button>}</div>
        <Badge variant="secondary">Local demo Â· saved content only</Badge>
        <p className="break-words text-xs leading-relaxed text-muted-foreground">
          {finding.question}
        </p>
      </div>
      <div
        ref={log}
        role="log"
        aria-label="Finding conversation"
        aria-live="polite"
        aria-busy={!!pending}
        onScroll={() => {
          const node = log.current;
          follow.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
        }}
        className={workspace ? "min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1" : "min-h-0 max-h-[45svh] space-y-6 overflow-y-auto overscroll-contain pr-1 xl:max-h-none xl:flex-1"}
      >
        {!messages.length && !pending && (
          <p className="text-base leading-relaxed text-muted-foreground">
            Ask for a summary or find a passage in this answer. Your conversation stays with this finding.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="space-y-4">
            {userMessage(message.question)}
            <motion.div className="space-y-3"
              initial={message.id === latestReply && !reducedMotion ? { opacity: 0, y: 4 } : false}
              animate={{ opacity: 1, y: 0 }} transition={{ duration: .2, ease: [.23, 1, .32, 1] }}>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Avatar className="size-7"><AvatarImage src="/assets/co-scientist.png" alt="" /><AvatarFallback>Co</AvatarFallback></Avatar>Co-Scientist</div>
              <NotebookMarkdown>{message.answer}</NotebookMarkdown>
              {message.saved ? (
                <div role="status" className="inline-flex min-h-9 items-center gap-2 rounded-md bg-secondary px-3 text-xs font-medium text-foreground"><Check className="size-4 text-primary" />Saved to notebook</div>
              ) : (
                <Button variant="outline" size="sm" className="h-9 border-primary/30 text-primary" onClick={() => onSaveReply(message)}>
                  <BookmarkPlus />Save to notebook
                </Button>
              )}
            </motion.div>
          </div>
        ))}
        {pending && <div className="space-y-4">
          {userMessage(pending.question)}
          <div role="status" className="flex items-center gap-3 py-2 text-xs text-muted-foreground">
            <span aria-hidden="true" className="flex gap-1">
              {[0, 1, 2].map((dot) => <motion.span key={dot} className="size-1.5 rounded-full bg-primary"
                animate={reducedMotion ? { opacity: .65 } : { opacity: [.3, 1, .3] }}
                transition={{ duration: 1, repeat: Infinity, delay: dot * .15 }} />)}
            </span>
            Searching saved answer…
          </div>
        </div>}
      </div>
      <form onSubmit={send} className="space-y-3">
        <Label htmlFor="notebook-question">Ask about this finding</Label>
        <Textarea
          id="notebook-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Summarize this answer"
          className="min-h-24 bg-white"
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter")
              send(event);
          }}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!question.trim() || !!pending}>
            Ask
            <ArrowUp />
          </Button>
        </div>
      </form>
      {!workspace && !!finding.result.sources.length && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Sources in this finding
          </p>
          <div className="flex flex-wrap gap-2">
            {finding.result.sources.map((source) => (
              <Button
                key={source.url}
                asChild
                variant="secondary"
                size="sm"
                className="bg-white"
              >
                <a href={source.url} target="_blank" rel="noreferrer">
                  <BookOpen />
                  {source.author}, {source.year}
                  <ArrowUpRight />
                </a>
              </Button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
