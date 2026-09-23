import { useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/unstable/reactivity";

import AtomBasics from "./AtomBasics";
import "./App.css";
import Feed from "./LoadingData/FetchingData";

const messageAtom = Atom.make("Effect Atom is ready");

function App() {
  const message = useAtomValue(messageAtom);
  return (
    <div>
      <p>{message}</p>
      {/* <AtomBasics /> */}
      <Feed />
    </div>
  );
}

export default App;

/***/
