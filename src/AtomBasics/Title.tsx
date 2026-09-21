import { useAtom } from "@effect/atom-react";
import { Atom } from "effect/unstable/reactivity";

const savedTitleAtom = Atom.make("Untitled");

const draftTitleAtom = Atom.writable(
  (get) => get(savedTitleAtom),
  (ctx, next: string) => ctx.setSelf(next)
);
const TitleWithDraft = () => {
  const [savedTitle, setSavedTitle] = useAtom(savedTitleAtom);
  const [draftTitle, setDraftTitle] = useAtom(draftTitleAtom);

  return (
    <div>
      <h2>Saved Title: {savedTitle}</h2>
      <label htmlFor="saved">change saved title </label>
      <input
        id="saved"
        type="text"
        value={savedTitle}
        onChange={(e) => setSavedTitle(e.target.value)}
      />

      <h3>Draft Title: {draftTitle}</h3>
      <label htmlFor="draft">change draft </label>
      <input
        id="draft"
        type="text"
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
      />
    </div>
  );
};

export default TitleWithDraft;
