import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const { ipcRenderer } = window.require('electron');

let tabs = [];
let activeTabIndex = 0;
let tabCounter = 1;

class ModelTab {
    constructor(index, name = `Model ${index + 1}`) {
        this.index = index;
        this.name = name;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.grid = null;
        this.container = null;
        this.isWireframe = false;
        this.initialized = false;
    }

    dispose() {
        if (this.model) {
            this.scene.remove(this.model);
            if (this.model.geometry) this.model.geometry.dispose();
            if (this.model.material) this.model.material.dispose();
        }
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container && this.renderer.domElement) {
                this.container.removeChild(this.renderer.domElement);
            }
        }
        if (this.controls) this.controls.dispose();
    }
}

function initTab(tab) {
    if (tab.initialized) return;
    
    const viewport = tab.container;
    
    tab.scene = new THREE.Scene();
    tab.scene.background = new THREE.Color(0x1a1a1a);
    
    tab.camera = new THREE.PerspectiveCamera(
        75,
        viewport.clientWidth / viewport.clientHeight,
        0.1,
        10000
    );
    tab.camera.position.set(100, 100, 100);
    
    tab.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
    });
    tab.renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    tab.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    tab.renderer.shadowMap.enabled = false;
    tab.renderer.domElement.style.position = 'absolute';
    tab.renderer.domElement.style.top = '0';
    tab.renderer.domElement.style.left = '0';
    tab.renderer.domElement.dataset.tabCanvas = tab.index;
    viewport.appendChild(tab.renderer.domElement);
    
    tab.controls = new OrbitControls(tab.camera, tab.renderer.domElement);
    tab.controls.enableDamping = true;
    tab.controls.dampingFactor = 0.05;
    tab.controls.screenSpacePanning = false;
    tab.controls.minDistance = 1;
    tab.controls.maxDistance = 5000;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    tab.scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight1.position.set(100, 100, 50);
    tab.scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-100, -100, -50);
    tab.scene.add(directionalLight2);
    
    tab.grid = new THREE.GridHelper(200, 20, 0x00d4ff, 0x444444);
    tab.scene.add(tab.grid);
    
    const axesHelper = new THREE.AxesHelper(100);
    tab.scene.add(axesHelper);
    
    tab.initialized = true;
}

function animate() {
    requestAnimationFrame(animate);
    
    const activeTab = tabs[activeTabIndex];
    if (activeTab && activeTab.initialized) {
        activeTab.controls.update();
        activeTab.renderer.render(activeTab.scene, activeTab.camera);
    }
}

function onWindowResize() {
    tabs.forEach(tab => {
        if (tab.initialized && tab.container) {
            tab.camera.aspect = tab.container.clientWidth / tab.container.clientHeight;
            tab.camera.updateProjectionMatrix();
            tab.renderer.setSize(tab.container.clientWidth, tab.container.clientHeight);
        }
    });
}

function loadModel(data, extension, filename) {
    const tab = tabs[activeTabIndex];
    if (!tab) return;
    
    if (!tab.initialized) {
        initTab(tab);
    }
    
    if (tab.model) {
        tab.scene.remove(tab.model);
        if (tab.model.geometry) tab.model.geometry.dispose();
        if (tab.model.material) tab.model.material.dispose();
        tab.model = null;
    }
    
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) dropZone.classList.add('hidden');
    
    let loader;
    let geometry;
    
    if (extension === '.stl') {
        loader = new STLLoader();
        geometry = loader.parse(data.buffer);
    } else if (extension === '.obj') {
        loader = new OBJLoader();
        const text = new TextDecoder().decode(data);
        const object = loader.parse(text);
        
        object.traverse((child) => {
            if (child.isMesh) {
                geometry = child.geometry;
            }
        });
    }
    
    if (geometry) {
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        
        const boundingBox = geometry.boundingBox;
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 100 / maxDim;
        geometry.scale(scale, scale, scale);
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x00d4ff,
            specular: 0x111111,
            shininess: 200,
            side: THREE.DoubleSide
        });
        
        tab.model = new THREE.Mesh(geometry, material);
        tab.scene.add(tab.model);
        
        updateTabName(activeTabIndex, filename);
        updateModelInfo(filename, geometry, size);
        
        resetCamera();
    }
}

