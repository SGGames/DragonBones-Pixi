import { EventObject } from "./EventObject";

/**
 * @private
 */
export type EventStringType =
  | string
  | "start"
  | "loopComplete"
  | "complete"
  | "fadeIn"
  | "fadeInComplete"
  | "fadeOut"
  | "fadeOutComplete"
  | "frameEvent"
  | "soundEvent";
/**
 * - The event dispatcher interface.
 * Dragonbones event dispatch usually relies on docking engine to implement, which defines the event method to be implemented when docking the engine.
 * @version DragonBones 4.5
 * @language en_US
 */
export interface IEventDispatcher {
  /**
   * - Checks whether the object has any listeners registered for a specific type of event。
   * @param type - Event type.
   * @version DragonBones 4.5
   * @language en_US
   */
  hasDBEventListener(type: EventStringType): boolean;
  /**
   * - Dispatches an event into the event flow.
   * @param type - Event type.
   * @param eventObject - Event object.
   * @see dragonBones.EventObject
   * @version DragonBones 4.5
   * @language en_US
   */
  dispatchDBEvent(type: EventStringType, eventObject: EventObject): void;
  /**
   * - Add an event listener object so that the listener receives notification of an event.
   * @param type - Event type.
   * @param listener - Event listener.
   * @param thisObject - The listener function's "this".
   * @version DragonBones 4.5
   * @language en_US
   */
  addDBEventListener(
    type: EventStringType,
    listener: Function,
    thisObject: any
  ): void;
  /**
   * - Removes a listener from the object.
   * @param type - Event type.
   * @param listener - Event listener.
   * @param thisObject - The listener function's "this".
   * @version DragonBones 4.5
   * @language en_US
   */
  removeDBEventListener(
    type: EventStringType,
    listener: Function,
    thisObject: any
  ): void;
}
