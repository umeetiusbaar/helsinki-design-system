import { User } from 'oidc-client-ts';

import { Beacon, Disposer, Signal, SignalListener } from '../beacon/beacon';
import {
  eventSignalType,
  EventSignal,
  StateChangeSignal,
  StateChangeSignalPayload,
  stateChangeSignalType,
  createStateChangeTrigger,
} from '../beacon/signals';
import { oidcClientNamespace, OidcClientEvent } from './index';

export type OidcClientEventSignal = EventSignal & {
  payload: {
    type: OidcClientEvent;
    data?: User | null;
  };
};

export function getOidcClientStateChangePayload(signal: Signal): StateChangeSignalPayload | null {
  if (signal.type !== stateChangeSignalType || !signal.payload || signal.namespace !== oidcClientNamespace) {
    return null;
  }
  return (signal as StateChangeSignal).payload as StateChangeSignalPayload;
}

export function createOidcClientEventTrigger(): Pick<Signal, 'namespace'> & { type: EventSignal['type'] } {
  return {
    type: eventSignalType,
    namespace: oidcClientNamespace,
  };
}

export function addStateChangeSignalListener(beacon: Beacon, listener: (signal: StateChangeSignal) => void): Disposer {
  const trigger = createStateChangeTrigger(oidcClientNamespace);
  return beacon.addListener(trigger, listener as SignalListener);
}

export function isStateChangeSignal(signal: Signal) {
  return signal.type === stateChangeSignalType;
}

export function createOidcClientStateChangeSignal(payload: StateChangeSignalPayload): StateChangeSignal {
  return {
    ...createStateChangeTrigger(oidcClientNamespace),
    payload,
  } as StateChangeSignal;
}
