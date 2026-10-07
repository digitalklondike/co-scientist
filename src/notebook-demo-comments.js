import { commentsFor } from "./notebook-flows.js";

// User-requested fictional participants for this existing local demo block only.
const exampleBlockId = "530b19c4-ae39-4f6d-8ca6-0d8e2097d94e";
export function addDemoParticipants(books, now = new Date().toISOString()) {
  return books.map((book) => {
    if (
      (book.accessRole || "editor") !== "editor" ||
      !book.findings.some(
        (f) => f.id === exampleBlockId && !f.demoParticipantsAdded,
      )
    )
      return book;
    return {
      ...book,
      findings: book.findings.map((finding) => {
        if (finding.id !== exampleBlockId || finding.demoParticipantsAdded)
          return finding;
        return {
          ...finding,
          demoParticipantsAdded: true,
          comments: [
            ...commentsFor(finding),
            {
              id: "demo-participant-mira",
              author: "Mira (Demo)",
              createdAt: now,
              resolved: false,
              text: "Could we separate the mouse and human results in the comparison? I’d like to see which endpoints are shared between the studies.",
              replies: [
                {
                  id: "demo-participant-alex-reply",
                  author: "Alex (Demo)",
                  createdAt: now,
                  text: "Good point. Let’s keep cell identity, functional maturation and animal outcomes in separate columns.",
                },
              ],
            },
            {
              id: "demo-participant-alex",
              author: "Alex (Demo)",
              createdAt: now,
              resolved: false,
              text: "Please add the delivery method and observation period for each study before we compare the protocols.",
              replies: [],
            },
          ],
        };
      }),
    };
  });
}
