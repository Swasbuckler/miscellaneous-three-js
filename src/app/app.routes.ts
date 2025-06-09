import { Routes } from '@angular/router';
import { ShaderTutorialComponent } from './tutorials/shader-tutorial/shader-tutorial.component';
import { GrassTutorialComponent } from './tutorials/grass-tutorial/grass-tutorial.component';
import { ShaderRaycastComponent } from './projects/shader-raycast/shader-raycast.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { RaymarchingTutorialComponent } from './tutorials/raymarching-tutorial/raymarching-tutorial.component';
import { CloudTutorialComponent } from './tutorials/cloud-tutorial/cloud-tutorial.component';
import { CompiledShadersComponent } from './projects/compiled-shaders/compiled-shaders.component';

export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
        title: "Home"
    },
    {
        path: 'shader-tutorial',
        component: ShaderTutorialComponent,
        title: "Shader Tutorial"
    },
    {
        path: 'grass-tutorial',
        component: GrassTutorialComponent,
        title: "Grass Tutorial"
    },
    {
        path: 'raymarching-tutorial',
        component: RaymarchingTutorialComponent,
        title: "Raymarching Tutorial"
    },
    {
        path: 'cloud-tutorial',
        component: CloudTutorialComponent,
        title: "Cloud Tutorial"
    },
    {
        path: 'shader-raycast',
        component: ShaderRaycastComponent,
        title: "Shader Raycast"
    },
    {
        path: 'compiled-shaders',
        component: CompiledShadersComponent,
        title: "Compiled Shaders"
    },
];
