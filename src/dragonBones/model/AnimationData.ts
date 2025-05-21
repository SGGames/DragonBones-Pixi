import { BaseObject } from "../core/BaseObject";
import { AnimationBlendType, TimelineType } from "../core/DragonBones";
import { Map } from "../core/DragonBones";
import { ArmatureData } from "./ArmatureData";

/**
 * - The animation data.
 * @version DragonBones 3.0
 * @language en_US
 */
export class AnimationData extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.AnimationData]";
  }
  /**
   * - FrameIntArray.
   * @internal
   */
  public frameIntOffset: number;
  /**
   * - FrameFloatArray.
   * @internal
   */
  public frameFloatOffset: number;
  /**
   * - FrameArray.
   * @internal
   */
  public frameOffset: number;
  /**
   * @private
   */
  public blendType: AnimationBlendType;
  /**
   * - The frame count of the animation.
   * @version DragonBones 3.0
   * @language en_US
   */
  public frameCount: number;
  /**
   * - The play times of the animation. [0: Loop play, [1~N]: Play N times]
   * @version DragonBones 3.0
   * @language en_US
   */
  public playTimes: number;
  /**
   * - The duration of the animation. (In seconds)
   * @version DragonBones 3.0
   * @language en_US
   */
  public duration: number;
  /**
   * @private
   */
  public scale: number;
  /**
   * - The fade in time of the animation. (In seconds)
   * @version DragonBones 3.0
   * @language en_US
   */
  public fadeInTime: number;
  /**
   * @private
   */
  public cacheFrameRate: number;
  /**
   * - The animation name.
   * @version DragonBones 3.0
   * @language en_US
   */
  public name: string;
  /**
   * @private
   */
  public readonly cachedFrames: Array<boolean> = [];
  /**
   * @private
   */
  public readonly boneTimelines: Map<Array<TimelineData>> = {};
  /**
   * @private
   */
  public readonly slotTimelines: Map<Array<TimelineData>> = {};
  /**
   * @private
   */
  public readonly constraintTimelines: Map<Array<TimelineData>> = {};
  /**
   * @private
   */
  public readonly animationTimelines: Map<Array<TimelineData>> = {};
  /**
   * @private
   */
  public readonly boneCachedFrameIndices: Map<Array<number>> = {};
  /**
   * @private
   */
  public readonly slotCachedFrameIndices: Map<Array<number>> = {};
  /**
   * @private
   */
  public actionTimeline: TimelineData | null = null; // Initial value.
  /**
   * @private
   */
  public zOrderTimeline: TimelineData | null = null; // Initial value.
  /**
   * @private
   */
  public parent: ArmatureData;

  protected _onClear(): void {
    for (let k in this.boneTimelines) {
      for (const timeline of this.boneTimelines[k]) {
        timeline.returnToPool();
      }

      delete this.boneTimelines[k];
    }

    for (let k in this.slotTimelines) {
      for (const timeline of this.slotTimelines[k]) {
        timeline.returnToPool();
      }

      delete this.slotTimelines[k];
    }

    for (let k in this.constraintTimelines) {
      for (const timeline of this.constraintTimelines[k]) {
        timeline.returnToPool();
      }

      delete this.constraintTimelines[k];
    }

    for (let k in this.animationTimelines) {
      for (const timeline of this.animationTimelines[k]) {
        timeline.returnToPool();
      }

      delete this.animationTimelines[k];
    }

    for (let k in this.boneCachedFrameIndices) {
      delete this.boneCachedFrameIndices[k];
    }

    for (let k in this.slotCachedFrameIndices) {
      delete this.slotCachedFrameIndices[k];
    }

    if (this.actionTimeline !== null) {
      this.actionTimeline.returnToPool();
    }

    if (this.zOrderTimeline !== null) {
      this.zOrderTimeline.returnToPool();
    }

    this.frameIntOffset = 0;
    this.frameFloatOffset = 0;
    this.frameOffset = 0;
    this.blendType = AnimationBlendType.None;
    this.frameCount = 0;
    this.playTimes = 0;
    this.duration = 0.0;
    this.scale = 1.0;
    this.fadeInTime = 0.0;
    this.cacheFrameRate = 0.0;
    this.name = "";
    this.cachedFrames.length = 0;
    // this.boneTimelines.clear();
    // this.slotTimelines.clear();
    // this.constraintTimelines.clear();
    // this.animationTimelines.clear();
    // this.boneCachedFrameIndices.clear();
    // this.slotCachedFrameIndices.clear();
    this.actionTimeline = null;
    this.zOrderTimeline = null;
    this.parent = null as any; //
  }
  /**
   * @internal
   */
  public cacheFrames(frameRate: number): void {
    if (this.cacheFrameRate > 0.0) {
      // TODO clear cache.
      return;
    }

    this.cacheFrameRate = Math.max(Math.ceil(frameRate * this.scale), 1.0);
    const cacheFrameCount = Math.ceil(this.cacheFrameRate * this.duration) + 1; // Cache one more frame.

    this.cachedFrames.length = cacheFrameCount;
    for (let i = 0, l = this.cacheFrames.length; i < l; ++i) {
      this.cachedFrames[i] = false;
    }

    for (const bone of this.parent.sortedBones) {
      const indices = new Array<number>(cacheFrameCount);
      for (let i = 0, l = indices.length; i < l; ++i) {
        indices[i] = -1;
      }

      this.boneCachedFrameIndices[bone.name] = indices;
    }

    for (const slot of this.parent.sortedSlots) {
      const indices = new Array<number>(cacheFrameCount);
      for (let i = 0, l = indices.length; i < l; ++i) {
        indices[i] = -1;
      }

      this.slotCachedFrameIndices[slot.name] = indices;
    }
  }
  /**
   * @private
   */
  public addBoneTimeline(timelineName: string, timeline: TimelineData): void {
    const timelines =
      timelineName in this.boneTimelines
        ? this.boneTimelines[timelineName]
        : (this.boneTimelines[timelineName] = []);
    if (timelines.indexOf(timeline) < 0) {
      timelines.push(timeline);
    }
  }
  /**
   * @private
   */
  public addSlotTimeline(timelineName: string, timeline: TimelineData): void {
    const timelines =
      timelineName in this.slotTimelines
        ? this.slotTimelines[timelineName]
        : (this.slotTimelines[timelineName] = []);
    if (timelines.indexOf(timeline) < 0) {
      timelines.push(timeline);
    }
  }
  /**
   * @private
   */
  public addConstraintTimeline(
    timelineName: string,
    timeline: TimelineData
  ): void {
    const timelines =
      timelineName in this.constraintTimelines
        ? this.constraintTimelines[timelineName]
        : (this.constraintTimelines[timelineName] = []);
    if (timelines.indexOf(timeline) < 0) {
      timelines.push(timeline);
    }
  }
  /**
   * @private
   */
  public addAnimationTimeline(
    timelineName: string,
    timeline: TimelineData
  ): void {
    const timelines =
      timelineName in this.animationTimelines
        ? this.animationTimelines[timelineName]
        : (this.animationTimelines[timelineName] = []);
    if (timelines.indexOf(timeline) < 0) {
      timelines.push(timeline);
    }
  }
  /**
   * @private
   */
  public getBoneTimelines(timelineName: string): Array<TimelineData> | null {
    return timelineName in this.boneTimelines
      ? this.boneTimelines[timelineName]
      : null;
  }
  /**
   * @private
   */
  public getSlotTimelines(timelineName: string): Array<TimelineData> | null {
    return timelineName in this.slotTimelines
      ? this.slotTimelines[timelineName]
      : null;
  }
  /**
   * @private
   */
  public getConstraintTimelines(
    timelineName: string
  ): Array<TimelineData> | null {
    return timelineName in this.constraintTimelines
      ? this.constraintTimelines[timelineName]
      : null;
  }
  /**
   * @private
   */
  public getAnimationTimelines(
    timelineName: string
  ): Array<TimelineData> | null {
    return timelineName in this.animationTimelines
      ? this.animationTimelines[timelineName]
      : null;
  }
  /**
   * @private
   */
  public getBoneCachedFrameIndices(boneName: string): Array<number> | null {
    return boneName in this.boneCachedFrameIndices
      ? this.boneCachedFrameIndices[boneName]
      : null;
  }
  /**
   * @private
   */
  public getSlotCachedFrameIndices(slotName: string): Array<number> | null {
    return slotName in this.slotCachedFrameIndices
      ? this.slotCachedFrameIndices[slotName]
      : null;
  }
}
/**
 * @private
 */
export class TimelineData extends BaseObject {
  public static toString(): string {
    return "[class dragonBones.TimelineData]";
  }

  public type: TimelineType;
  public offset: number; // TimelineArray.
  public frameIndicesOffset: number; // FrameIndices.

  protected _onClear(): void {
    this.type = TimelineType.BoneAll;
    this.offset = 0;
    this.frameIndicesOffset = -1;
  }
}
/**
 * @internal
 */
export class AnimationTimelineData extends TimelineData {
  public static toString(): string {
    return "[class dragonBones.AnimationTimelineData]";
  }

  public x: number;
  public y: number;

  protected _onClear(): void {
    super._onClear();

    this.x = 0.0;
    this.y = 0.0;
  }
}
