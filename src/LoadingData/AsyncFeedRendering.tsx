import { Cause, Effect, Schema, Option } from "effect";
import { AsyncResult, Atom } from "effect/unstable/reactivity";

export interface Issue {
  readonly id: string;
  readonly title: string;
  readonly status: "backlog" | "in-progress" | "done";
}

export class LoadError extends Schema.TaggedError<LoadError>("LoadError")(
  "LoadError",
  {
    message: Schema.String,
  }
) {}

export class RateLimited extends Schema.TaggedError<"RateLimited">(
  "RateLimited"
)("RateLimited", {
  retryAfterSeconds: Schema.Number,
}) {}

export type FeedError = LoadError | RateLimited;

export type FeedView =
  | { readonly _tag: "skeleton" }
  | { readonly _tag: "ready"; readonly rows: ReadonlyArray<Issue> }
  | { readonly _tag: "refreshing"; readonly rows: ReadonlyArray<Issue> }
  | { readonly _tag: "stale"; readonly rows: ReadonlyArray<Issue> }
  | { readonly _tag: "rateLimited"; readonly retryAfterScedonds: number };

let scriptedOutcome: Effect.Effect<
  ReadonlyArray<Issue>,
  FeedError
> = Effect.succeed([]);

const nextMacroTask = Effect.promise(() =>
  new Promise<void>((resolve) => setTimeout(resolve, 0))
);

export const feedSource: {
  readonly fetch: Effect.Effect<ReadonlyArray<Issue>, FeedError>;
  readonly succeedWith: (rows: ReadonlyArray<Issue>) => void
  readonly failWith: (error: FeedError) => void
} = {
  fetch: Effect.suspend(() => {
    const outcome = scriptedOutcome;
    return Effect.flatMap(nextMacroTask, () => outcome)
  }),
   succeedWith: (rows ) => {
    scriptedOutcome= Effect.succeed(rows)
  },
   failWith: (error) => {
    scriptedOutcome = Effect.fail(error)
  },
}

export const feedResultAtom: Atom.Atom<AsyncResult.AsyncResult<ReadonlyArray<Issue>, FeedError>> =
  Atom.make(feedSource.fetch);

/*************/

export const toFeedView = (result: AsyncResult.AsyncResult<ReadonlyArray<Issue>, FeedError>,): FeedView =>
  AsyncResult.builder(result)
    .onErrorTag("RateLimited", (error): FeedView => ({_tag: "rateLimited", retryAfterScedonds: error.retryAfterSeconds}))
    .onInitial((): FeedView => ({ _tag: "skeleton" })) // OK
    .onSuccess((rows, result): FeedView => (result.waiting ? {_tag: "refreshing", rows} :{ _tag: "ready", rows })) // OK?
    .onFailure((cause, failure): FeedView =>
      Option.match(failure.previousSuccess, {
        onNone: () => {throw Cause.squash(cause)},
        onSome: (previous) => ({ _tag: "stale", rows: previous.value })
      })
  )
  .exhaustive()

export const feedViewAtom: Atom.Atom<FeedView> =
  Atom.make((get): FeedView => toFeedView(get(feedResultAtom)))
