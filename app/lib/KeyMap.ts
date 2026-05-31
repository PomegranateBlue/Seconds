type Entry = {
  name: "forward" | "backward" | "left" | "right";
  keys: string[];
};

export const KeyboardMap: Entry[] = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
];

export type ControlName = Entry["name"];
