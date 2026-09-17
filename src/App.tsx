import { useAtomValue } from "@effect/atom-react";
import "./App.css";
import { Atom } from "effect/unstable/reactivity";

const messageAtom = Atom.make("Effect Atom is ready");
function App() {
  const message = useAtomValue(messageAtom);
  return <>{message}</>;
}

export default App;
