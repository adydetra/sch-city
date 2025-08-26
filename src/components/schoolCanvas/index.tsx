import './index.less';
import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { gui } from '../common/gui';
import { Sky } from 'three/examples/jsm/objects/Sky';
import Stats from 'stats.js';
import { initLoaders, load_gltf, load_texture } from '@/utils/loaders';
import Animations from '@/utils/animations';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Build, buildNameMap, build_data } from '@/config/data';
import classnames from 'classnames';
import locIcon from '@/resources/images/loc-icon.svg';
import { getDistanceFromPath, getNodesInShortestPathOrder } from '@/findPath/helper';
import { astar } from '@/findPath/astar';
import _ from 'lodash';
import Loading from '@/components/loading';
import { roadPoint } from '@/config/grid';
import { drawCircle, drawStreamingRoadLight, removeObj } from '@/utils';
import school from '@/resources/models/MapDepok3.glb';
import ground from '@/resources/textures/ground.png';
import {
  removeResizeListener,
  resizeEventListener,
  sizes,
  boardConfig,
} from '@/config/resize';
import {
  getPlayerPos,
  getPointerControl,
  initCollidableObjects,
  initPlayer,
  setPlayerPos,
  updatePlayer,
} from '../player_one';
import TWEEN from 'three/examples/jsm/libs/tween.module.js';
import Card from '../card';
import { llToCoord2 } from '@/utils/lngLatToXY';

interface LocationLike {
  latitude?: number;
  longitude?: number;
}

interface Props {
  loadingProcess: number;
  controlType: 'first' | 'god';
  // Properti lain yang dipakai komponen ini:
  location?: LocationLike;
  sceneReady?: boolean;
  tagsShow?: boolean;
  setSceneReady?: (v: boolean) => void;
}

type GuidePoint = Build & {
  id?: number;
  position?: THREE.Vector3;
  element?: HTMLElement | null;
};

class SchoolCanvas extends React.Component<Props> {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  targetLine: THREE.Object3D | null; // 目前选中建筑物提示光束
  schoolBuildMeshList: THREE.Object3D[]; // 建筑合集
  container: React.RefObject<HTMLDivElement>;
  orbitControls: OrbitControls | null;
  controls: any;
  grid: any[][];
  ground: THREE.Mesh | null;
  roadstreamingLine: THREE.Mesh | undefined;
  road: THREE.Object3D | null;
  redPoint: { row: number; col: number };
  redPointMesh: any;
  stats: Stats | null;
  Pointer: THREE.Vector2;
  HOVERED: any;
  circleMaterial: THREE.ShaderMaterial | null;
  cloudsArr: THREE.Object3D[];
  private _rafId: number | null;

  constructor(props: Props) {
    super(props);
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.orbitControls = null;
    this.controls = null;
    this.targetLine = null;
    this.schoolBuildMeshList = [];
    this.container = React.createRef<HTMLDivElement>();
    this.grid = Array.from({ length: boardConfig.rows }, () => new Array(boardConfig.cols));
    this.redPoint = { row: 400, col: 400 };
    this.redPointMesh = null;
    this.cloudsArr = [];
    this.stats = null;
    this.Pointer = new THREE.Vector2();
    this.HOVERED = null;
    this.circleMaterial = null;
    this.ground = null;
    this.road = null;
    this._rafId = null;
  }

  state = {
    loadingProcess: 0,
    dataInitProgress: 0,
    guidePointList: [] as GuidePoint[],
    showCard: false,
    currentCardValue: undefined as Build | undefined,
  };

  componentDidMount() {
    this.initThree();
  }

  componentWillUnmount() {
    // Hentikan RAF loop sebelum bersih-bersih
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    removeResizeListener();
    this.clearScene();
    // Hindari setState setelah unmount
    // @ts-ignore
    this.setState = () => {};
  }

