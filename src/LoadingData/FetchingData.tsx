import { useAtomValue } from "@effect/atom-react";
import { Cause, Effect, Schema } from "effect";
import { ReadonlyArray } from "effect/Array";
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
    // return fixtures;
    return yield* new LoadError({ message: "Something went wrong" });
  }
);

const issuesAtom = Atom.make(fetchIssues);

const Skeleton = () => null;

const IssuesList = () => {
  const value = AsyncResult.getOrThrow(useAtomValue(issuesAtom));
  return null;
};

const ErrorBanner = (props: { readonly cause: Cause.Cause<LoadError> }) => {
  return Cause.pretty(props.cause);
};

const Feed = () => {
  const result = useAtomValue(issuesAtom);

  switch (result._tag) {
    case "Initial":
      return <Skeleton />;
    case "Failure":
      return <ErrorBanner cause={result.cause} />;
    default:
      return <IssuesList />;
  }
};

const registry = AtomRegistry.make();
registry.subscribe(issuesAtom, (result) => console.log(result), {
  immediate: true,
});

export default Feed;
