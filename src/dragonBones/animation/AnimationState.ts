import { BaseObject } from "../core/BaseObject";
import {
  AnimationBlendType,
  TimelineType,
  BoneType,
} from "../core/DragonBones";
import { EventObject } from "../event/EventObject";
import { AnimationConfig } from "../model/AnimationConfig";
import {
  AnimationData,
  TimelineData,
  AnimationTimelineData,
} from "../model/AnimationData";
import { TimelineState } from "./BaseTimelineState";
import {
  ActionTimelineState,
  ZOrderTimelineState,
  IKConstraintTimelineState,
  BoneAllTimelineState,
  BoneTranslateTimelineState,
  BoneRotateTimelineState,
  BoneScaleTimelineState,
  AlphaTimelineState,
  SurfaceTimelineState,
  SlotDisplayTimelineState,
  SlotZIndexTimelineState,
  SlotColorTimelineState,
  DeformTimelineState,
  AnimationProgressTimelineState,
  AnimationWeightTimelineState,
  AnimationParametersTimelineState,
} from "./TimelineState";
import { Map } from "../core/DragonBones";
import { Armature } from "../armature/Armature";
import { Bone } from "../armature/Bone";
import { Slot } from "../armature/Slot";

/**
 * - The animation state is generated when the animation data is played.
 * @see dragonBones.Animation
 * @see dragonBones.AnimationData
 * @version DragonBones 3.0
 * @language en_US
 */
