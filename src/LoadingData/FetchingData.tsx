import { useAtomValue } from "@effect/atom-react";
import { Cause, Effect, Schema, Option } from "effect";
import { constNull } from "effect/Function";
import { AsyncResult, Atom, AtomRegistry } from "effect/unstable/reactivity";

class LoadError extends Schema.TaggedError<LoadError>("LoadError")(
  "LoadError",
  {
    message: Schema.String,
  }
) {}

class Issue extends Schema.Opaque<Issue>()(
  Schema.Struct({
    id: Schema.String,
    title: Schema.String,
    status: Schema.Literal(["backlog", "in-progress", "done"]),
  })
) {}

const fixtures: ReadonlyArray<Issue> = [
  { id: "ISS-1", title: "Board flickers on refresh", status: "backlog" },
  { id: "ISS-2", title: "Search resets the filter", status: "in-progress" },
];

const fetchIssues: Effect.Effect<ReadonlyArray<Issue>, LoadError> = Effect.gen(
  function* () {
    yield* Effect.sleep("400 millis");
    return fixtures;
    // return yield* new LoadError({ message: "Something went wrong" });
  }
);

const issuesAtom = Atom.make(fetchIssues);

const Skeleton = () => <p>SKELETON</p>;

interface IssuesListProps {
  /** Dimme the list wehn loading data */
  dimmed: boolean;
}

// mapper to get the memorised value of waiting key
const getWaitingFlag = (result: AsyncResult.AsyncResult<unknown, unknown>) =>
  result.waiting;

const IssuesList = (props: IssuesListProps) => {
  const isWaiting = useAtomValue(issuesAtom, getWaitingFlag);
  const value = AsyncResult.getOrThrow(useAtomValue(issuesAtom));

  console.log({ props, value, isWaiting });

  if (isWaiting) {
    return <p>LOADING...</p>;
  }

  return (
    <div>
      <p>IssuesList Component</p>
      {value.map((row) => (
        <div key={row.id}>
          {row.title} | {row.status.toString()}
        </div>
      ))}
    </div>
  );
};

const ErrorBanner = (props: { readonly cause: Cause.Cause<LoadError> }) => {
  return Cause.pretty(props.cause);
};

interface StaleListProps {
  rows: Issue[];
  cause: string;
}
const StaleList = ({ rows, cause }: StaleListProps) => {
  return (
    <div>
      <p>{cause}</p>
      {rows.map((row) => (
        <div key={row.id}>
          <p>{row.id}</p>
          <p>{row.title}</p>
          <p>{row.status.toString()}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * Handeled case by the builder
 * onDefect receives the defect.
 * onError receives the typed error, which is LoadError here. With more than one error in the effect it would be the union.
 * onErrorIf takes a refinement, and onErrorTag takes one tag or an array of tags.
 * onFailure receives the cause itself.
 * onInitial receives the result, so it can check waiting.
 * onInitialOrWaiting, onInterrupt, onSuccess, and onWaiting.
 * orElse and orNull end the chain.
 */

const Feed = () => {
  const result = useAtomValue(issuesAtom);

  return (
    AsyncResult.builder(result)
      // .onInitial(() => <Skeleton />)
      .onInitial(() => constNull)
      .onSuccess((_, result) => <IssuesList dimmed={result.waiting} />)
      .onErrorTag("LoadError", () => <p>Custom message</p>)
      // .onFailure((cause) => <ErrorBanner cause={cause} />)
      .onFailure((cause, failure) =>
        Option.match(failure.previousSuccess, {
          onNone: () => <ErrorBanner cause={cause} />,
          onSome: (previous) => (
            <StaleList rows={previous.value} cause={cause.toString()} />
          ),
        })
      )
      .exhaustive() // best when using Agents to make sure the list of exustive options are provided
    // .orNull()
  );
};

const registry = AtomRegistry.make();
registry.subscribe(issuesAtom, (result) => console.log(result), {
  immediate: true,
});

export default Feed;
