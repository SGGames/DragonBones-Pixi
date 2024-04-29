import { EventObject } from "../../../dragonBones/event/EventObject";
import { PixiArmatureDisplay } from "../PixiArmatureDisplay";
import { PixiFactory } from "../PixiFactory";
import BaseDemo from "./BaseDemo";


export default class DragonBonesEvent extends BaseDemo {
    private _armatureDisplay: PixiArmatureDisplay;

    public constructor() {
        super();

        this._resources.push(
            "resource/mecha_1004d/mecha_1004d_ske.json",
            "resource/mecha_1004d/mecha_1004d_tex.json",
            "resource/mecha_1004d/mecha_1004d_tex.png"
        );
    }

    protected _onStart(): void {
        const factory = PixiFactory.factory;
        factory.parseDragonBonesData(this._pixiResources["resource/mecha_1004d/mecha_1004d_ske.json"]);
        factory.parseTextureAtlasData(this._pixiResources["resource/mecha_1004d/mecha_1004d_tex.json"],
            this._pixiResources["resource/mecha_1004d/mecha_1004d_tex.png"]);
        factory.soundEventManager.on(EventObject.SOUND_EVENT, this._soundEventHandler, this);

        this._armatureDisplay = factory.buildArmatureDisplay("mecha_1004d")!;
        this._armatureDisplay.on(EventObject.COMPLETE, this._animationEventHandler, this);
        this._armatureDisplay.animation.play("walk");

        // this._armatureDisplay.x = 800.0;
        // this._armatureDisplay.y = 600.0;
        this.container.addChild(this._armatureDisplay);
        //
        this.container.interactive = true;
        const touchHandler = () => {
            this._armatureDisplay.animation.fadeIn("skill_03", 0.2);
        };
        this.container.addListener("mousedown", touchHandler, this);
        this.container.addListener("touchstart", touchHandler, this);
        //
        this.createText("Touch to play animation.");
    }

    private _soundEventHandler(event: EventObject): void {
        console.log(event.name);
    }

    private _animationEventHandler(event: EventObject): void {
        if (event.animationState.name === "skill_03") {
            this._armatureDisplay.animation.fadeIn("walk", 0.2);
        }
    }
}