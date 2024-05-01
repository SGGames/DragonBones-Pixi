import { Application, Assets, Container, Sprite, Texture, Text, Point } from 'pixi.js';

export default abstract class BaseDemo {
    private static BACKGROUND_URL: string = "resource/background.png";
    protected readonly app: Application;
    protected readonly _background: Sprite = new Sprite(Texture.EMPTY);
    protected readonly _resources: string[] = [];
    protected _pixiResources: any;
    container: Container;
    appName: string;

    public constructor(appName: string) {
        this.appName = appName;
        this.app = new Application();
        this.container = new Container();
    }

    async init() {

        // Intialize the application.
        await this.app.init({ background: '#1099bb', width: window.innerWidth, height: window.innerHeight });
        // Then adding the application's canvas to the DOM body.
        document.body.appendChild(this.app.canvas);
        await this._loadResources();
        this._background.texture = this._pixiResources[BaseDemo.BACKGROUND_URL];
        // this.app.stage.setSize(window.innerWidth, window.innerHeight);
        // console.log(this.stageWidth, this.stageHeight);
        this.app.stage.addChild(this._background);
        this.app.stage.addChild(this.container);
        this.container.x = this.stageWidth * 0.5;
        this.container.y = this.stageHeight * 0.3;
        this._onStart();
    }

    async destroy() {
        this.app.canvas.remove();
        await this.app.destroy();
    }

    protected abstract _onStart();

    protected async _loadResources() {
        this._resources.push(BaseDemo.BACKGROUND_URL);
        await Assets.load(this._resources).then((resources) => {
            console.log(resources);
            this._pixiResources = resources;
        });
    }

    public createText(string: string): Text {
        const text = new Text(string, { align: "center" });
        text.text = string;
        text.scale.x = 0.7;
        text.scale.y = 0.7;
        text.x = - text.width * 0.5;
        text.y = this.stageHeight * 0.5 - 500.0;
        this.container.addChild(text);

        return text;
    }

    addChild(child: any) {
        this.container.addChild(child);
    }

    addListener(event: string, handler: any, context: any) {
        this.container.addListener(event, handler, context);
    }
    removeChild(child: any) {
        this.container.removeChild(child);
    }

    public get stageWidth(): number {
        return this.app.stage.width;
    }

    public get stageHeight(): number {
        return this.app.stage.height;
    }
}