function updateModelInfo(filename, geometry, size) {
    document.getElementById('filename').textContent = filename;
    
    const vertices = geometry.attributes.position ? 
        geometry.attributes.position.count : 0;
    document.getElementById('vertices').textContent = vertices.toLocaleString();
    
    const faces = geometry.index ? 
        geometry.index.count / 3 : vertices / 3;
    document.getElementById('faces').textContent = Math.floor(faces).toLocaleString();
    
    document.getElementById('dimensions').textContent = 
        `${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`;
}

function resetCamera() {
    const tab = tabs[activeTabIndex];
    if (!tab || !tab.initialized) return;
    
    tab.camera.position.set(100, 100, 100);
    tab.camera.lookAt(0, 0, 0);
    tab.controls.reset();
}

function toggleWireframe() {
    const tab = tabs[activeTabIndex];
    if (!tab || !tab.model) return;
    
    tab.isWireframe = !tab.isWireframe;
    tab.model.material.wireframe = tab.isWireframe;
}

function toggleGrid() {
    const tab = tabs[activeTabIndex];
    if (!tab || !tab.grid) return;
    
    tab.grid.visible = !tab.grid.visible;
}

const moveStep = 5;
const rotateStep = Math.PI / 18;
const scaleStep = 0.1;

function moveModel(axis, direction) {
    const tab = tabs[activeTabIndex];
    if (!tab || !tab.model) return;
    
    const movement = moveStep * direction;
    if (axis === 'x') tab.model.position.x += movement;
    if (axis === 'y') tab.model.position.y += movement;
    if (axis === 'z') tab.model.position.z += movement;
}

function rotateModel(axis, direction) {
    const tab = tabs[activeTabIndex];
    if (!tab || !tab.model) return;
    
    const rotation = rotateStep * direction;
    if (axis === 'x') tab.model.rotation.x += rotation;
    if (axis === 'y') tab.model.rotation.y += rotation;
    if (axis === 'z') tab.model.rotation.z += rotation;
}

function scaleModel(direction) {
    const tab = tabs[activeTabIndex];
    if (!tab || !tab.model) return;
    
    const newScale = tab.model.scale.x + (scaleStep * direction);
    if (newScale > 0.1 && newScale < 10) {
        tab.model.scale.set(newScale, newScale, newScale);
    }
}

function resetModelTransform() {
    const tab = tabs[activeTabIndex];
    if (!tab || !tab.model) return;
    
    tab.model.position.set(0, 0, 0);
    tab.model.rotation.set(0, 0, 0);
    tab.model.scale.set(1, 1, 1);
}

function createNewTab() {
    const index = tabs.length;
    const tab = new ModelTab(index, `Model ${tabCounter++}`);
    
    const viewport = document.getElementById('viewport');
    tab.container = viewport;
    
    const tabsContainer = document.getElementById('tabs-container');
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tab = index;
    tabElement.innerHTML = `
        <span class="tab-name">${tab.name}</span>
        <button class="tab-close">×</button>
    `;
    tabsContainer.appendChild(tabElement);
    
    tabs.push(tab);
    switchTab(index);
    initTabClickListeners();
}

function switchTab(index) {
    if (index < 0 || index >= tabs.length) return;
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    tabs.forEach((t, i) => {
        if (t.renderer && t.renderer.domElement) {
            t.renderer.domElement.style.display = (i === index) ? 'block' : 'none';
        }
    });
    
    const tab = tabs[index];
    
    const activeTabElement = document.querySelector(`.tab[data-tab="${index}"]`);
    if (activeTabElement) {
        activeTabElement.classList.add('active');
    }
    
    activeTabIndex = index;
    
    if (!tab.initialized && tab.container) {
        initTab(tab);
    }
    
    const viewport = document.getElementById('viewport');
    const dropZone = document.getElementById('drop-zone');
    
    if (tab.model) {
        if (dropZone) dropZone.classList.add('hidden');
    } else {
        if (dropZone) dropZone.classList.remove('hidden');
    }
}

