import { EventEmitter } from "pixi.js";

export enum InputState {
  Attack = "attack",
  Idle = "idle",
}

type InputStateEvent = `${InputState}-start` | `${InputState}-end`;

const keyMappings: Record<string, InputState> = {
  Space: InputState.Attack,
};

class InputManager extends EventEmitter<InputStateEvent> {
  state: Map<InputState, boolean>;

  constructor() {
    super();

    this.state = new Map();

    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleKeyDown(event: KeyboardEvent) {
    if (Object.hasOwn(keyMappings, event.code)) {
      this.toggleState(keyMappings[event.code], true);
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    if (Object.hasOwn(keyMappings, event.code)) {
      this.toggleState(keyMappings[event.code], false);
    }
  }

  toggleState(inputState: InputState, value: boolean) {
    this.state.set(inputState, value);
    const eventName = `${inputState}-${
      value ? "start" : "end"
    }` as InputStateEvent;

    this.emit(eventName);
  }
}

const manager = new InputManager();

export default manager;
