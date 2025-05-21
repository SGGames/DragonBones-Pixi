import { AnimationState } from "../animation/AnimationState";
import { Armature } from "../armature/Armature";
import { Bone } from "../armature/Bone";
import { Slot } from "../armature/Slot";
import { BaseObject } from "../core/BaseObject";
import { ActionType } from "../core/DragonBones";
import { ActionData, UserData } from "../model/UserData";
import { EventStringType } from "./IEventDispatcher";

    /**
     * - The properties of the object carry basic information about an event,
     * which are passed as parameter or parameter's parameter to event listeners when an event occurs.
     * @version DragonBones 4.5
     * @language en_US
     */
    export class EventObject extends BaseObject {
        /**
         * - Animation start play.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly START: string = "start";
        /**
         * - Animation loop play complete once.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly LOOP_COMPLETE: string = "loopComplete";
        /**
         * - Animation play complete.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly COMPLETE: string = "complete";
        /**
         * - Animation fade in start.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly FADE_IN: string = "fadeIn";
        /**
         * - Animation fade in complete.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly FADE_IN_COMPLETE: string = "fadeInComplete";
        /**
         * - Animation fade out start.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly FADE_OUT: string = "fadeOut";
        /**
         * - Animation fade out complete.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly FADE_OUT_COMPLETE: string = "fadeOutComplete";
        /**
         * - Animation frame event.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly FRAME_EVENT: string = "frameEvent";
        /**
         * - Animation frame sound event.
         * @version DragonBones 4.5
         * @language en_US
         */
        public static readonly SOUND_EVENT: string = "soundEvent";
        /**
         * @internal
         * @private
         */
        public static actionDataToInstance(data: ActionData, instance: EventObject, armature: Armature): void {
            if (data.type === ActionType.Play) {
                instance.type = EventObject.FRAME_EVENT;
            }
            else {
                instance.type = data.type === ActionType.Frame ? EventObject.FRAME_EVENT : EventObject.SOUND_EVENT;
            }

            instance.name = data.name;
            instance.armature = armature;
            instance.actionData = data;
            instance.data = data.data;

            if (data.bone !== null) {
                instance.bone = armature.getBone(data.bone.name);
            }

            if (data.slot !== null) {
                instance.slot = armature.getSlot(data.slot.name);
            }
        }

        public static toString(): string {
            return "[class dragonBones.EventObject]";
        }
        /**
         * - If is a frame event, the value is used to describe the time that the event was in the animation timeline. (In seconds)
         * @version DragonBones 4.5
         * @language en_US
         */
        public time: number;
        /**
         * - The event type。
         * @version DragonBones 4.5
         * @language en_US
         */
        public type: EventStringType;
        /**
         * - The event name. (The frame event name or the frame sound name)
         * @version DragonBones 4.5
         * @language en_US
         */
        public name: string;
        /**
         * - The armature that dispatch the event.
         * @see dragonBones.Armature
         * @version DragonBones 4.5
         * @language en_US
         */
        public armature: Armature;
        /**
         * - The bone that dispatch the event.
         * @see dragonBones.Bone
         * @version DragonBones 4.5
         * @language en_US
         */
        public bone: Bone | null;
        /**
         * - The slot that dispatch the event.
         * @see dragonBones.Slot
         * @version DragonBones 4.5
         * @language en_US
         */
        public slot: Slot | null;
        /**
         * - The animation state that dispatch the event.
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language en_US
         */
        public animationState: AnimationState;
        /**
         * @private
         */
        public actionData: ActionData | null;
        /**
         * @private
         */
        /**
         * - The custom data.
         * @see dragonBones.CustomData
         * @version DragonBones 5.0
         * @language en_US
         */
        /**
         * - 自定义数据。
         * @see dragonBones.CustomData
         * @version DragonBones 5.0
         * @language zh_CN
         */
        public data: UserData | null;

        protected _onClear(): void {
            this.time = 0.0;
            this.type = "";
            this.name = "";
            this.armature = null as any;
            this.bone = null;
            this.slot = null;
            this.animationState = null as any;
            this.actionData = null;
            this.data = null;
        }
    }