export class AnimationState extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.AnimationState]";
  }
  /**
   * @private
   */
  public actionEnabled: boolean;
  /**
   * @private
   */
  public additive: boolean;
  /**
   * - Whether the animation state has control over the display object properties of the slots.
   * Sometimes blend a animation state does not want it to control the display object properties of the slots,
   * especially if other animation state are controlling the display object properties of the slots.
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
  public blendType: AnimationBlendType;
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
   * - The play speed.
   * The value is an overlay relationship with {@link dragonBones.Animation#timeScale}.
   * [(-N~0): Reverse play, 0: Stop play, (0~1): Slow play, 1: Normal play, (1~N): Fast play]
   * @default 1.0
   * @version DragonBones 3.0
   * @language en_US
   */
  public timeScale: number;
  /**
   * @private
   */
  public parameterX: number;
  /**
   * @private
   */
  public parameterY: number;
  /**
   * @private
   */
  public positionX: number;
  /**
   * @private
   */
  public positionY: number;
  /**
   * - The auto fade out time when the animation state play completed.
   * [-1: Do not fade out automatically, [0~N]: The fade out time] (In seconds)
   * @default -1.0
   * @version DragonBones 5.0
   * @language en_US
   */
  public autoFadeOutTime: number;
  /**
   * @private
   */
  public fadeTotalTime: number;
  /**
   * - The name of the animation state. (Can be different from the name of the animation data)
   * @readonly
   * @version DragonBones 5.0
   * @language en_US
   */
  public name: string;
  /**
   * - The blend group name of the animation state.
   * This property is typically used to specify the substitution of multiple animation states blend.
   * @readonly
   * @version DragonBones 5.0
   * @language en_US
   */
  public group: string;
  private _timelineDirty: number;
  /**
   * - xx: Play Enabled, Fade Play Enabled
   * @internal
   */
  public _playheadState: number;
  /**
   * -1: Fade in, 0: Fade complete, 1: Fade out;
   * @internal
   */
  public _fadeState: number;
  /**
   * -1: Fade start, 0: Fading, 1: Fade complete;
   * @internal
   */
  public _subFadeState: number;
  /**
   * @internal
   */
  public _position: number;
  /**
   * @internal
   */
  public _duration: number;
  private _weight: number;
  private _fadeTime: number;
  private _time: number;
  /**
   * @internal
   */
  public _fadeProgress: number;
  /**
   * @internal
   */
  public _weightResult: number;
  private readonly _boneMask: Array<string> = [];
  private readonly _boneTimelines: Array<TimelineState> = [];
  private readonly _boneBlendTimelines: Array<TimelineState> = [];
  private readonly _slotTimelines: Array<TimelineState> = [];
  private readonly _slotBlendTimelines: Array<TimelineState> = [];
  private readonly _constraintTimelines: Array<TimelineState> = [];
  private readonly _animationTimelines: Array<TimelineState> = [];
  private readonly _poseTimelines: Array<TimelineState> = [];
  private _animationData: AnimationData;
  private _armature: Armature;
  /**
   * @internal
   */
  public _actionTimeline: ActionTimelineState = null as any; // Initial value.
  private _zOrderTimeline: ZOrderTimelineState | null = null; // Initial value.
  private _activeChildA: AnimationState | null;
  private _activeChildB: AnimationState | null;
  /**
   * @internal
   */
  public _parent: AnimationState | null;

  protected _onClear(): void {
    for (const timeline of this._boneTimelines) {
      timeline.returnToPool();
    }

    for (const timeline of this._boneBlendTimelines) {
      timeline.returnToPool();
    }

    for (const timeline of this._slotTimelines) {
      timeline.returnToPool();
    }

    for (const timeline of this._slotBlendTimelines) {
      timeline.returnToPool();
    }

    for (const timeline of this._constraintTimelines) {
      timeline.returnToPool();
    }

    for (const timeline of this._animationTimelines) {
      const animationState = timeline.target as AnimationState;
      if (animationState._parent === this) {
        animationState._fadeState = 1;
        animationState._subFadeState = 1;
        animationState._parent = null;
      }

      timeline.returnToPool();
    }

    if (this._actionTimeline !== null) {
      this._actionTimeline.returnToPool();
    }

    if (this._zOrderTimeline !== null) {
      this._zOrderTimeline.returnToPool();
    }

    this.actionEnabled = false;
    this.additive = false;
    this.displayControl = false;
    this.resetToPose = false;
    this.blendType = AnimationBlendType.None;
    this.playTimes = 1;
    this.layer = 0;
    this.timeScale = 1.0;
    this._weight = 1.0;
    this.parameterX = 0.0;
    this.parameterY = 0.0;
    this.positionX = 0.0;
    this.positionY = 0.0;
    this.autoFadeOutTime = 0.0;
    this.fadeTotalTime = 0.0;
    this.name = "";
    this.group = "";

    this._timelineDirty = 2;
    this._playheadState = 0;
    this._fadeState = -1;
    this._subFadeState = -1;
    this._position = 0.0;
    this._duration = 0.0;
    this._fadeTime = 0.0;
    this._time = 0.0;
    this._fadeProgress = 0.0;
    this._weightResult = 0.0;
    this._boneMask.length = 0;
    this._boneTimelines.length = 0;
    this._boneBlendTimelines.length = 0;
    this._slotTimelines.length = 0;
    this._slotBlendTimelines.length = 0;
    this._constraintTimelines.length = 0;
    this._animationTimelines.length = 0;
    this._poseTimelines.length = 0;
    // this._bonePoses.clear();
    this._animationData = null as any; //
    this._armature = null as any; //
    this._actionTimeline = null as any; //
    this._zOrderTimeline = null;
    this._activeChildA = null;
    this._activeChildB = null;
    this._parent = null;
  }

  private _updateTimelines(): void {
    {
      // Update constraint timelines.
      for (const constraint of this._armature._constraints) {
        const timelineDatas = this._animationData.getConstraintTimelines(
          constraint.name
        );

        if (timelineDatas !== null) {
          for (const timelineData of timelineDatas) {
            switch (timelineData.type) {
              case TimelineType.IKConstraint: {
                const timeline = BaseObject.borrowObject(
                  IKConstraintTimelineState
                );
                timeline.target = constraint;
                timeline.init(this._armature, this, timelineData);
                this._constraintTimelines.push(timeline);
                break;
              }

              default:
                break;
            }
          }
        } else if (this.resetToPose) {
          // Pose timeline.
          const timeline = BaseObject.borrowObject(IKConstraintTimelineState);
          timeline.target = constraint;
          timeline.init(this._armature, this, null);
          this._constraintTimelines.push(timeline);
          this._poseTimelines.push(timeline);
        }
      }
    }
  }

  private _updateBoneAndSlotTimelines(): void {
    {
      // Update bone and surface timelines.
      const boneTimelines: Map<Array<TimelineState>> = {};
      // Create bone timelines map.
      for (const timeline of this._boneTimelines) {
        const timelineName = ((timeline.target as BlendState).target as Bone)
          .name;
        if (!(timelineName in boneTimelines)) {
          boneTimelines[timelineName] = [];
        }

        boneTimelines[timelineName].push(timeline);
      }

      for (const timeline of this._boneBlendTimelines) {
        const timelineName = ((timeline.target as BlendState).target as Bone)
          .name;
        if (!(timelineName in boneTimelines)) {
          boneTimelines[timelineName] = [];
        }

        boneTimelines[timelineName].push(timeline);
      }
      //
      for (const bone of this._armature.getBones()) {
        const timelineName = bone.name;
        if (!this.containsBoneMask(timelineName)) {
          continue;
        }

        if (timelineName in boneTimelines) {
          // Remove bone timeline from map.
          delete boneTimelines[timelineName];
        } else {
          // Create new bone timeline.
          const timelineDatas =
            this._animationData.getBoneTimelines(timelineName);
          const blendState = this._armature.animation.getBlendState(
            BlendState.BONE_TRANSFORM,
            bone.name,
            bone
          );

          if (timelineDatas !== null) {
            for (const timelineData of timelineDatas) {
              switch (timelineData.type) {
                case TimelineType.BoneAll: {
                  const timeline =
                    BaseObject.borrowObject(BoneAllTimelineState);
                  timeline.target = blendState;
                  timeline.init(this._armature, this, timelineData);
                  this._boneTimelines.push(timeline);
                  break;
                }

                case TimelineType.BoneTranslate: {
                  const timeline = BaseObject.borrowObject(
                    BoneTranslateTimelineState
                  );
                  timeline.target = blendState;
                  timeline.init(this._armature, this, timelineData);
                  this._boneTimelines.push(timeline);
                  break;
                }

                case TimelineType.BoneRotate: {
                  const timeline = BaseObject.borrowObject(
                    BoneRotateTimelineState
                  );
                  timeline.target = blendState;
                  timeline.init(this._armature, this, timelineData);
                  this._boneTimelines.push(timeline);
                  break;
                }

                case TimelineType.BoneScale: {
                  const timeline = BaseObject.borrowObject(
                    BoneScaleTimelineState
                  );
                  timeline.target = blendState;
                  timeline.init(this._armature, this, timelineData);
                  this._boneTimelines.push(timeline);
                  break;
                }

                case TimelineType.BoneAlpha: {
                  const timeline = BaseObject.borrowObject(AlphaTimelineState);
                  timeline.target = this._armature.animation.getBlendState(
                    BlendState.BONE_ALPHA,
                    bone.name,
                    bone
                  );
                  timeline.init(this._armature, this, timelineData);
                  this._boneBlendTimelines.push(timeline);
                  break;
                }

                case TimelineType.Surface: {
                  const timeline =
                    BaseObject.borrowObject(SurfaceTimelineState);
                  timeline.target = this._armature.animation.getBlendState(
                    BlendState.SURFACE,
                    bone.name,
                    bone
                  );
                  timeline.init(this._armature, this, timelineData);
                  this._boneBlendTimelines.push(timeline);
                  break;
                }

                default:
                  break;
              }
            }
          } else if (this.resetToPose) {
            // Pose timeline.
            if (bone._boneData.type === BoneType.Bone) {
              const timeline = BaseObject.borrowObject(BoneAllTimelineState);
              timeline.target = blendState;
              timeline.init(this._armature, this, null);
              this._boneTimelines.push(timeline);
              this._poseTimelines.push(timeline);
            } else {
              const timeline = BaseObject.borrowObject(SurfaceTimelineState);
              timeline.target = this._armature.animation.getBlendState(
                BlendState.SURFACE,
                bone.name,
                bone
              );
              timeline.init(this._armature, this, null);
              this._boneBlendTimelines.push(timeline);
              this._poseTimelines.push(timeline);
            }
          }
        }
      }

      for (let k in boneTimelines) {
        // Remove bone timelines.
        for (const timeline of boneTimelines[k]) {
          let index = this._boneTimelines.indexOf(timeline);
          if (index >= 0) {
            this._boneTimelines.splice(index, 1);
            timeline.returnToPool();
          }

          index = this._boneBlendTimelines.indexOf(timeline);
          if (index >= 0) {
            this._boneBlendTimelines.splice(index, 1);
            timeline.returnToPool();
          }
        }
      }
    }

    {
      // Update slot timelines.
      const slotTimelines: Map<Array<TimelineState>> = {};
      const ffdFlags: Array<number> = [];
      // Create slot timelines map.
      for (const timeline of this._slotTimelines) {
        const timelineName = (timeline.target as Slot).name;
        if (!(timelineName in slotTimelines)) {
          slotTimelines[timelineName] = [];
        }

        slotTimelines[timelineName].push(timeline);
      }

      for (const timeline of this._slotBlendTimelines) {
        const timelineName = ((timeline.target as BlendState).target as Slot)
          .name;
        if (!(timelineName in slotTimelines)) {
          slotTimelines[timelineName] = [];
        }

        slotTimelines[timelineName].push(timeline);
      }
      //
      for (const slot of this._armature.getSlots()) {
        const boneName = slot.parent.name;
        if (!this.containsBoneMask(boneName)) {
          continue;
        }

        const timelineName = slot.name;
        if (timelineName in slotTimelines) {
          // Remove slot timeline from map.
          delete slotTimelines[timelineName];
        } else {
          // Create new slot timeline.
          let displayIndexFlag = false;
          let colorFlag = false;
          ffdFlags.length = 0;

          const timelineDatas =
            this._animationData.getSlotTimelines(timelineName);
          if (timelineDatas !== null) {
            for (const timelineData of timelineDatas) {
              switch (timelineData.type) {
                case TimelineType.SlotDisplay: {
                  const timeline = BaseObject.borrowObject(
                    SlotDisplayTimelineState
                  );
                  timeline.target = slot;
                  timeline.init(this._armature, this, timelineData);
                  this._slotTimelines.push(timeline);
                  displayIndexFlag = true;
                  break;
                }

                case TimelineType.SlotZIndex: {
                  const timeline = BaseObject.borrowObject(
                    SlotZIndexTimelineState
                  );
                  timeline.target = this._armature.animation.getBlendState(
                    BlendState.SLOT_Z_INDEX,
                    slot.name,
                    slot
                  );
                  timeline.init(this._armature, this, timelineData);
                  this._slotBlendTimelines.push(timeline);
                  break;
                }

                case TimelineType.SlotColor: {
                  const timeline = BaseObject.borrowObject(
                    SlotColorTimelineState
                  );
                  timeline.target = slot;
                  timeline.init(this._armature, this, timelineData);
                  this._slotTimelines.push(timeline);
                  colorFlag = true;
                  break;
                }

                case TimelineType.SlotDeform: {
                  const timeline = BaseObject.borrowObject(DeformTimelineState);
                  timeline.target = this._armature.animation.getBlendState(
                    BlendState.SLOT_DEFORM,
                    slot.name,
                    slot
                  );
                  timeline.init(this._armature, this, timelineData);

                  if (timeline.target !== null) {
                    this._slotBlendTimelines.push(timeline);
                    ffdFlags.push(timeline.geometryOffset);
                  } else {
                    timeline.returnToPool();
                  }
                  break;
                }

                case TimelineType.SlotAlpha: {
                  const timeline = BaseObject.borrowObject(AlphaTimelineState);
                  timeline.target = this._armature.animation.getBlendState(
                    BlendState.SLOT_ALPHA,
                    slot.name,
                    slot
                  );
                  timeline.init(this._armature, this, timelineData);
                  this._slotBlendTimelines.push(timeline);
                  break;
                }

                default:
                  break;
              }
            }
          }

          if (this.resetToPose) {
            // Pose timeline.
            if (!displayIndexFlag) {
              const timeline = BaseObject.borrowObject(
                SlotDisplayTimelineState
              );
              timeline.target = slot;
              timeline.init(this._armature, this, null);
              this._slotTimelines.push(timeline);
              this._poseTimelines.push(timeline);
            }

            if (!colorFlag) {
              const timeline = BaseObject.borrowObject(SlotColorTimelineState);
              timeline.target = slot;
              timeline.init(this._armature, this, null);
              this._slotTimelines.push(timeline);
              this._poseTimelines.push(timeline);
            }

            for (let i = 0, l = slot.displayFrameCount; i < l; ++i) {
              const displayFrame = slot.getDisplayFrameAt(i);
              if (displayFrame.deformVertices.length === 0) {
                continue;
              }

              const geometryData = displayFrame.getGeometryData();
              if (
                geometryData !== null &&
                ffdFlags.indexOf(geometryData.offset) < 0
              ) {
                const timeline = BaseObject.borrowObject(DeformTimelineState);
                timeline.geometryOffset = geometryData.offset; //
                timeline.displayFrame = displayFrame; //
                timeline.target = this._armature.animation.getBlendState(
                  BlendState.SLOT_DEFORM,
                  slot.name,
                  slot
                );
                timeline.init(this._armature, this, null);
                this._slotBlendTimelines.push(timeline);
                this._poseTimelines.push(timeline);
              }
            }
          }
        }
      }

      for (let k in slotTimelines) {
        // Remove slot timelines.
        for (const timeline of slotTimelines[k]) {
          let index = this._slotTimelines.indexOf(timeline);
          if (index >= 0) {
            this._slotTimelines.splice(index, 1);
            timeline.returnToPool();
          }

          index = this._slotBlendTimelines.indexOf(timeline);
          if (index >= 0) {
            this._slotBlendTimelines.splice(index, 1);
            timeline.returnToPool();
          }
        }
      }
    }
  }

  private _advanceFadeTime(passedTime: number): void {
    const isFadeOut = this._fadeState > 0;

    if (this._subFadeState < 0) {
      // Fade start event.
      this._subFadeState = 0;

      const eventActive = this._parent === null && this.actionEnabled;
      if (eventActive) {
        const eventType = isFadeOut
          ? EventObject.FADE_OUT
          : EventObject.FADE_IN;
        if (this._armature.eventDispatcher.hasDBEventListener(eventType)) {
          const eventObject = BaseObject.borrowObject(EventObject);
          eventObject.type = eventType;
          eventObject.armature = this._armature;
          eventObject.animationState = this;
          this._armature._dragonBones.bufferEvent(eventObject);
        }
      }
    }

    if (passedTime < 0.0) {
      passedTime = -passedTime;
    }

    this._fadeTime += passedTime;

    if (this._fadeTime >= this.fadeTotalTime) {
      // Fade complete.
      this._subFadeState = 1;
      this._fadeProgress = isFadeOut ? 0.0 : 1.0;
    } else if (this._fadeTime > 0.0) {
      // Fading.
      this._fadeProgress = isFadeOut
        ? 1.0 - this._fadeTime / this.fadeTotalTime
        : this._fadeTime / this.fadeTotalTime;
    } else {
      // Before fade.
      this._fadeProgress = isFadeOut ? 1.0 : 0.0;
    }

    if (this._subFadeState > 0) {
      // Fade complete event.
      if (!isFadeOut) {
        this._playheadState |= 1; // x1
        this._fadeState = 0;
      }

      const eventActive = this._parent === null && this.actionEnabled;
      if (eventActive) {
        const eventType = isFadeOut
          ? EventObject.FADE_OUT_COMPLETE
          : EventObject.FADE_IN_COMPLETE;
        if (this._armature.eventDispatcher.hasDBEventListener(eventType)) {
          const eventObject = BaseObject.borrowObject(EventObject);
          eventObject.type = eventType;
          eventObject.armature = this._armature;
          eventObject.animationState = this;
          this._armature._dragonBones.bufferEvent(eventObject);
        }
      }
    }
  }
  /**
   * @internal
   */
  public init(
    armature: Armature,
    animationData: AnimationData,
    animationConfig: AnimationConfig
  ): void {
    if (this._armature !== null) {
      return;
    }

    this._armature = armature;
    this._animationData = animationData;
    //
    this.resetToPose = animationConfig.resetToPose;
    this.additive = animationConfig.additive;
    this.displayControl = animationConfig.displayControl;
    this.actionEnabled = animationConfig.actionEnabled;
    this.blendType = animationData.blendType;
    this.layer = animationConfig.layer;
    this.playTimes = animationConfig.playTimes;
    this.timeScale = animationConfig.timeScale;
    this.fadeTotalTime = animationConfig.fadeInTime;
    this.autoFadeOutTime = animationConfig.autoFadeOutTime;
    this.name =
      animationConfig.name.length > 0
        ? animationConfig.name
        : animationConfig.animation;
    this.group = animationConfig.group;
    //
    this._weight = animationConfig.weight;

    if (animationConfig.pauseFadeIn) {
      this._playheadState = 2; // 10
    } else {
      this._playheadState = 3; // 11
    }

    if (animationConfig.duration < 0.0) {
      this._position = 0.0;
      this._duration = this._animationData.duration;

      if (animationConfig.position !== 0.0) {
        if (this.timeScale >= 0.0) {
          this._time = animationConfig.position;
        } else {
          this._time = animationConfig.position - this._duration;
        }
      } else {
        this._time = 0.0;
      }
    } else {
      this._position = animationConfig.position;
      this._duration = animationConfig.duration;
      this._time = 0.0;
    }

    if (this.timeScale < 0.0 && this._time === 0.0) {
      this._time = -0.000001; // Turn to end.
    }

    if (this.fadeTotalTime <= 0.0) {
      this._fadeProgress = 0.999999; // Make different.
    }

    if (animationConfig.boneMask.length > 0) {
      this._boneMask.length = animationConfig.boneMask.length;
      for (let i = 0, l = this._boneMask.length; i < l; ++i) {
        this._boneMask[i] = animationConfig.boneMask[i];
      }
    }

    this._actionTimeline = BaseObject.borrowObject(ActionTimelineState);
    this._actionTimeline.init(
      this._armature,
      this,
      this._animationData.actionTimeline
    );
    this._actionTimeline.currentTime = this._time;

    if (this._actionTimeline.currentTime < 0.0) {
      this._actionTimeline.currentTime =
        this._duration - this._actionTimeline.currentTime;
    }

    if (this._animationData.zOrderTimeline !== null) {
      this._zOrderTimeline = BaseObject.borrowObject(ZOrderTimelineState);
      this._zOrderTimeline.init(
        this._armature,
        this,
        this._animationData.zOrderTimeline
      );
    }
  }
  /**
   * @internal
   */
  public advanceTime(passedTime: number, cacheFrameRate: number): void {
    // Update fade time.
    if (this._fadeState !== 0 || this._subFadeState !== 0) {
      this._advanceFadeTime(passedTime);
    }
    // Update time.
    if (this._playheadState === 3) {
      // 11
      if (this.timeScale !== 1.0) {
        passedTime *= this.timeScale;
      }

      this._time += passedTime;
    }
    // Update timeline.
    if (this._timelineDirty !== 0) {
      if (this._timelineDirty === 2) {
        this._updateTimelines();
      }

      this._timelineDirty = 0;
      this._updateBoneAndSlotTimelines();
    }

    const isBlendDirty = this._fadeState !== 0 || this._subFadeState === 0;
    const isCacheEnabled = this._fadeState === 0 && cacheFrameRate > 0.0;
    let isUpdateTimeline = true;
    let isUpdateBoneTimeline = true;
    let time = this._time;
    this._weightResult = this._weight * this._fadeProgress;

    if (this._parent !== null) {
      this._weightResult *= this._parent._weightResult;
    }

    if (this._actionTimeline.playState <= 0) {
      // Update main timeline.
      this._actionTimeline.update(time);
    }

    if (this._weight === 0.0) {
      return;
    }

    if (isCacheEnabled) {
      // Cache time internval.
      const internval = cacheFrameRate * 2.0;
      this._actionTimeline.currentTime =
        Math.floor(this._actionTimeline.currentTime * internval) / internval;
    }

    if (this._zOrderTimeline !== null && this._zOrderTimeline.playState <= 0) {
      // Update zOrder timeline.
      this._zOrderTimeline.update(time);
    }

    if (isCacheEnabled) {
      // Update cache.
      const cacheFrameIndex = Math.floor(
        this._actionTimeline.currentTime * cacheFrameRate
      ); // uint
      if (this._armature._cacheFrameIndex === cacheFrameIndex) {
        // Same cache.
        isUpdateTimeline = false;
        isUpdateBoneTimeline = false;
      } else {
        this._armature._cacheFrameIndex = cacheFrameIndex;

        if (this._animationData.cachedFrames[cacheFrameIndex]) {
          // Cached.
          isUpdateBoneTimeline = false;
        } else {
          // Cache.
          this._animationData.cachedFrames[cacheFrameIndex] = true;
        }
      }
    }

    if (isUpdateTimeline) {
      let isBlend = false;
      let prevTarget: BlendState | null = null as any; //

      if (isUpdateBoneTimeline) {
        for (let i = 0, l = this._boneTimelines.length; i < l; ++i) {
          const timeline = this._boneTimelines[i];

          if (timeline.playState <= 0) {
            timeline.update(time);
          }

          if (timeline.target !== prevTarget) {
            const blendState = timeline.target as BlendState;
            isBlend = blendState.update(this);
            prevTarget = blendState;

            if (blendState.dirty === 1) {
              const pose = (blendState.target as Bone).animationPose;
              pose.x = 0.0;
              pose.y = 0.0;
              pose.rotation = 0.0;
              pose.skew = 0.0;
              pose.scaleX = 1.0;
              pose.scaleY = 1.0;
            }
          }

          if (isBlend) {
            timeline.blend(isBlendDirty);
          }
        }
      }

      for (let i = 0, l = this._boneBlendTimelines.length; i < l; ++i) {
        const timeline = this._boneBlendTimelines[i];

        if (timeline.playState <= 0) {
          timeline.update(time);
        }

        if ((timeline.target as BlendState).update(this)) {
          timeline.blend(isBlendDirty);
        }
      }

      if (this.displayControl) {
        for (let i = 0, l = this._slotTimelines.length; i < l; ++i) {
          const timeline = this._slotTimelines[i];
          if (timeline.playState <= 0) {
            const slot = timeline.target as Slot;
            const displayController = slot.displayController;

            if (
              displayController === null ||
              displayController === this.name ||
              displayController === this.group
            ) {
              timeline.update(time);
            }
          }
        }
      }

      for (let i = 0, l = this._slotBlendTimelines.length; i < l; ++i) {
        const timeline = this._slotBlendTimelines[i];
        if (timeline.playState <= 0) {
          const blendState = timeline.target as BlendState;
          timeline.update(time);

          if (blendState.update(this)) {
            timeline.blend(isBlendDirty);
          }
        }
      }

      for (let i = 0, l = this._constraintTimelines.length; i < l; ++i) {
        const timeline = this._constraintTimelines[i];
        if (timeline.playState <= 0) {
          timeline.update(time);
        }
      }

      if (this._animationTimelines.length > 0) {
        let dL = 100.0;
        let dR = 100.0;
        let leftState: AnimationState | null = null;
        let rightState: AnimationState | null = null;

        for (let i = 0, l = this._animationTimelines.length; i < l; ++i) {
          const timeline = this._animationTimelines[i];
          if (timeline.playState <= 0) {
            timeline.update(time);
          }

          if (this.blendType === AnimationBlendType.E1D) {
            // TODO
            const animationState = timeline.target as AnimationState;
            const d = this.parameterX - animationState.positionX;

            if (d >= 0.0) {
              if (d < dL) {
                dL = d;
                leftState = animationState;
              }
            } else {
              if (-d < dR) {
                dR = -d;
                rightState = animationState;
              }
            }
          }
        }

        if (leftState !== null) {
          if (this._activeChildA !== leftState) {
            if (this._activeChildA !== null) {
              this._activeChildA.weight = 0.0;
            }

            this._activeChildA = leftState;
            this._activeChildA.activeTimeline();
          }

          if (this._activeChildB !== rightState) {
            if (this._activeChildB !== null) {
              this._activeChildB.weight = 0.0;
            }

            this._activeChildB = rightState;
          }

          leftState.weight = dR / (dL + dR);

          if (rightState) {
            rightState.weight = 1.0 - leftState.weight;
          }
        }
      }
    }

    if (this._fadeState === 0) {
      if (this._subFadeState > 0) {
        this._subFadeState = 0;

        if (this._poseTimelines.length > 0) {
          // Remove pose timelines.
          for (const timeline of this._poseTimelines) {
            let index = this._boneTimelines.indexOf(timeline);
            if (index >= 0) {
              this._boneTimelines.splice(index, 1);
              timeline.returnToPool();
              continue;
            }

            index = this._boneBlendTimelines.indexOf(timeline);
            if (index >= 0) {
              this._boneBlendTimelines.splice(index, 1);
              timeline.returnToPool();
              continue;
            }

            index = this._slotTimelines.indexOf(timeline);
            if (index >= 0) {
              this._slotTimelines.splice(index, 1);
              timeline.returnToPool();
              continue;
            }

            index = this._slotBlendTimelines.indexOf(timeline);
            if (index >= 0) {
              this._slotBlendTimelines.splice(index, 1);
              timeline.returnToPool();
              continue;
            }

            index = this._constraintTimelines.indexOf(timeline);
            if (index >= 0) {
              this._constraintTimelines.splice(index, 1);
              timeline.returnToPool();
              continue;
            }
          }

          this._poseTimelines.length = 0;
        }
      }

      if (this._actionTimeline.playState > 0) {
        if (this.autoFadeOutTime >= 0.0) {
          // Auto fade out.
          this.fadeOut(this.autoFadeOutTime);
        }
      }
    }
  }
  /**
   * - Continue play.
   * @version DragonBones 3.0
   * @language en_US
   */
  public play(): void {
    this._playheadState = 3; // 11
  }
  /**
   * - Stop play.
   * @version DragonBones 3.0
   * @language en_US
   */
  public stop(): void {
    this._playheadState &= 1; // 0x
  }
  /**
   * - Fade out the animation state.
   * @param fadeOutTime - The fade out time. (In seconds)
   * @param pausePlayhead - Whether to pause the animation playing when fade out.
   * @version DragonBones 3.0
   * @language en_US
   */
  public fadeOut(fadeOutTime: number, pausePlayhead: boolean = true): void {
    if (fadeOutTime < 0.0) {
      fadeOutTime = 0.0;
    }

    if (pausePlayhead) {
      this._playheadState &= 2; // x0
    }

    if (this._fadeState > 0) {
      if (fadeOutTime > this.fadeTotalTime - this._fadeTime) {
        // If the animation is already in fade out, the new fade out will be ignored.
        return;
      }
    } else {
      this._fadeState = 1;
      this._subFadeState = -1;

      if (fadeOutTime <= 0.0 || this._fadeProgress <= 0.0) {
        this._fadeProgress = 0.000001; // Modify fade progress to different value.
      }

      for (const timeline of this._boneTimelines) {
        timeline.fadeOut();
      }

      for (const timeline of this._boneBlendTimelines) {
        timeline.fadeOut();
      }

      for (const timeline of this._slotTimelines) {
        timeline.fadeOut();
      }

      for (const timeline of this._slotBlendTimelines) {
        timeline.fadeOut();
      }

      for (const timeline of this._constraintTimelines) {
        timeline.fadeOut();
      }

      for (const timeline of this._animationTimelines) {
        timeline.fadeOut();
        //
        const animaitonState = timeline.target as AnimationState;
        animaitonState.fadeOut(999999.0, true);
      }
    }

    this.displayControl = false; //
    this.fadeTotalTime =
      this._fadeProgress > 0.000001 ? fadeOutTime / this._fadeProgress : 0.0;
    this._fadeTime = this.fadeTotalTime * (1.0 - this._fadeProgress);
  }
  /**
   * - Check if a specific bone mask is included.
   * @param boneName - The bone name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public containsBoneMask(boneName: string): boolean {
    return this._boneMask.length === 0 || this._boneMask.indexOf(boneName) >= 0;
  }
  /**
   * - Add a specific bone mask.
   * @param boneName - The bone name.
   * @param recursive - Whether or not to add a mask to the bone's sub-bone.
   * @version DragonBones 3.0
   * @language en_US
   */
  public addBoneMask(boneName: string, recursive: boolean = true): void {
    const currentBone = this._armature.getBone(boneName);
    if (currentBone === null) {
      return;
    }

    if (this._boneMask.indexOf(boneName) < 0) {
      // Add mixing
      this._boneMask.push(boneName);
    }

    if (recursive) {
      // Add recursive mixing.
      for (const bone of this._armature.getBones()) {
        if (
          this._boneMask.indexOf(bone.name) < 0 &&
          currentBone.contains(bone)
        ) {
          this._boneMask.push(bone.name);
        }
      }
    }

    this._timelineDirty = 1;
  }
  /**
   * - Remove the mask of a specific bone.
   * @param boneName - The bone name.
   * @param recursive - Whether to remove the bone's sub-bone mask.
   * @version DragonBones 3.0
   * @language en_US
   */
  public removeBoneMask(boneName: string, recursive: boolean = true): void {
    const index = this._boneMask.indexOf(boneName);
    if (index >= 0) {
      // Remove mixing.
      this._boneMask.splice(index, 1);
    }

    if (recursive) {
      const currentBone = this._armature.getBone(boneName);
      if (currentBone !== null) {
        const bones = this._armature.getBones();
        if (this._boneMask.length > 0) {
          // Remove recursive mixing.
          for (const bone of bones) {
            const index = this._boneMask.indexOf(bone.name);
            if (index >= 0 && currentBone.contains(bone)) {
              this._boneMask.splice(index, 1);
            }
          }
        } else {
          // Add unrecursive mixing.
          for (const bone of bones) {
            if (bone === currentBone) {
              continue;
            }

            if (!currentBone.contains(bone)) {
              this._boneMask.push(bone.name);
            }
          }
        }
      }
    }

    this._timelineDirty = 1;
  }
  /**
   * - Remove all bone masks.
   * @version DragonBones 3.0
   * @language en_US
   */
  public removeAllBoneMask(): void {
    this._boneMask.length = 0;
    this._timelineDirty = 1;
  }
  /**
   * @private
   */
  public addState(
    animationState: AnimationState,
    timelineDatas: TimelineData[] | null = null
  ) {
    if (timelineDatas !== null) {
      for (const timelineData of timelineDatas) {
        switch (timelineData.type) {
          case TimelineType.AnimationProgress: {
            const timeline = BaseObject.borrowObject(
              AnimationProgressTimelineState
            );
            timeline.target = animationState;
            timeline.init(this._armature, this, timelineData);
            this._animationTimelines.push(timeline);

            if (this.blendType !== AnimationBlendType.None) {
              const animaitonTimelineData =
                timelineData as AnimationTimelineData;
              animationState.positionX = animaitonTimelineData.x;
              animationState.positionY = animaitonTimelineData.y;
              animationState.weight = 0.0;
            }

            animationState._parent = this;
            this.resetToPose = false;
            break;
          }

          case TimelineType.AnimationWeight: {
            const timeline = BaseObject.borrowObject(
              AnimationWeightTimelineState
            );
            timeline.target = animationState;
            timeline.init(this._armature, this, timelineData);
            this._animationTimelines.push(timeline);
            break;
          }

          case TimelineType.AnimationParameter: {
            const timeline = BaseObject.borrowObject(
              AnimationParametersTimelineState
            );
            timeline.target = animationState;
            timeline.init(this._armature, this, timelineData);
            this._animationTimelines.push(timeline);
            break;
          }

          default:
            break;
        }
      }
    }

    if (animationState._parent === null) {
      animationState._parent = this;
    }
  }
  /**
   * @internal
   */
  public activeTimeline(): void {
    for (const timeline of this._slotTimelines) {
      timeline.dirty = true;
      timeline.currentTime = -1.0;
    }
  }
  /**
   * - Whether the animation state is fading in.
   * @version DragonBones 5.1
   * @language en_US
   */
  public get isFadeIn(): boolean {
    return this._fadeState < 0;
  }
  /**
   * - Whether the animation state is fading out.
   * @version DragonBones 5.1
   * @language en_US
   */
  public get isFadeOut(): boolean {
    return this._fadeState > 0;
  }
  /**
   * - Whether the animation state is fade completed.
   * @version DragonBones 5.1
   * @language en_US
   */
  public get isFadeComplete(): boolean {
    return this._fadeState === 0;
  }
  /**
   * - Whether the animation state is playing.
   * @version DragonBones 3.0
   * @language en_US
   */
  public get isPlaying(): boolean {
    return (
      (this._playheadState & 2) !== 0 && this._actionTimeline.playState <= 0
    );
  }
  /**
   * - Whether the animation state is play completed.
   * @version DragonBones 3.0
   * @language en_US
   */
  public get isCompleted(): boolean {
    return this._actionTimeline.playState > 0;
  }
  /**
   * - The times has been played.
   * @version DragonBones 3.0
   * @language en_US
   */
  public get currentPlayTimes(): number {
    return this._actionTimeline.currentPlayTimes;
  }
  /**
   * - The total time. (In seconds)
   * @version DragonBones 3.0
   * @language en_US
   */
  public get totalTime(): number {
    return this._duration;
  }
  /**
   * - The time is currently playing. (In seconds)
   * @version DragonBones 3.0
   * @language en_US
   */
  public get currentTime(): number {
    return this._actionTimeline.currentTime;
  }
  public set currentTime(value: number) {
    const currentPlayTimes =
      this._actionTimeline.currentPlayTimes -
      (this._actionTimeline.playState > 0 ? 1 : 0);
    if (value < 0 || this._duration < value) {
      value = (value % this._duration) + currentPlayTimes * this._duration;
      if (value < 0) {
        value += this._duration;
      }
    }

    if (
      this.playTimes > 0 &&
      currentPlayTimes === this.playTimes - 1 &&
      value === this._duration &&
      this._parent === null
    ) {
      value = this._duration - 0.000001; //
    }

    if (this._time === value) {
      return;
    }

    this._time = value;
    this._actionTimeline.setCurrentTime(this._time);

    if (this._zOrderTimeline !== null) {
      this._zOrderTimeline.playState = -1;
    }

    for (const timeline of this._boneTimelines) {
      timeline.playState = -1;
    }

    for (const timeline of this._slotTimelines) {
      timeline.playState = -1;
    }
  }
  /**
   * - The blend weight.
   * @default 1.0
   * @version DragonBones 5.0
   * @language en_US
   */
  public get weight(): number {
    return this._weight;
  }
  public set weight(value: number) {
    if (this._weight === value) {
      return;
    }

    this._weight = value;

    for (const timeline of this._boneTimelines) {
      timeline.dirty = true;
    }

    for (const timeline of this._boneBlendTimelines) {
      timeline.dirty = true;
    }

    for (const timeline of this._slotBlendTimelines) {
      timeline.dirty = true;
    }
  }
  /**
   * - The animation data.
   * @see dragonBones.AnimationData
   * @version DragonBones 3.0
   * @language en_US
   */
  public get animationData(): AnimationData {
    return this._animationData;
  }
}
/**
 * @internal
 */
