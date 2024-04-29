import { IEventDispatcher } from "../event/IEventDispatcher";
import { Armature } from "./Armature";
import { Animation } from "../../dragonBones/animation/Animation";

/**
 * - The armature proxy interface, the docking engine needs to implement it concretely.
 * @see dragonBones.Armature
 * @version DragonBones 5.0
 * @language en_US
 */
export interface IArmatureProxy extends IEventDispatcher {
  /**
   * @internal
   */
  dbInit(armature: Armature): void;
  /**
   * @internal
   */
  dbClear(): void;
  /**
   * @internal
   */
  dbUpdate(): void;
  /**
   * - Dispose the instance and the Armature instance. (The Armature instance will return to the object pool)
   * @example
   * <pre>
   *     removeChild(armatureDisplay);
   *     armatureDisplay.dispose();
   * </pre>
   * @version DragonBones 4.5
   * @language en_US
   */
  dispose(disposeProxy: boolean): void;
  /**
   * - The armature.
   * @version DragonBones 4.5
   * @language en_US
   */
  readonly armature: Armature;
  /**
   * - The animation player.
   * @version DragonBones 3.0
   * @language en_US
   */
  readonly animation: Animation;
}