function closeTab(index) {
    if (tabs.length <= 1) return;
    if (index < 0 || index >= tabs.length) return;
    
    const tab = tabs[index];
    tab.dispose();
    
    if (tab.container) tab.container.remove();
    const tabToRemove = document.querySelector(`.tab[data-tab="${index}"]`);
    if (tabToRemove) tabToRemove.remove();
    
    tabs.splice(index, 1);
    
    const newIndex = index >= tabs.length ? tabs.length - 1 : index;
    
    tabs.forEach((t, i) => {
        t.index = i;
        if (t.container) t.container.dataset.viewport = i;
    });
    
    const allTabElements = document.querySelectorAll('.tab');
    allTabElements.forEach((tabEl, i) => {
        tabEl.dataset.tab = i;
    });
    
    if (activeTabIndex >= tabs.length) {
        activeTabIndex = tabs.length - 1;
    }
    
    switchTab(newIndex);
    initTabClickListeners();
}

function updateTabName(index, name) {
    if (index < 0 || index >= tabs.length) return;
    
    const shortName = name.length > 20 ? name.substring(0, 17) + '...' : name;
    tabs[index].name = shortName;
    
    const tabElement = document.querySelector(`.tab[data-tab="${index}"] .tab-name`);
    if (tabElement) tabElement.textContent = shortName;
}

function initTabClickListeners() {
    document.querySelectorAll('.tab').forEach((tabElement) => {
        const newElement = tabElement.cloneNode(true);
        tabElement.parentNode.replaceChild(newElement, tabElement);
        
        newElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) {
                e.stopPropagation();
                const tabIndex = parseInt(newElement.dataset.tab);
                closeTab(tabIndex);
            } else {
                const tabIndex = parseInt(newElement.dataset.tab);
                switchTab(tabIndex);
            }
        });
    });
}

function initEventListeners() {
    const btn = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };
    
    btn('open-file', () => ipcRenderer.send('open-file'));
    btn('new-tab', createNewTab);
    btn('reset-view', resetCamera);
    btn('toggle-wireframe', toggleWireframe);
    btn('toggle-grid', toggleGrid);
    
    btn('move-x-pos', () => moveModel('x', 1));
    btn('move-x-neg', () => moveModel('x', -1));
    btn('move-y-pos', () => moveModel('y', 1));
    btn('move-y-neg', () => moveModel('y', -1));
    btn('move-z-pos', () => moveModel('z', 1));
    btn('move-z-neg', () => moveModel('z', -1));
    
    btn('rotate-x-pos', () => rotateModel('x', 1));
    btn('rotate-x-neg', () => rotateModel('x', -1));
    btn('rotate-y-pos', () => rotateModel('y', 1));
    btn('rotate-y-neg', () => rotateModel('y', -1));
    btn('rotate-z-pos', () => rotateModel('z', 1));
    btn('rotate-z-neg', () => rotateModel('z', -1));
    
    btn('scale-up', () => scaleModel(1));
    btn('scale-down', () => scaleModel(-1));
}

function initDragDrop() {
    const viewport = document.getElementById('viewport');

    viewport.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    viewport.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    viewport.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const fileName = file.name;
            const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
            
            if (extension === '.stl' || extension === '.obj') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = new Uint8Array(event.target.result);
                    loadModel(data, extension, file.name);
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert('Nepodporovany format! Pouzi STL alebo OBJ subor.');
            }
        }
    });
}

document.addEventListener('keydown', (e) => {
    const tab = tabs[activeTabIndex];
    if (!tab || !tab.model) return;
    
    switch(e.key.toLowerCase()) {
        case 'w': moveModel('z', -1); break;
        case 's': moveModel('z', 1); break;
        case 'a': moveModel('x', -1); break;
        case 'd': moveModel('x', 1); break;
        case 'q': rotateModel('y', -1); break;
        case 'e': rotateModel('y', 1); break;
        case '+': case '=': scaleModel(1); break;
        case '-': case '_': scaleModel(-1); break;
        case 'r': resetCamera(); break;
    }
});

ipcRenderer.on('load-model', (event, { data, extension, filename }) => {
    loadModel(data, extension, filename);
});

function init() {
    window.addEventListener('resize', onWindowResize);

    const firstTab = new ModelTab(0, 'Model 1');
    const viewport = document.getElementById('viewport');
    firstTab.container = viewport;
    tabs.push(firstTab);
    
    initTab(firstTab);

    initEventListeners();
    initTabClickListeners();
    initDragDrop();

    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