export class BlendState extends BaseObject {
  public static readonly BONE_TRANSFORM: string = "boneTransform";
  public static readonly BONE_ALPHA: string = "boneAlpha";
  public static readonly SURFACE: string = "surface";
  public static readonly SLOT_DEFORM: string = "slotDeform";
  public static readonly SLOT_ALPHA: string = "slotAlpha";
  public static readonly SLOT_Z_INDEX: string = "slotZIndex";

  public static toString(): string {
    return "[class dragonBones.BlendState]";
  }

  public dirty: number;
  public layer: number;
  public leftWeight: number;
  public layerWeight: number;
  public blendWeight: number;
  public target: BaseObject;

  protected _onClear(): void {
    this.reset();

    this.target = null as any;
  }

  public update(animationState: AnimationState): boolean {
    const animationLayer = animationState.layer;
    let animationWeight = animationState._weightResult;

    if (this.dirty > 0) {
      if (this.leftWeight > 0.0) {
        if (this.layer !== animationLayer) {
          if (this.layerWeight >= this.leftWeight) {
            this.dirty++;
            this.layer = animationLayer;
            this.leftWeight = 0.0;
            this.blendWeight = 0.0;

            return false;
          }

          this.layer = animationLayer;
          this.leftWeight -= this.layerWeight;
          this.layerWeight = 0.0;
        }

        animationWeight *= this.leftWeight;
        this.dirty++;
        this.blendWeight = animationWeight;
        this.layerWeight += this.blendWeight;

        return true;
      }

      return false;
    }

    this.dirty++;
    this.layer = animationLayer;
    this.leftWeight = 1.0;
    this.blendWeight = animationWeight;
    this.layerWeight = animationWeight;

    return true;
  }

  public reset(): void {
    this.dirty = 0;
    this.layer = 0;
    this.leftWeight = 0.0;
    this.layerWeight = 0.0;
    this.blendWeight = 0.0;
  }
}
