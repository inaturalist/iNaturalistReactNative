interface IdleRequestOptions {
  timeout?: number;
}

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): number;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

declare function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number;

declare function cancelIdleCallback(handle: number): void;
