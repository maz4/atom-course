import { Atom } from "effect/unstable/reactivity";

export type IssueStatus = "open" | "in_progress" | "done";

export interface Issue {
  readonly id: string;
  readonly title: string;
  readonly status: IssueStatus;
  readonly assignee: string;
}

export interface StatusCounts {
  readonly open: number;
  readonly in_progress: number;
  readonly done: number;
}

export interface BoardHeader {
  readonly visibleCount: number;
  readonly totalCount: number;
  readonly isFiltered: boolean;
}

// ---------------------------------------------------------------------------
// Provided. Do not change anything above the "Your work starts here" marker.
// ---------------------------------------------------------------------------

export const seedIssues: ReadonlyArray<Issue> = [
  { id: "1", title: "Login fails on Safari", status: "open", assignee: "ada" },
  {
    id: "2",
    title: "Retry the login request",
    status: "in_progress",
    assignee: "grace",
  },
  { id: "3", title: "Ship the changelog", status: "done", assignee: "ada" },
  {
    id: "4",
    title: "Rate limit the login endpoint",
    status: "open",
    assignee: "grace",
  },
];

export const reassignedIssues: ReadonlyArray<Issue> = seedIssues.map((issue) =>
  issue.id === "3" ? { ...issue, assignee: "adam" } : issue
);

export const filterEvaluations = { count: 0 };

export const filterIssues = (
  issues: ReadonlyArray<Issue>,
  assignee: string | null,
  showDone: boolean
): ReadonlyArray<Issue> => {
  filterEvaluations.count++;
  return issues.filter(
    (issue) =>
      (assignee === null || issue.assignee === assignee) &&
      (showDone || issue.status !== "done")
  );
};

export const countByStatus = (issues: ReadonlyArray<Issue>): StatusCounts => ({
  open: issues.filter((issue) => issue.status === "open").length,
  in_progress: issues.filter((issue) => issue.status === "in_progress").length,
  done: issues.filter((issue) => issue.status === "done").length,
});

export const issuesAtom: Atom.Writable<ReadonlyArray<Issue>> =
  Atom.make(seedIssues);

export const assigneeFilterAtom: Atom.Writable<string | null> = Atom.make<
  string | null
>(null);

export const showDoneAtom: Atom.Writable<boolean> = Atom.make(true);

// ---------------------------------------------------------------------------
// Your work starts here.
// ---------------------------------------------------------------------------

// Every atom filters the list on its own, so one change to the inputs runs
// filterIssues three times.

export const visibleIssuesAtom: Atom.Atom<ReadonlyArray<Issue>> = Atom.make(
  (get) =>
    filterIssues(get(issuesAtom), get(assigneeFilterAtom), get(showDoneAtom))
);

export const statusCountsAtom: Atom.Atom<StatusCounts> = Atom.make((get) =>
  countByStatus(get(visibleIssuesAtom))
);

// The header is a fresh object literal on every rebuild, so a list replacement
// notifies its subscribers even when all three fields are unchanged.
export const boardHeaderAtom: Atom.Atom<BoardHeader> = Atom.make(
  (get): BoardHeader => {
    const visible = get(visibleIssuesAtom);
    return {
      visibleCount: visible.length,
      totalCount: get(issuesAtom).length,
      isFiltered: get(assigneeFilterAtom) !== null || !get(showDoneAtom),
    };
  }
).pipe(
  Atom.withEquality(
    (a: BoardHeader, b: BoardHeader) =>
      a.visibleCount === b.visibleCount &&
      a.totalCount === b.totalCount &&
      a.isFiltered === b.isFiltered
  )
);
