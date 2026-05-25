export class ValueState<T> {
  #value: T = $state()!;
  onchange: (value: T) => void;
  constructor(config: { value: T; onchange?: (_value: T) => void }) {
    this.#value = config.value;
    this.onchange = config.onchange ?? (() => { });
  }

  get value() {
    return this.#value;
  }

  set value(v: T) {
    this.#value = v;
    this.onchange?.(v);
  }
}

export class TextState extends ValueState<string> {
  constructor(config: { value: string; onchange?: (_value: string) => void }) {
    super(config);
  }

  clear = () => {
    this.value = "";
  };
}

export class RefreshState<T> extends ValueState<T> {
  refresh: (value: T) => void;
  constructor(config: {
    value: T;
    refresh: (_value: T) => void;
    onchange?: (_value: T) => void;
  }) {
    super(config);
    this.refresh = config.refresh;
  }
}

export class RefreshListState<T> extends RefreshState<T[]> {
  constructor(config: {
    value: T[];
    refresh: (_value: T[]) => void;
    onchange?: (_value: T[]) => void;
  }) {
    super(config);
  }

  add = (item: T) => {
    this.value = [...this.value, item];
  };
}

export class OpenState {
  #active = $state(false);
  onchange: (value: boolean) => void;

  constructor(config?: {
    value?: boolean;
    onchange?: (_open: boolean) => void;
  }) {
    this.onchange = config?.onchange ?? (() => { });
    this.#active = config?.value ?? false;
  }

  get active() {
    return this.#active;
  }

  set active(open) {
    this.#active = open;
    this.onchange(open);
  }

  open = () => {
    this.#active = true;
    this.onchange(true);
  };

  close = () => {
    this.#active = false;
    this.onchange(false);
  };
}

export class OpenedObject<T> {
  #value: T = $state()!;
  #active: boolean = $state(false);
  onvaluechange: (_: T) => void;
  onopenchange: (_: boolean) => void;

  constructor(config: {
    value: T;
    onvaluechange?: (_: T) => void;
    onopenchange?: (_: boolean) => void;
  }) {
    this.#value = config.value;
    this.onvaluechange = config?.onvaluechange ?? (() => { });
    this.onopenchange = config?.onopenchange ?? (() => { });
  }

  get value(): T {
    return this.#value;
  }

  set value(v: T) {
    this.#value = v;
    this.onvaluechange?.(v);
  }

  get active(): boolean {
    return this.#active;
  }

  set active(v: boolean) {
    this.#active = v;
    this.onopenchange?.(v);
  }

  set(v: T) {
    this.#value = v;
    this.onvaluechange?.(v);
  }

  open = () => {
    this.#active = true;
    this.onopenchange?.(true);
  };

  close = () => {
    this.#active = false;
    this.onopenchange?.(false);
    this.onvaluechange?.(this.#value);
  };
}
