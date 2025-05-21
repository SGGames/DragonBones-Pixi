import { BaseObject } from "../core/BaseObject";
import { AnimationFadeOutMode, TweenType } from "../core/DragonBones";

/**
 * - The animation config is used to describe all the information needed to play an animation state.
 * The API is still in the experimental phase and may encounter bugs or stability or compatibility issues when used.
 * @see dragonBones.AnimationState
 * @beta
 * @version DragonBones 5.0
 * @language en_US
 */
export class AnimationConfig extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.AnimationConfig]";
  }
  /**
   * @private
   */
  public pauseFadeOut: boolean;
  /**
   * - Fade out the pattern of other animation states when the animation state is fade in.
   * This property is typically used to specify the substitution of multiple animation states blend.
   * @default dragonBones.AnimationFadeOutMode.All
   * @version DragonBones 5.0
   * @language en_US
   */
  public fadeOutMode: AnimationFadeOutMode;
  /**
   * @private
   */
  public fadeOutTweenType: TweenType;
  /**
   * @private
   */
  public fadeOutTime: number;
  /**
   * @private
   */
  public pauseFadeIn: boolean;
  /**
   * @private
   */
  public actionEnabled: boolean;
  /**
   * @private
   */
  public additive: boolean;
  /**
   * - Whether the animation state has control over the display property of the slots.
   * Sometimes blend a animation state does not want it to control the display properties of the slots,
   * especially if other animation state are controlling the display properties of the slots.
   * @default true
   * @version DragonBones 5.0
   * @language en_US
   */
  public displayControl: boolean;
  /**
   * - Whether to reset the objects without animation to the armature pose when the animation state is start to play.
   * This property should usually be set to false when blend multiple animation states.
   * @default true
   * @version DragonBones 5.1
   * @language en_US
   */
  public resetToPose: boolean;
  /**
   * @private
   */
  public fadeInTweenType: TweenType;
  /**
   * - The play times. [0: Loop play, [1~N]: Play N times]
   * @version DragonBones 3.0
   * @language en_US
   */
  public playTimes: number;
  /**
   * - The blend layer.
   * High layer animation state will get the blend weight first.
   * When the blend weight is assigned more than 1, the remaining animation states will no longer get the weight assigned.
   * @readonly
   * @version DragonBones 5.0
   * @language en_US
   */
  public layer: number;
  /**
   * - The start time of play. (In seconds)
   * @default 0.0
   * @version DragonBones 5.0
   * @language en_US
   */
  public position: number;
  /**
   * - The duration of play.
   * [-1: Use the default value of the animation data, 0: Stop play, (0~N]: The duration] (In seconds)
   * @default -1.0
   * @version DragonBones 5.0
   * @language en_US
   */
  public duration: number;
  /**
   * - The play speed.
   * The value is an overlay relationship with {@link dragonBones.Animation#timeScale}.
   * [(-N~0): Reverse play, 0: Stop play, (0~1): Slow play, 1: Normal play, (1~N): Fast play]
   * @default 1.0
   * @version DragonBones 3.0
   * @language en_US
   */
  public timeScale: number;
  /**
   * - The blend weight.
   * @default 1.0
   * @version DragonBones 5.0
   * @language en_US
   */
  public weight: number;
  /**
   * - The fade in time.
   * [-1: Use the default value of the animation data, [0~N]: The fade in time] (In seconds)
   * @default -1.0
   * @version DragonBones 5.0
   * @language en_US
   */
  public fadeInTime: number;
  /**
   * - The auto fade out time when the animation state play completed.
   * [-1: Do not fade out automatically, [0~N]: The fade out time] (In seconds)
   * @default -1.0
   * @version DragonBones 5.0
   * @language en_US
   */
  public autoFadeOutTime: number;
  /**
   * - The name of the animation state. (Can be different from the name of the animation data)
   * @version DragonBones 5.0
   * @language en_US
   */
  public name: string;
  /**
   * - The animation data name.
   * @version DragonBones 5.0
   * @language en_US
   */
  public animation: string;
  /**
   * - The blend group name of the animation state.
   * This property is typically used to specify the substitution of multiple animation states blend.
   * @readonly
   * @version DragonBones 5.0
   * @language en_US
   */
  public group: string;
  /**
   * @private
   */
  public readonly boneMask: Array<string> = [];

  protected _onClear(): void {
    this.pauseFadeOut = true;
    this.fadeOutMode = AnimationFadeOutMode.All;
    this.fadeOutTweenType = TweenType.Line;
    this.fadeOutTime = -1.0;

    this.actionEnabled = true;
    this.additive = false;
    this.displayControl = true;
    this.pauseFadeIn = true;
    this.resetToPose = true;
    this.fadeInTweenType = TweenType.Line;
    this.playTimes = -1;
    this.layer = 0;
    this.position = 0.0;
    this.duration = -1.0;
    this.timeScale = -100.0;
    this.weight = 1.0;
    this.fadeInTime = -1.0;
    this.autoFadeOutTime = -1.0;
    this.name = "";
    this.animation = "";
    this.group = "";
    this.boneMask.length = 0;
  }
  /**
   * @private
   */
  public clear(): void {
    this._onClear();
  }
  /**
   * @private
   */
  public copyFrom(value: AnimationConfig): void {
    this.pauseFadeOut = value.pauseFadeOut;
    this.fadeOutMode = value.fadeOutMode;
    this.autoFadeOutTime = value.autoFadeOutTime;
    this.fadeOutTweenType = value.fadeOutTweenType;

    this.actionEnabled = value.actionEnabled;
    this.additive = value.additive;
    this.displayControl = value.displayControl;
    this.pauseFadeIn = value.pauseFadeIn;
    this.resetToPose = value.resetToPose;
    this.playTimes = value.playTimes;
    this.layer = value.layer;
    this.position = value.position;
    this.duration = value.duration;
    this.timeScale = value.timeScale;
    this.fadeInTime = value.fadeInTime;
    this.fadeOutTime = value.fadeOutTime;
    this.fadeInTweenType = value.fadeInTweenType;
    this.weight = value.weight;
    this.name = value.name;
    this.animation = value.animation;
    this.group = value.group;

    this.boneMask.length = value.boneMask.length;
    for (let i = 0, l = this.boneMask.length; i < l; ++i) {
      this.boneMask[i] = value.boneMask[i];
    }
  }
}
