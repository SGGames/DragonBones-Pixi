# DragonBones - Pixi V8
DragonBones runtime and Demo for Pixi V8.

## Why?
[Erget](https://egret.com) the company behind DragonBones seems have abandoned DragonBones and its libraries from years ago...

But... there is Hope!

[SGGames](https://sggame.us) Our team will upgrade it to support modern Js/Ts runtime and adding a new shiny Editor too. 

🔥🔥🔥 Stay tuned! 🔥🔥🔥

## Feature list
Same as DragonBones.js at the moment but will be added soon with more next-gen features:

- ✅ Modern typescript
- ✅ Pixi V8 with much better performance
- ✅ Animations
- ✅ Mesh
- ✅ IK
- ✅ Events
- ✅ Userdata
🔥



## To use as library
```
npm install dragonbones-pixijs
```
### Example Typescript
```typescript
export default class HelloDragonBones extends BaseDemo {
    public constructor() {
        super();

        this._resources.push(
            "resource/mecha_1002_101d_show/mecha_1002_101d_show_ske.json",
            "resource/mecha_1002_101d_show/mecha_1002_101d_show_tex.json",
            "resource/mecha_1002_101d_show/mecha_1002_101d_show_tex.png"
        );
    }

    protected _onStart(): void {
        const factory = PixiFactory.factory;
        factory.parseDragonBonesData(this._pixiResources["resource/mecha_1002_101d_show/mecha_1002_101d_show_ske.json"]);

        factory.parseTextureAtlasData(
            this._pixiResources["resource/mecha_1002_101d_show/mecha_1002_101d_show_tex.json"],
            this._pixiResources["resource/mecha_1002_101d_show/mecha_1002_101d_show_tex.png"]);

        const armatureDisplay = factory.buildArmatureDisplay("mecha_1002_101d", "mecha_1002_101d_show")!;
        armatureDisplay.animation.play("idle");

        this.container.addChild(armatureDisplay);
    }
}
```

### Load data
From Pixi V8, Loader is gone, use await Assets.load instead.
```
await Assets.load()
```
```typescript
const factory = PixiFactory.factory;
factory.parseDragonBonesData(this._pixiResources["resource/mecha_1002_101d_show/mecha_1002_101d_show_ske.json"]);

factory.parseTextureAtlasData(
    this._pixiResources["resource/mecha_1002_101d_show/mecha_1002_101d_show_tex.json"],
    this._pixiResources["resource/mecha_1002_101d_show/mecha_1002_101d_show_tex.png"]);
```

### Add to Stage and Display
From Pixi v8, 
- DisplayObject is gone, replaced with Container.
- Only Container can have children

```typescript
const armatureDisplay = factory.buildArmatureDisplay("mecha_1002_101d", "mecha_1002_101d_show")!;
armatureDisplay.animation.play("idle");
this.container.addChild(armatureDisplay);
```

## To start development
Work with Vite

```
npm install
npm run dev
```

## To build
```
npm run build
```

## Run demo
[Examples](https://sggames.github.io/DragonBones-Pixi/)

- Click button in the top to go through different Examples

![ScreenshotAll](./public/screenshots/screenshot-all.jpg)
![Screenshot](./public/screenshots/screenshot-01.png)

- CodeSandBox.io samples (WIP)


## References
Old version (PixiV4-5)

https://github.com/DragonBones/DragonBonesJS

Pixi.js

https://pixijs.com/
https://github.com/pixijs/pixijs
https://pixijs.com/8.x/guides/migrations/v8