import { Container } from "pixi.js";
import * as PIXI from "pixi.js";
import { PixiArmatureDisplay } from "../PixiArmatureDisplay";
import { OffsetMode } from "../../../dragonBones/core/DragonBones";

export class DragHelper {
    private static _instance: DragHelper = new DragHelper();
    public static getInstance(): DragHelper {
        return DragHelper._instance;
    }

    public stage: Container;

    private readonly _helpPoint: PIXI.Point = new PIXI.Point();
    private readonly _dragOffset: PIXI.Point = new PIXI.Point();
    private _dragDisplayObject: PIXI.Container | null = null;

    public enableDrag(displayObject: PIXI.Container): void {
        displayObject.interactive = true;
        displayObject.addListener("touchstart", this._dragHandler, this);
        displayObject.addListener("touchend", this._dragHandler, this);
        displayObject.addListener("mousedown", this._dragHandler, this);
        displayObject.addListener("mouseup", this._dragHandler, this);
    }

    public disableDrag(displayObject: PIXI.Container): void {
        displayObject.removeListener("touchstart", this._dragHandler, this);
        displayObject.removeListener("touchend", this._dragHandler, this);
        displayObject.removeListener("mousedown", this._dragHandler, this);
        displayObject.removeListener("mouseup", this._dragHandler, this);
    }

    private _dragHandler(event: any): void {
        switch (event.type) {
            case "touchstart":
            case "mousedown":
                if (this._dragDisplayObject) {
                    return;
                }

                this._dragDisplayObject = event.target as PIXI.Container;

                const armatureDisplay = this._dragDisplayObject.parent as PixiArmatureDisplay;
                const bone = armatureDisplay.armature.getBoneByDisplay(this._dragDisplayObject);

                if (bone) {
                    this._helpPoint.x = event.data.global.x;
                    this._helpPoint.y = event.data.global.y;
                    armatureDisplay.toLocal(this._helpPoint, this.stage, this._helpPoint);

                    if (bone.offsetMode !== OffsetMode.Override) {
                        bone.offsetMode = OffsetMode.Override;
                        bone.offset.x = bone.global.x;
                        bone.offset.y = bone.global.y;
                    }

                    this._dragOffset.x = bone.offset.x - this._helpPoint.x;
                    this._dragOffset.y = bone.offset.y - this._helpPoint.y;

                    this.stage.addListener("touchmove", this._dragHandler, this);
                    this.stage.addListener("mousemove", this._dragHandler, this);
                }
                break;

            case "touchend":
            case "mouseup":
                if (this._dragDisplayObject) {
                    this.stage.removeListener("touchmove", this._dragHandler, this);
                    this.stage.removeListener("mousemove", this._dragHandler, this);
                    this._dragDisplayObject = null;
                }
                break;

            case "touchmove":
            case "mousemove":
                if (this._dragDisplayObject) {
                    const armatureDisplay = this._dragDisplayObject.parent as PixiArmatureDisplay;
                    const bone = armatureDisplay.armature.getBoneByDisplay(this._dragDisplayObject);

                    if (bone) {
                        this._helpPoint.x = event.data.global.x;
                        this._helpPoint.y = event.data.global.y;
                        armatureDisplay.toLocal(this._helpPoint, this.stage, this._helpPoint);
                        bone.offset.x = this._helpPoint.x + this._dragOffset.x;
                        bone.offset.y = this._helpPoint.y + this._dragOffset.y;
                        bone.invalidUpdate();
                    }
                }
                break;
        }
    }
}