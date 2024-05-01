
import HelloDragonBones from './adapters/pixi/demo/HelloDragonBones';
import DragonBonesEvent from './adapters/pixi/demo/DragonBonesEvent';
import EyeTracking from './adapters/pixi/demo/EyeTracking';
import InverseKinematics from './adapters/pixi/demo/InverseKinematics';
import AnimationLayer from './adapters/pixi/demo/AnimationLayer';
import ReplaceSkin from './adapters/pixi/demo/ReplaceSkin';
import BaseDemo from './adapters/pixi/demo/BaseDemo';
import ReplaceAnimation from './adapters/pixi/demo/ReplaceAnimation';
import AnimationBase from './adapters/pixi/demo/AnimationBase';
import PerformanceTest from './adapters/pixi/demo/PerformanceTest';
import MultiTextureAltas from './adapters/pixi/demo/MultiTextureAltas';
import ReplaceSlotDisplay from './adapters/pixi/demo/ReplaceSlotDisplay';
import BoneOffset from './adapters/pixi/demo/BoneOffset';
import BoundingBox from './adapters/pixi/demo/BoundingBox';
import { CoreElementGame } from './adapters/pixi/demo/CoreElement';

const demoApps: BaseDemo[] = [];
const buttons: HTMLButtonElement[] = [];
let currentDemo: BaseDemo;


demoApps.push(new HelloDragonBones());
demoApps.push(new DragonBonesEvent());
demoApps.push(new EyeTracking());
demoApps.push(new InverseKinematics());
demoApps.push(new AnimationLayer());
demoApps.push(new ReplaceSkin());
demoApps.push(new ReplaceAnimation());
demoApps.push(new ReplaceSlotDisplay())
demoApps.push(new AnimationBase());
demoApps.push(new PerformanceTest());
demoApps.push(new MultiTextureAltas());
demoApps.push(new BoneOffset());
demoApps.push(new BoundingBox());
demoApps.push(new CoreElementGame());

currentDemo = demoApps[0];

(async () => {
    await currentDemo.init();
})();
for (let i = 0; i < demoApps.length; i++) {
    const demo = demoApps[i];
    const button = document.createElement("button");
    buttons.push(button);
    button.innerText = demo.appName;
    button.onclick = async () => {
        if (currentDemo) {
            try {
                await currentDemo.destroy();
            } catch (e) {
                console.error(e);
            }
        }
        for (let j = 0; j < buttons.length; j++) {
            buttons[j].disabled = true;
        }
        currentDemo = demo;
        await currentDemo.init();
        for (let j = 0; j < buttons.length; j++) {
            buttons[j].disabled = false;
        }
    };
    document.body.appendChild(button);
}



