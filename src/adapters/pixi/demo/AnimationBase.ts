import { EventObject } from "../../../dragonBones/event/EventObject";
import { PixiArmatureDisplay } from "../PixiArmatureDisplay";
import { PixiFactory } from "../PixiFactory";
import BaseDemo from "./BaseDemo";

export default class AnimationBase extends BaseDemo {
    private _armatureDisplay: PixiArmatureDisplay;

    public constructor() {
        super();

        this._resources.push(
            "resource/progress_bar/progress_bar_ske.json",
            "resource/progress_bar/progress_bar_tex.json",
            "resource/progress_bar/progress_bar_tex.png"
        );
    }

    protected _onStart(): void {
        const factory = PixiFactory.factory;
        factory.parseDragonBonesData(this._pixiResources["resource/progress_bar/progress_bar_ske.json"]);
        factory.parseTextureAtlasData(this._pixiResources["resource/progress_bar/progress_bar_tex.json"], 
        this._pixiResources["resource/progress_bar/progress_bar_tex.png"]);
        //
        this._armatureDisplay = factory.buildArmatureDisplay("progress_bar")!;
        this._armatureDisplay.x = 0.0;
        this._armatureDisplay.y = 0.0;
        this.addChild(this._armatureDisplay);
        // Add animation event listener.
        this._armatureDisplay.on(EventObject.START, this._animationEventHandler, this);
        this._armatureDisplay.on(EventObject.LOOP_COMPLETE, this._animationEventHandler, this);
        this._armatureDisplay.on(EventObject.COMPLETE, this._animationEventHandler, this);
        this._armatureDisplay.on(EventObject.FADE_IN, this._animationEventHandler, this);
        this._armatureDisplay.on(EventObject.FADE_IN_COMPLETE, this._animationEventHandler, this);
        this._armatureDisplay.on(EventObject.FADE_OUT, this._animationEventHandler, this);
        this._armatureDisplay.on(EventObject.FADE_OUT_COMPLETE, this._animationEventHandler, this);
        this._armatureDisplay.on(EventObject.FRAME_EVENT, this._animationEventHandler, this);
        this._armatureDisplay.animation.play("idle");
        //
        this.container.interactive = true;
        this.addListener("pointerdown", this._touchHandler, this);
        this.addListener("pointerup", this._touchHandler, this);
        this.addListener("pointermove", this._touchHandler, this);
        //
        this.createText("Touch to control animation play progress.");
    }

    private _isTouched: boolean = false;
    private _touchHandler(event: any): void {
        const progress = Math.min(Math.max((event.data.global.x - this.container.x + 300.0) / 600.0, 0.0), 1.0);
        switch (event.type) {
            case "pointerdown":
                this._isTouched = true;
                this._armatureDisplay.animation.gotoAndStopByProgress("idle", progress);
                break;

            case "pointerup":
                this._isTouched = false;
                this._armatureDisplay.animation.play();
                break;

            case "pointermove":
                if (this._isTouched) {
                    const animationState = this._armatureDisplay.animation.getState("idle");
                    if (animationState) {
                        animationState.currentTime = animationState.totalTime * progress;
                    }
                }
                break;
        }
    }

    private _animationEventHandler(event: EventObject): void {
        console.log(event.animationState.name, event.type, event.name);
    }
}