  clearScene = () => {
    if (this.scene) {
      this.scene.traverse((child: any) => {
        if (child.material) {
          // handle material array
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => m?.dispose?.());
          } else {
            child.material.dispose?.();
          }
        }
        if (child.geometry) {
          child.geometry.dispose?.();
        }
      });
      this.scene.clear();
    }

    if (this.renderer) {
      // this.renderer.forceContextLoss?.(); // opsional
      this.renderer.dispose();
    }

    this.controls = null as any;
    this.orbitControls = null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
  };

  initThree = () => {
    this.initBaseScene();
    this.initLight();
    this.addAmbient();
    if (this.camera && this.renderer) {
      resizeEventListener(this.camera, this.renderer);
    }

    // 进度条加载器
    const manager = new THREE.LoadingManager(
      () => {
        // console.log('资源加载完毕！');
      },
      (_url, loaded, total) => {
        const pct = Math.floor((loaded / total) * 100);
        this.setState({ loadingProcess: pct });
      },
    );

    // 初始化加载器
    initLoaders(manager);
    // 加载地图
    this.loadMap();
    this.initGrid();
    // 添加鼠标悬浮事件
    this.addPointerHover();

    // Lingkaran lokasi
    const c = drawCircle();
    this.circleMaterial = c.material;
    // this.scene?.add(c.circle);

    const clock = new THREE.Clock();

    const animate = () => {
      // Guard apabila sudah dibersihkan
      if (!this.renderer || !this.scene || !this.camera) return;

      const delta = clock.getDelta();
      this._rafId = requestAnimationFrame(animate);

      this.stats && this.stats.update();
      const timer = Date.now() * 0.002;
      TWEEN && TWEEN.update();

      if (this.props.controlType === 'first' && this.controls?.isLocked === true) {
        updatePlayer(delta);
      }

      // Update lingkaran lokasi jika ada koordinat
      if (this.props.location?.latitude && this.props.location?.longitude) {
        const coor = llToCoord2([this.props.location.longitude, this.props.location.latitude]);
        c.circle.position.set(coor.col - 350, 1, coor.row - 470);
        this.circleMaterial && (this.circleMaterial.uniforms.time.value -= 0.06);
      }

      if (this.props.sceneReady) {
        // Cek interaksi point
        this.props.tagsShow && this.checkPointShow();
        if (this.props.controlType === 'god' && this.camera) {
          this.camera.position.y += Math.sin(timer) * 0.09;
        }
      } else {
        if (this.camera && this.camera.position.y < 1250 && this.camera.position.y > 500) {
          this.cloudsArr.forEach((item) => {
            if (item.name.includes('Cloudr')) {
              item.position.x -= delta * item.userData.x;
              item.position.z += delta * item.userData.z;
            } else {
              item.position.x += delta * item.userData.x;
              item.position.z -= delta * item.userData.z;
            }
          });
        }
      }

      this.renderer.render(this.scene, this.camera);
    };

    this._rafId = requestAnimationFrame(animate);
  };

  // 设置视角
  setControls = (type: 'god' | 'first') => {
    if (!this.camera) return;

    if (type === 'first') {
      this.camera.near = 1;
      this.camera.fov = 55;
      this.camera.far = 900;
      this.camera.updateProjectionMatrix();

      if (this.controls) this.controls.enabled = false;
      this.controls = getPointerControl();

      const pos = getPlayerPos();
      new TWEEN.Tween(this.camera.position)
        .to(pos, 2000)
        .easing(TWEEN.Easing.Exponential.Out)
        .start();
      new TWEEN.Tween(this.camera.rotation)
        .to({ x: 0, y: (5 * Math.PI) / 4, z: 0 }, 2000)
        .easing(TWEEN.Easing.Exponential.Out)
        .start();
    } else {
      setPlayerPos();
      this.camera.near = 10;
      this.camera.fov = 75;
      this.camera.far = 2000;
      this.camera.updateProjectionMatrix();
      this.controls = this.orbitControls;
      if (this.controls) this.controls.enabled = true;
      setTimeout(() => {
        this.initCamera(1500);
      }, 100);
    }
  };

  // 初始化基本场景
  initBaseScene = () => {
    // Pastikan canvas ada
    const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement | null;
    if (!canvas) return;

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // 场景
    this.scene = new THREE.Scene();

    // 相机
    this.camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 10, 2000);
    this.camera.position.set(120, 1280, 120);

    // 轨道
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.target.set(0, 0, 0);
    this.orbitControls.enableDamping = true;
    this.orbitControls.enablePan = false; // 禁止平移
    this.orbitControls.maxPolarAngle = 1.5;
    this.orbitControls.minDistance = 100;
    this.orbitControls.maxDistance = 2000;
    this.controls = this.orbitControls;

    // 初始化鼠标控制器（第一人称）
    initPlayer(this.scene, this.camera, this.renderer);
  };

  // 初始化灯光
  initLight = () => {
    if (!this.scene) return;
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);
    // 平行光
    const directLight = new THREE.DirectionalLight(0xffffff, 4);
    directLight.position.set(10, 0, 200);
    this.scene.add(directLight);

    // this.initGUI({ ambientLight, directLight });
  };

  // 增加环境
  addAmbient = () => {
    if (!this.scene || !this.renderer) return;
    // 天空
    const sky = new Sky();
    sky.scale.setScalar(10000);
    this.scene.add(sky);
    const skyUniforms = (sky.material as THREE.ShaderMaterial).uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 3;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.08;

    // 太阳
    const sun = new THREE.Vector3();
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const phi = THREE.MathUtils.degToRad(89);
    const theta = THREE.MathUtils.degToRad(200);
    sun.setFromSphericalCoords(1, phi, theta);

    (sky.material as THREE.ShaderMaterial).uniforms['sunPosition'].value.copy(sun);
    this.scene.environment = pmremGenerator.fromScene(sky).texture;
  };

  // 初始化网格
  initGrid = () => {
    for (let i = 0; i < roadPoint.length; i++) {
      const row = roadPoint[i].row;
      const col = roadPoint[i].col;
      this.grid[row][col] = this.createNode(row, col, 'default');
    }
    for (let i = 0; i < boardConfig.rows; i++) {
      for (let j = 0; j < boardConfig.cols; j++) {
        if (!this.grid[i][j]) {
          this.grid[i][j] = this.createNode(i, j, 'wall');
        }
      }
    }
  };

  // 创建节点
  createNode = (row: number, col: number, status: string) => {
    return {
      id: row * boardConfig.cols + col,
      row,
      col,
      status,
      distance: Infinity,
      totalDistance: Infinity,
      heuristicDistance: null,
      direction: null,
      weight: 0,
      previousNode: null,
    };
  };

  resetNavigation = () => {
    if (!this.roadstreamingLine) return;
    for (let i = 0; i < roadPoint.length; i++) {
      const row = roadPoint[i].row;
      const col = roadPoint[i].col;
      Object.assign(this.grid[row][col], {
        status: 'default',
        distance: Infinity,
        totalDistance: Infinity,
        heuristicDistance: null,
        direction: null,
        weight: 0,
        previousNode: null,
      });
    }
    if (this.scene) {
      this.scene.remove(this.roadstreamingLine);
    }
    this.roadstreamingLine = null;
  };

  // 加载平面（opsional untuk debug grid)
  loadPlain = () => {
    if (!this.scene) return;

    let gridWidth = boardConfig.cols * boardConfig.nodeDimensions.width,
      gridHeight = boardConfig.rows * boardConfig.nodeDimensions.height;

    let groundGeometry = new THREE.PlaneGeometry(gridWidth, gridHeight, gridWidth, gridHeight);
    groundGeometry.rotateX(-Math.PI / 2);

    load_texture.load(
      ground,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = boardConfig.rows;
        texture.repeat.y = boardConfig.cols;

        const groundMaterial = new THREE.MeshLambertMaterial({
          map: texture,
          side: THREE.FrontSide,
          vertexColors: false,
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.position.y = 0.3;
        this.ground.position.set(50, 0, -70);
        // this.scene.add(this.ground);

        const size = boardConfig.cols * boardConfig.nodeDimensions.height;
        const divisions = boardConfig.cols;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x5c78bd, 0x5c78bd);
        gridHelper.position.set(
          this.ground.position.x,
          this.ground.position.y + 1,
          this.ground.position.z,
        );
        this.scene!.add(gridHelper);
      },
      undefined,
      function (error) {
        console.log(error);
      },
    );
  };

  // 校园地图加载
  loadMap = () => {
    load_gltf.load(school, (gltf: GLTF) => {
      if (!this.scene) return;

      const school_map = gltf.scene;
      school_map.position.set(0, 0, 0);
      school_map.rotateY(Math.PI);
      this.scene.add(school_map);

      school_map.traverse((obj: any) => {
        if (obj.name === '道路') {
          this.road = obj;
        }
        if (obj.name == 'Gedung-pengajaran-Fakultas-Teknik-(sedang-dibangun)') {
          obj.name = 'Gedung-pengajaran-Fakultas-Teknik-(sedang-dibangun)';
        }
        if (buildNameMap.has(obj.name)) {
          this.schoolBuildMeshList.push(obj);
          this.initGuidePoint(obj);
        }
        if (obj.name.includes('Cloud')) {
          this.cloudsArr.push(obj);
        }
        if (obj.name.includes('山')) {
          this.schoolBuildMeshList.push(obj);
          obj.material = new THREE.MeshLambertMaterial({
            color: '#5C9034',
          });
        }
      });
    });
  };

  // 开始寻路
  startFindPath = (start: Build, finish: Build) => {
    const startNode = this.grid[start.coordinate.row][start.coordinate.col];
    const finishNode = this.grid[finish.coordinate.row][finish.coordinate.col];
    let nodesToAnimate: any = [];
    const find_result = astar(this.grid, startNode, finishNode, nodesToAnimate);
    if (find_result == false) return null;

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    const length = getDistanceFromPath(nodesInShortestPathOrder);
    this.animatePath(nodesInShortestPathOrder);
    return length;
  };

  // 画出最短路径
  animatePath = (nodesInShortestPathOrder: any[]) => {
    if (!this.scene) return;
    const { mesh } = drawStreamingRoadLight(nodesInShortestPathOrder);
    this.roadstreamingLine = mesh;
    this.scene.add(this.roadstreamingLine);
  };

  // 检查建筑物的名字是否展示
  checkPointShow = () => {
    if (!this.camera) return;

    const raycaster = new THREE.Raycaster();

    for (const point of this.state.guidePointList) {
      // Daftarkan element DOM
      if (!point.element) {
        const element = document.querySelector('.build_' + point.id) as HTMLElement | null;
        if (!element) continue;
        point.element = element;
        this.addPointClickSelect('.build_' + point.id, point.position!, point);
      }

      // 3D->NDC
      const screenPosition = point.position!.clone();
      screenPosition.project(this.camera);

      // raycaster butuh Vector2 (x,y) di NDC
      const ndc = new THREE.Vector2(screenPosition.x, screenPosition.y);
      raycaster.setFromCamera(ndc, this.camera);

      const intersects = raycaster.intersectObjects(this.schoolBuildMeshList, false);
      const pointDistance = point.position!.distanceTo(this.camera.position);

      if (intersects.length) {
        const intersectionDistance = intersects[0].distance;
        if ((intersects[0].object as any).name === point.name) {
          point.element!.classList.add('visible');
        } else {
          intersectionDistance < pointDistance
            ? point.element!.classList.remove('visible')
            : point.element!.classList.add('visible');
        }
      } else {
        point.element!.classList.add('visible');
      }

      if (pointDistance > 800) {
        point.element!.classList.remove('visible');
      }

      const translateX = screenPosition.x * sizes.width * 0.5;
      const translateY = -screenPosition.y * sizes.height * 0.5;

      if (point.element && point.element.style) {
        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
      }
    }
  };

  // 检查建筑物是否被鼠标hover
  checkBuildHover = () => {
    if (!this.camera) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.Pointer, this.camera);
    const intersects = raycaster.intersectObjects(this.schoolBuildMeshList, false);
    if (intersects.length > 0) {
      if (this.HOVERED !== intersects[0].object) {
        if (this.HOVERED) {
          this.HOVERED.scale.set(1, 1, 1);
        }
        this.HOVERED = intersects[0].object;
        this.HOVERED.scale.set(1.1, 1.1, 1.1);
      }
    } else {
      if (this.HOVERED) {
        this.HOVERED.scale.set(1, 1, 1);
      }
      this.HOVERED = null;
    }
  };

  // 初始化相机位置
  initCamera = (time: number, callback?: () => void) => {
    if (!this.camera || !this.controls || !this.scene) return;

    this.state.showCard && this.setState({ showCard: false });
    if (this.cloudsArr && this.cloudsArr.length) {
      this.cloudsArr.forEach((item) => {
        this.scene!.remove(item);
        removeObj(item);
      });
      this.cloudsArr = [];
    }

    Animations.animateCamera(
      this.camera,
      this.controls,
      { x: 0, y: 250, z: 190 },
      { x: 0, y: 0, z: 0 },
      time,
      callback,
    );
  };

  resetCamera = () => {
    this.initCamera(3200, () => {
      if (this.orbitControls) this.orbitControls.maxDistance = 700;
      this.props.setSceneReady?.(true);
      // Tambahkan acara klik gedung
      this.addBuildClickSelect();
      // Inisialisasi pengumpulan tabrakan
      if (this.scene) initCollidableObjects(this.scene.children);
    });
  };

  // Inisialisasi titik interaksi navigasi
  initGuidePoint = (mesh: THREE.Object3D) => {
    let guideInfo: GuidePoint | null = null;
    build_data.forEach((obj) => {
      if (obj.name === (mesh as any).name) {
        guideInfo = { ...(obj as any) };
        if ((guideInfo as any).name === '25号楼菜鸟驿站') {
          (guideInfo as any).name = '25号楼/菜鸟驿站';
        }
      }
    });
    if (guideInfo) {
      const w_pos = new THREE.Vector3();
      (mesh as any).getWorldPosition(w_pos);
      guideInfo.position = new THREE.Vector3(w_pos.x, w_pos.y * 1.1, w_pos.z);
      guideInfo.id = (mesh as any).id;
      this.setState((prev: any) => ({
        guidePointList: [...prev.guidePointList, guideInfo],
      }));
    }
  };

  // Tambahkan acara klik elemen (DOM label)
  addPointClickSelect = (className: string, position: THREE.Vector3, cardValue: Build) => {
    const el = document.querySelector(className);
    if (!el) return;

    el.addEventListener('click', () => {
      this.state.showCard && this.setState({ showCard: false });
      if (!this.camera || !this.controls) return;

      Animations.animateCamera(
        this.camera,
        this.controls,
        { x: position.x - 10, y: position.y + 80, z: position.z + 80 },
        { x: position.x - 50, y: position.y, z: position.z },
        1500,
        () => {
          if (this.controls) this.controls.enabled = false;
          this.setState({ showCard: true, currentCardValue: cardValue });
        },
      );
    });
  };

  // Tambahkan acara hover pointer global
  addPointerHover = () => {
    document.addEventListener('mousemove', (event) => {
      this.Pointer.x = (event.clientX / sizes.width) * 2 - 1;
      this.Pointer.y = -(event.clientY / sizes.height) * 2 + 1;
    });
  };

  // Tambahkan acara klik gedung (raycast dari mouse)
  addBuildClickSelect = () => {
    // Contoh stub; implement asli kamu kemungkinan di-comment.
    // Biarkan kosong untuk sekarang, karena label DOM sudah bisa klik kamera.
  };

  // Pengaturan GUI (opsional)
  initGUI = (lighter: any) => {
    // ...
  };

  render() {
    return (
      <div
        ref={this.container}
        className="school"
        onClick={() => {
          if (this.props.controlType === 'first' && this.controls?.lock) {
            this.controls.lock();
          }
        }}
      >
        <canvas className="webgl"></canvas>

        {/* Bilah kemajuan */}
        <Loading progress={this.state.loadingProcess} initCamera={this.resetCamera} />

        {/* Render elemen interaktif */}
        <div style={{ visibility: this.props.tagsShow ? 'visible' : 'hidden' }}>
          {this.state.guidePointList.length > 0 &&
            this.state.guidePointList.map((obj: any) => {
              return (
                <div className={classnames('point', 'build_' + obj.id)} key={obj.id}>
                  <div className="dynamic">
                    <img src={locIcon} className="label-icon" />
                    <span className="name">{obj.name}</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Kartu perkenalan */}
        <Card
          showCard={this.state.showCard}
          hideCard={() => this.setState({ showCard: false })}
          build={this.state.currentCardValue}
          backCamera={this.initCamera}
        />
      </div>
    );
  }
}

export default SchoolCanvas;
