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
/**
 * - 事件派发接口。
 * DragonBones 的事件派发通常依赖于对接的引擎来实现，该接口定义了对接引擎时需要实现的事件方法。
 * @version DragonBones 4.5
 * @language zh_CN
 */
export interface IEventDispatcher {
  /**
   * - Checks whether the object has any listeners registered for a specific type of event。
   * @param type - Event type.
   * @version DragonBones 4.5
   * @language en_US
   */
  /**
   * - 检查是否为特定的事件类型注册了任何侦听器。
   * @param type - 事件类型。
   * @version DragonBones 4.5
   * @language zh_CN
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
  /**
   * - 分派特定的事件到事件流中。
   * @param type - 事件类型。
   * @param eventObject - 事件数据。
   * @see dragonBones.EventObject
   * @version DragonBones 4.5
   * @language zh_CN
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
  /**
   * - 添加特定事件类型的事件侦听器，以使侦听器能够接收事件通知。
   * @param type - 事件类型。
   * @param listener - 事件侦听器。
   * @param thisObject - 侦听函数绑定的 this 对象。
   * @version DragonBones 4.5
   * @language zh_CN
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
  /**
   * - 删除特定事件类型的侦听器。
   * @param type - 事件类型。
   * @param listener - 事件侦听器。
   * @param thisObject - 侦听函数绑定的 this 对象。
   * @version DragonBones 4.5
   * @language zh_CN
   */
  removeDBEventListener(
    type: EventStringType,
    listener: Function,
    thisObject: any
  ): void;
}
