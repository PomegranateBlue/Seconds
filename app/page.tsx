// import { createRoot } from "react-dom/client";
// createRoot는 호출할 필요없음, R3F가 알아서 처리해줌

import Scene from "./components/Scene";

export default function Home() {
  return (
    <main className="bg-zinc-800 w-screen h-screen">
      <Scene />
    </main>
  );
}
