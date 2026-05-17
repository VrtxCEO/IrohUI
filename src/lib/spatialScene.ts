import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export type OsState = 'booting' | 'idle' | 'processing' | 'responding' | 'attention'

const TEXTURE_ROOT = '/models/DonP'
const ENVIRONMENT_MODEL_URL = '/models/DonP/DonP_Models.glb'
const EYE_MODEL_URL = '/models/Eye.glb'
const EYE_TEXTURE_ROOT = '/models'
const EYE_POSITION = new THREE.Vector3(0, -2.5, -0.5)
const EYE_SCALE = 0.3

interface CompositionPreset {
  yaw: number; pitch: number; radius: number
  focusPoint: THREE.Vector3
  eyeBasePosition: THREE.Vector3
  eyeScale: number
}

function createRadialTexture(innerColor: string, outerColor: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, innerColor)
  g.addColorStop(1, outerColor)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

export class SpatialScene {
  readonly camera: THREE.PerspectiveCamera
  environmentLoaded = false
  assetLoaded = false

  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private composer: EffectComposer
  private loader = new GLTFLoader()
  private textureLoader = new THREE.TextureLoader()

  private startTime: number
  private lastFrameTime: number

  private orbit = { yaw: 0.03, pitch: -0.01, radius: 7.25, targetYaw: 0.03, targetPitch: -0.01, targetRadius: 7.25, gyroYaw: 0, gyroPitch: 0 }

  private osState: OsState = 'booting'
  private connected = true
  private roomWake = 0.08; private roomWakeTarget = 0.08
  private eyeOpen = 0.02;  private eyeOpenTarget = 0.02
  private attentionFocus = 0; private attentionTarget = 0
  private glowStrength = 0.14; private glowStrengthTarget = 0.14
  private blinkElapsed = 0; private blinkDuration = 0
  private blinkTimer = 0

  private pointerTarget = new THREE.Vector2()
  private gazeOffset    = new THREE.Vector2()
  private raycaster     = new THREE.Raycaster()
  private pointerNdc    = new THREE.Vector2()

  private dragState: { pointerId: number; startX: number; startY: number; lastX: number; lastY: number; moved: boolean; hitEye: boolean; hitPanel: boolean } | null = null
  private touchState: { pinching: boolean; distance: number } | null = null
  private doubleTapTime = 0

  private focusPoint: THREE.Vector3
  private defaultFocusPoint: THREE.Vector3
  private eyeBasePosition: THREE.Vector3
  private defaultEyeBasePosition: THREE.Vector3
  private currentEyeScale = 0.6

  // scene objects
  private lights!: { topLight: THREE.SpotLight; sideLight1: THREE.PointLight; sideLight2: THREE.PointLight; portalLight: THREE.PointLight }
  private ceilingGlow!: THREE.Sprite
  private eyeGroup!: THREE.Group
  private glowSprite!: THREE.Sprite
  private eyeCoreGlow!: THREE.Sprite
  private sclera!: THREE.Mesh
  private irisCarrier!: THREE.Group
  private pupil!: THREE.Mesh
  private topLid!: THREE.Mesh
  private bottomLid!: THREE.Mesh
  private modelSlot!: THREE.Group
  private placeholderEyeRoot!: THREE.Group
  private environmentModelSlot!: THREE.Group
  private eyeHitTargets: THREE.Object3D[] = []
  private panelHitTargets: THREE.Object3D[] = []
  private panelObject: THREE.Object3D | null = null
  private panelLabel: THREE.Sprite | null = null
  private panelLocalInitPos = new THREE.Vector3()
  private panelLocalCurrPos = new THREE.Vector3()
  private panelLocalTargetPos = new THREE.Vector3()
  private panelActive = false
  onPanelClick?: () => void
  private environmentAnchors: { EyeAnchor: THREE.Object3D | null; CameraTarget: THREE.Object3D | null } = { EyeAnchor: null, CameraTarget: null }
  private environmentParts: Record<string, THREE.Object3D | null | undefined> = {}

  private tempBox    = new THREE.Box3()
  private tempSize   = new THREE.Vector3()
  private tempCenter = new THREE.Vector3()
  private tempVector = new THREE.Vector3()

  private compositionPresets: Record<string, CompositionPreset> = {
    procedural: {
      yaw: 0.03, pitch: -0.01, radius: 7.25,
      focusPoint: new THREE.Vector3(0, 0.18, -0.08),
      eyeBasePosition: new THREE.Vector3(0, 0.34, 0.18),
      eyeScale: 0.6,
    },
    additiveEnvironment: {
      yaw: 0, pitch: -0.07, radius: 8.95,
      focusPoint: new THREE.Vector3(0, -0.04, 0.08),
      eyeBasePosition: new THREE.Vector3(0, 0.66, 0.22),
      eyeScale: 0.6,
    },
    fullEnvironment: {
      yaw: 0, pitch: -0.38, radius: 7,
      focusPoint: new THREE.Vector3(0, -2.5, -2.24),
      eyeBasePosition: EYE_POSITION.clone(),
      eyeScale: EYE_SCALE,
    },
  }
  private activeComposition = 'procedural'

  // bound event handlers so we can remove them
  private _onResize       = () => this.resize()
  private _onPointerDown  = (e: PointerEvent)  => this.handlePointerDown(e)
  private _onPointerMove  = (e: PointerEvent)  => this.handlePointerMove(e)
  private _onPointerUp    = (e: PointerEvent)  => this.handlePointerUp(e)
  private _onWheel        = (e: WheelEvent)    => this.handleWheel(e)
  private _onTouchStart   = (e: TouchEvent)    => this.handleTouchStart(e)
  private _onTouchMove    = (e: TouchEvent)    => this.handleTouchMove(e)
  private _onTouchEnd     = (e: TouchEvent)    => this.handleTouchEnd(e)
  private _onDeviceOrient = (e: DeviceOrientationEvent) => this.handleDeviceOrientation(e)

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.startTime = performance.now() * 0.001
    this.lastFrameTime = this.startTime

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05

    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x071015, 0.12)

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    this.camera.position.set(0, 0.3, 7.25)

    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.45, 0.5, 0.6)
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(bloom)
    this.composer.addPass(new OutputPass())

    const p = this.compositionPresets.procedural
    this.defaultFocusPoint     = p.focusPoint.clone()
    this.focusPoint            = p.focusPoint.clone()
    this.defaultEyeBasePosition = p.eyeBasePosition.clone()
    this.eyeBasePosition       = p.eyeBasePosition.clone()

    this.createSharedScene()
    this.setupEnvironmentMap()
    this.resize()
    this.bindEvents()
    this.renderer.setAnimationLoop(() => this.animate())

    // boot eye open sequence
    this.setRoomWake(0.08)
    this.setEyeOpenTarget(0.02)
    setTimeout(() => { this.setRoomWake(0.62) }, 1450)
    setTimeout(() => { this.setEyeOpenTarget(1) }, 2200)
    setTimeout(() => { this.setRoomWake(1) }, 3000)

    this.tryLoadEnvironmentModel(ENVIRONMENT_MODEL_URL)
    this.tryLoadEyeModel(EYE_MODEL_URL)
    this.scheduleBlink()
  }

  destroy() {
    window.clearTimeout(this.blinkTimer)
    this.renderer.setAnimationLoop(null)
    this.unbindEvents()
    this.renderer.dispose()
  }

  // ─── public API ───────────────────────────────────────────────────────────

  setOsState(state: OsState) {
    this.osState = state
    if (state === 'processing')  { this.glowStrengthTarget = 0.34 }
    else if (state === 'responding') { this.glowStrengthTarget = 0.48 }
    else if (state === 'attention')  { this.glowStrengthTarget = 0.26 }
    else                             { this.glowStrengthTarget = 0.14 }
  }

  setConnected(connected: boolean) {
    this.connected = connected
    // dim the eye glow when offline
    if (!connected) this.glowStrengthTarget = 0.04
  }

  triggerBlink(duration = 0.24) {
    this.blinkDuration = duration
    this.blinkElapsed  = duration
    this.scheduleBlink()
  }

  recenterCamera() {
    const p = this.compositionPresets[this.activeComposition] ?? this.compositionPresets.procedural
    this.orbit.targetYaw    = p.yaw
    this.orbit.targetPitch  = p.pitch
    this.orbit.targetRadius = p.radius
    this.pointerTarget.set(0, 0)
  }

  orbitBy(dx: number, dy: number) {
    this.orbit.targetYaw   = THREE.MathUtils.clamp(this.orbit.targetYaw   - dx * 0.0034, -0.28, 0.28)
    this.orbit.targetPitch = THREE.MathUtils.clamp(this.orbit.targetPitch - dy * 0.0034, -0.55, 0.18)
  }

  zoomBy(delta: number) {
    this.orbit.targetRadius = THREE.MathUtils.clamp(this.orbit.targetRadius + delta, 3.5, 18)
  }

  setPointerTarget(x: number, y: number) {
    this.pointerTarget.set(THREE.MathUtils.clamp(x, -0.5, 0.5), THREE.MathUtils.clamp(y, -0.5, 0.5))
  }

  setRoomWake(v: number)       { this.roomWakeTarget = v }
  setEyeOpenTarget(v: number)  { this.eyeOpenTarget  = v }

  setAttentionTarget(active: boolean) {
    this.attentionTarget = active ? 1 : 0
    if (active) {
      this.orbit.targetRadius = 5.72
      this.pointerTarget.set(0, -0.04)
    } else {
      const p = this.compositionPresets[this.activeComposition] ?? this.compositionPresets.procedural
      this.orbit.targetRadius = p.radius
    }
  }

  resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    this.renderer.setSize(w, h, false)
    this.composer.setSize(w, h)
  }

  hitTestEye(clientX: number, clientY: number): boolean {
    const rect = this.canvas.getBoundingClientRect()
    this.pointerNdc.x =  ((clientX - rect.left) / rect.width)  * 2 - 1
    this.pointerNdc.y = -((clientY - rect.top)  / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointerNdc, this.camera)
    return this.raycaster.intersectObjects(this.eyeHitTargets, true).length > 0
  }

  hitTestPanel(clientX: number, clientY: number): boolean {
    if (!this.panelHitTargets.length) return false
    const rect = this.canvas.getBoundingClientRect()
    this.pointerNdc.x =  ((clientX - rect.left) / rect.width)  * 2 - 1
    this.pointerNdc.y = -((clientY - rect.top)  / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointerNdc, this.camera)
    return this.raycaster.intersectObjects(this.panelHitTargets, true).length > 0
  }

  activatePanel() {
    const panel = this.panelObject
    if (!panel?.parent) return
    panel.parent.updateWorldMatrix(true, false)
    const localTarget = this.focusPoint.clone()
    panel.parent.worldToLocal(localTarget)
    this.panelLocalTargetPos.copy(localTarget)
    this.panelActive = true
    if (this.panelLabel) this.panelLabel.visible = false
  }

  deactivatePanel() {
    this.panelLocalTargetPos.copy(this.panelLocalInitPos)
    this.panelActive = false
    if (this.panelLabel) this.panelLabel.visible = true
  }

  // ─── scene setup ──────────────────────────────────────────────────────────

  private createPanelLabel(): THREE.Sprite {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 256, 64)
    ctx.font = '600 26px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(140,185,255,0.88)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CHAT', 128, 32)
    const texture = new THREE.CanvasTexture(canvas)
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
    const sprite = new THREE.Sprite(mat)
    sprite.scale.set(0.9, 0.22, 1)
    return sprite
  }

  private createSharedScene() {
    const topLight    = new THREE.SpotLight(0xa4b1ff, 1.0, 18, Math.PI / 6, 0.4, 2)
    const sideLight1  = new THREE.PointLight(0xacadff, 0.5, 8, 2)
    const sideLight2  = new THREE.PointLight(0xacadff, 0.5, 8, 2)
    const portalLight = new THREE.PointLight(0x7755cc, 6, 16, 2)
    topLight.position.set(0, 3.06, 0)
    topLight.target.position.set(0, 0, 0)
    sideLight1.position.set(1.72, 1.98, -0.28)
    sideLight2.position.set(-1.72, 1.98, -0.28)
    portalLight.position.set(0, 0.8, -3.2)
    this.scene.add(topLight, topLight.target, sideLight1, sideLight2, portalLight)
    this.lights = { topLight, sideLight1, sideLight2, portalLight }

    this.ceilingGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: createRadialTexture('rgba(160,200,255,1.0)', 'rgba(80,130,255,0)'),
      transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    this.ceilingGlow.scale.set(3.5, 9.0, 1)
    this.ceilingGlow.position.set(0, 3.1, 0)
    this.scene.add(this.ceilingGlow)

    this.environmentModelSlot = new THREE.Group()
    this.scene.add(this.environmentModelSlot)

    this.eyeGroup = new THREE.Group()
    this.eyeGroup.position.copy(this.defaultEyeBasePosition)
    this.scene.add(this.eyeGroup)

    this.placeholderEyeRoot = this.createPlaceholderEye()
    this.eyeGroup.add(this.placeholderEyeRoot)

    this.modelSlot = new THREE.Group()
    this.eyeGroup.add(this.modelSlot)
    this.eyeGroup.visible = true

    this.glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: createRadialTexture('rgba(175,244,255,0.96)', 'rgba(175,244,255,0)'),
      transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    this.glowSprite.scale.set(3.1, 3.1, 1)
    this.glowSprite.position.set(0, 0.02, 0.15)
    this.eyeGroup.add(this.glowSprite)
  }

  private setupEnvironmentMap() {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 32
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 32)
    g.addColorStop(0,   '#1a2d55')
    g.addColorStop(0.5, '#0d1830')
    g.addColorStop(1,   '#05080f')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 32)
    const tex = new THREE.CanvasTexture(c)
    tex.mapping = THREE.EquirectangularReflectionMapping
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    pmrem.compileEquirectangularShader()
    this.scene.environment = pmrem.fromEquirectangular(tex).texture
    this.scene.environmentIntensity = 2.2
    tex.dispose()
    pmrem.dispose()
  }

  private createPlaceholderEye(): THREE.Group {
    const root = new THREE.Group()

    const eyeCoreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: createRadialTexture('rgba(106,201,255,1)', 'rgba(106,201,255,0)'),
      transparent: true, opacity: 0.44, blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    eyeCoreGlow.scale.set(1.12, 1.12, 1)
    eyeCoreGlow.position.z = 0.48
    this.eyeCoreGlow = eyeCoreGlow

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.76, 64, 64),
      new THREE.MeshPhysicalMaterial({ color: 0xe6ecef, roughness: 0.28, metalness: 0.04, clearcoat: 0.54, clearcoatRoughness: 0.2 }),
    )
    sclera.scale.set(0.98, 0.74, 0.82)
    sclera.position.z = 0.12
    this.sclera = sclera

    const irisCarrier = new THREE.Group()
    irisCarrier.position.z = 0.7
    this.irisCarrier = irisCarrier

    const irisRing = new THREE.Mesh(
      new THREE.SphereGeometry(0.39, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0x0f2029, roughness: 0.5, metalness: 0.18, emissive: 0x3a7e92, emissiveIntensity: 0.14 }),
    )
    irisRing.scale.z = 0.18

    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 48, 48),
      new THREE.MeshPhysicalMaterial({ color: 0x6fd8ea, roughness: 0.22, metalness: 0.08, clearcoat: 0.42, clearcoatRoughness: 0.12, emissive: 0x2d7f90, emissiveIntensity: 0.28 }),
    )
    iris.scale.z = 0.16
    iris.position.z = 0.02

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x010203, roughness: 0.5, metalness: 0.02 }),
    )
    pupil.scale.z = 0.22
    pupil.position.z = 0.1
    this.pupil = pupil

    const specular = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.78 }),
    )
    specular.position.set(-0.09, 0.1, 0.14)

    irisCarrier.add(irisRing, iris, pupil, specular)

    const lidMat = new THREE.MeshStandardMaterial({ color: 0x303f4a, roughness: 0.9, metalness: 0.08 })
    const topLid    = new THREE.Mesh(new THREE.SphereGeometry(0.84, 48, 48), lidMat)
    const bottomLid = new THREE.Mesh(new THREE.SphereGeometry(0.84, 48, 48), lidMat)
    topLid.scale.set(1.18, 0.54, 0.95);    topLid.position.z    = 0.1
    bottomLid.scale.set(1.18, 0.54, 0.95); bottomLid.position.z = 0.1
    this.topLid = topLid; this.bottomLid = bottomLid

    root.add(sclera, irisCarrier, topLid, bottomLid, eyeCoreGlow)
    root.scale.setScalar(1.12)
    this.eyeHitTargets = [this.sclera]
    return root
  }

  // ─── model loading ────────────────────────────────────────────────────────

  private async tryLoadEnvironmentModel(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (!res.ok) return false
    } catch { return false }

    return new Promise((resolve) => {
      this.loader.load(url, (gltf) => {
        this.environmentModelSlot.clear()
        this.clearEnvironmentAnchors()
        const modelRoot = gltf.scene
        this.tempBox.setFromObject(modelRoot)
        this.tempBox.getSize(this.tempSize)
        this.tempBox.getCenter(this.tempCenter)
        const footprint = Math.max(this.tempSize.x, this.tempSize.z)

        modelRoot.position.sub(this.tempCenter)
        modelRoot.position.y -= this.tempBox.min.y

        const hasAnchors = ['EyeAnchor','CameraTarget'].some(n => gltf.scene.getObjectByName(n))
        const isFullEnv  = hasAnchors || footprint > 8 || this.tempSize.y > 2.5
        if (isFullEnv) { modelRoot.position.y -= 2.12 }
        else           { modelRoot.position.y -= 1.56 }

        this.tryApplySidecarTextures(modelRoot).finally(() => {
          this.environmentModelSlot.add(modelRoot)
          this.environmentLoaded = true
          this.environmentAnchors = {
            EyeAnchor:    modelRoot.getObjectByName('EyeAnchor')    ?? null,
            CameraTarget: modelRoot.getObjectByName('CameraTarget') ?? null,
          }
          this.environmentParts = {
            platformBase:      modelRoot.getObjectByName('Platform_Base'),
            platformMain:      modelRoot.getObjectByName('Platform_Main'),
            platformSecondary: modelRoot.getObjectByName('Platform_Main_B'),
            portal:            modelRoot.getObjectByName('Portal'),
            room:              modelRoot.getObjectByName('Room'),
            floatingPanel:     modelRoot.getObjectByName('FloatingPanel'),
          }
          const presetName = isFullEnv ? 'fullEnvironment' : 'additiveEnvironment'
          this.applyCompositionPreset(presetName)

          const fp = this.environmentParts['floatingPanel']
          if (fp) {
            this.panelObject = fp
            this.panelLocalInitPos.copy(fp.position)
            this.panelLocalCurrPos.copy(fp.position)
            this.panelLocalTargetPos.copy(fp.position)
            const hits: THREE.Object3D[] = []
            fp.traverse(n => { if ((n as THREE.Mesh).isMesh) hits.push(n) })
            this.panelHitTargets = hits.length ? hits : [fp]
            // "CHAT" label above the panel
            const box = new THREE.Box3().setFromObject(fp)
            const size = new THREE.Vector3()
            box.getSize(size)
            const label = this.createPanelLabel()
            label.position.set(0, size.y * 0.5 + 0.28, 0.08)
            fp.add(label)
            this.panelLabel = label
          }
          resolve(true)
        })
      }, undefined, () => resolve(false))
    })
  }

  private async tryApplySidecarTextures(modelRoot: THREE.Object3D): Promise<boolean> {
    const cache = new Map<string, Record<string, THREE.Texture | null>>()

    const loadSet = async (partName: string) => {
      if (cache.has(partName)) return cache.get(partName)!
      const base = `${TEXTURE_ROOT}/${partName}/${partName}_Bake1_PBR_`
      const keys: Record<string, string> = {
        color:     base + 'Diffuse.png',
        normal:    base + 'Normal.png',
        roughness: base + 'Roughness.png',
        metalness: base + 'Metalness.png',
        ao:        base + 'Ambient Occlusion.png',
        emissive:  base + 'Emission.png',
        ...(partName === 'FloatingPanel' ? { transmission: base + 'Transmission.png' } : {}),
      }
      const entries = await Promise.all(
        Object.entries(keys).map(async ([k, url]) => {
          try { return [k, await this.textureLoader.loadAsync(url)] }
          catch { return [k, null] }
        })
      )
      const set = Object.fromEntries(entries) as Record<string, THREE.Texture | null>
      Object.values(set).forEach(t => { if (t) t.flipY = false })
      if (set.color)    set.color.colorSpace    = THREE.SRGBColorSpace
      if (set.emissive) set.emissive.colorSpace = THREE.SRGBColorSpace
      cache.set(partName, set)
      return set
    }

    const parts = ['Platform_Base','Platform_Main','Platform_Main_B','Portal','Room','FloatingPanel']
    try {
      await Promise.all(parts.map(async (partName) => {
        const node = modelRoot.getObjectByName(partName)
        if (!node) return
        const tex = await loadSet(partName)
        node.traverse(child => {
          if (!(child as THREE.Mesh).isMesh) return
          const mesh = child as THREE.Mesh

          if (partName === 'Room') {
            mesh.material = new THREE.MeshBasicMaterial({ map: tex.color, color: new THREE.Color(0.22, 0.22, 0.30) })
            return
          }
          if (partName === 'Platform_Base') {
            mesh.material = new THREE.MeshBasicMaterial({ map: tex.color, color: new THREE.Color(0.38, 0.12, 0.62) })
            return
          }

          const geo = mesh.geometry
          if (geo?.attributes?.uv && !geo.attributes.uv2) geo.setAttribute('uv2', geo.attributes.uv)

          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach(m => {
            if (!m) return
            const mat = m as THREE.MeshStandardMaterial
            if (tex.color)     mat.map           = tex.color
            if (tex.normal)    mat.normalMap      = tex.normal
            if (tex.roughness) mat.roughnessMap   = tex.roughness
            if (tex.metalness) mat.metalnessMap   = tex.metalness
            if (tex.ao)        mat.aoMap          = tex.ao
            if (partName === 'Platform_Main' || partName === 'Platform_Main_B') { mat.metalness = 0; mat.roughness = 1 }
            if (tex.emissive) {
              mat.emissiveMap       = tex.emissive
              mat.emissive          = new THREE.Color(0xffffff)
              mat.emissiveIntensity = partName === 'Portal' ? 1.8 : partName === 'FloatingPanel' ? 1.2 : 0.7
            }
            if (tex.transmission && 'transmissionMap' in mat) {
              (mat as THREE.MeshPhysicalMaterial).transmissionMap = tex.transmission
              ;(mat as THREE.MeshPhysicalMaterial).transmission   = 0.82
              mat.transparent = true
            }
            if (partName === 'FloatingPanel') { mat.transparent = true; mat.opacity = 0.82 }
            mat.needsUpdate = true
          })
        })
      }))
      return true
    } catch { return false }
  }

  async tryLoadEyeModel(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (!res.ok) return false
    } catch { return false }

    return new Promise((resolve) => {
      this.loader.load(url, async (gltf) => {
        this.modelSlot.clear()
        const modelRoot = gltf.scene
        this.tempBox.setFromObject(modelRoot)
        this.tempBox.getSize(this.tempSize)
        this.tempBox.getCenter(this.tempCenter)
        const maxDim = Math.max(this.tempSize.x, this.tempSize.y, this.tempSize.z) || 1
        modelRoot.position.sub(this.tempCenter)
        modelRoot.scale.setScalar(1.7 / maxDim)
        modelRoot.position.z += 0.02

        // Apply sidecar PBR textures for each eye part
        const eyeParts = ['Eye', 'Eyelid', 'Eyelid.001']
        await Promise.all(eyeParts.map(async (partName) => {
          const node = modelRoot.getObjectByName(partName)
          if (!node) return
          const base = `${EYE_TEXTURE_ROOT}/${partName}/${partName}_Bake1_PBR_`
          const [colorTex, roughTex, metalTex] = await Promise.all([
            this.textureLoader.loadAsync(base + 'Diffuse.png').catch(() => null),
            this.textureLoader.loadAsync(base + 'Roughness.png').catch(() => null),
            this.textureLoader.loadAsync(base + 'Metalness.png').catch(() => null),
          ])
          ;[colorTex, roughTex, metalTex].forEach(t => { if (t) t.flipY = false })
          if (colorTex) colorTex.colorSpace = THREE.SRGBColorSpace
          node.traverse(child => {
            if (!(child as THREE.Mesh).isMesh) return
            const mesh = child as THREE.Mesh
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
            mats.forEach(m => {
              const mat = m as THREE.MeshStandardMaterial
              if (colorTex)  mat.map           = colorTex
              if (roughTex)  mat.roughnessMap  = roughTex
              if (metalTex)  mat.metalnessMap  = metalTex
              mat.envMapIntensity = 1.4
              mat.needsUpdate = true
            })
          })
        }))

        this.modelSlot.add(modelRoot)
        this.assetLoaded = true
        this.placeholderEyeRoot.visible = false
        const hits: THREE.Object3D[] = []
        modelRoot.traverse(n => { if ((n as THREE.Mesh).isMesh) hits.push(n) })
        if (hits.length) this.eyeHitTargets = hits
        resolve(true)
      }, undefined, () => resolve(false))
    })
  }

  // ─── composition ──────────────────────────────────────────────────────────

  private applyCompositionPreset(name: string) {
    const preset = this.compositionPresets[name] ?? this.compositionPresets.procedural
    this.activeComposition  = name
    this.currentEyeScale    = preset.eyeScale
    this.defaultFocusPoint.copy(preset.focusPoint)
    this.defaultEyeBasePosition.copy(preset.eyeBasePosition)
    this.orbit.targetYaw    = preset.yaw
    this.orbit.targetPitch  = preset.pitch
    this.orbit.targetRadius = preset.radius
    this.focusPoint.copy(this.defaultFocusPoint)
    this.eyeBasePosition.copy(this.defaultEyeBasePosition)
  }

  private clearEnvironmentAnchors() {
    this.environmentAnchors = { EyeAnchor: null, CameraTarget: null }
    this.environmentParts   = {}
  }

  private refreshEnvironmentAnchors() {
    const { EyeAnchor, CameraTarget } = this.environmentAnchors
    if (CameraTarget) CameraTarget.getWorldPosition(this.focusPoint)
    else              this.focusPoint.copy(this.defaultFocusPoint)
    if (EyeAnchor)   EyeAnchor.getWorldPosition(this.eyeBasePosition)
    else              this.eyeBasePosition.copy(this.defaultEyeBasePosition)
  }

  // ─── blink ────────────────────────────────────────────────────────────────

  private scheduleBlink() {
    window.clearTimeout(this.blinkTimer)
    const delay = 6000 + Math.random() * 6000
    this.blinkTimer = window.setTimeout(() => {
      this.blinkDuration = 0.24
      this.blinkElapsed  = 0.24
      this.scheduleBlink()
    }, delay)
  }

  // ─── animation ────────────────────────────────────────────────────────────

  private animate() {
    const now   = performance.now() * 0.001
    const delta = Math.min(now - this.lastFrameTime, 0.05)
    const elapsed = now - this.startTime
    this.lastFrameTime = now

    if (this.environmentLoaded) this.refreshEnvironmentAnchors()

    this.roomWake      += (this.roomWakeTarget      - this.roomWake)      * 0.06
    this.eyeOpen       += (this.eyeOpenTarget       - this.eyeOpen)       * 0.12
    this.attentionFocus += (this.attentionTarget    - this.attentionFocus) * 0.08
    this.glowStrength  += (this.glowStrengthTarget  - this.glowStrength)  * 0.08
    this.gazeOffset.lerp(this.pointerTarget, 0.08)

    this.orbit.yaw    += (this.orbit.targetYaw    + this.orbit.gyroYaw   - this.orbit.yaw)    * 0.08
    this.orbit.pitch  += (this.orbit.targetPitch  + this.orbit.gyroPitch - this.orbit.pitch)  * 0.08
    this.orbit.radius += (this.orbit.targetRadius - this.orbit.radius)  * 0.08

    if (this.blinkElapsed > 0) this.blinkElapsed = Math.max(0, this.blinkElapsed - delta)

    const blinkBlend = this.blinkDuration > 0
      ? Math.sin((1 - this.blinkElapsed / this.blinkDuration) * Math.PI)
      : 0
    const openness = THREE.MathUtils.clamp(this.eyeOpen - blinkBlend * 0.96, 0.02, 1)

    const pulseRate = this.osState === 'responding' ? 6.4 : this.osState === 'processing' ? 5.2 : 2.2
    const pulseStr  = (this.osState === 'processing' || this.osState === 'responding')
      ? 0.92 + Math.sin(elapsed * pulseRate) * 0.13
      : 0.86 + Math.sin(elapsed * 1.7) * 0.03
    const finalGlow = this.connected ? this.glowStrength * pulseStr : 0.02

    this.renderer.toneMappingExposure = 0.9 + this.roomWake * 0.22 + finalGlow * 0.12
    this.scene.fog = new THREE.FogExp2(0x071015, 0.09 - this.roomWake * 0.03)

    this.lights.topLight.intensity    = this.roomWake * 1.5
    this.lights.sideLight1.intensity  = this.roomWake * 1.2
    this.lights.sideLight2.intensity  = this.roomWake * 1.2
    this.lights.portalLight.intensity = this.roomWake * 6
    this.ceilingGlow.material.opacity = this.roomWake * 0.55

    const hover = Math.sin(elapsed * 0.9) * 0.06
    const drift = Math.sin(elapsed * 0.43) * 0.08

    this.eyeGroup.position.copy(this.eyeBasePosition)
    this.eyeGroup.position.y   += hover + this.attentionFocus * 0.08
    this.eyeGroup.rotation.y    = drift * 0.45 + this.gazeOffset.x * 0.14
    this.eyeGroup.rotation.x    = this.gazeOffset.y * -0.08 + this.attentionFocus * 0.04
    this.eyeGroup.scale.setScalar(this.currentEyeScale)

    this.irisCarrier.position.x = this.gazeOffset.x * 0.16
    this.irisCarrier.position.y = this.gazeOffset.y * -0.12
    const pupilScale = 1 + Math.sin(elapsed * 0.66) * 0.05
    this.pupil.scale.set(1, 1, pupilScale * 0.22)

    this.topLid.position.set(0,  THREE.MathUtils.lerp(0.08,  0.72, openness), 0.1)
    this.bottomLid.position.set(0, THREE.MathUtils.lerp(-0.08, -0.72, openness), 0.1)
    this.topLid.rotation.x    = THREE.MathUtils.lerp(0.42,  0.08, openness)
    this.bottomLid.rotation.x = THREE.MathUtils.lerp(-0.42, -0.08, openness)

    this.glowSprite.material.opacity = finalGlow
    const glowScale = 2.7 + finalGlow * 1.7
    this.glowSprite.scale.set(glowScale, glowScale, 1)
    this.eyeCoreGlow.material.opacity = 0.24 + finalGlow * 0.72

    // disconnected: tint iris red
    const irisM = (this.irisCarrier.children[1] as THREE.Mesh)?.material as THREE.MeshPhysicalMaterial
    if (irisM?.color) {
      const target = this.connected ? new THREE.Color(0x6fd8ea) : new THREE.Color(0x662222)
      irisM.color.lerp(target, 0.05)
    }

    const cx = Math.sin(this.orbit.yaw) * Math.cos(this.orbit.pitch) * this.orbit.radius
    const cy = Math.sin(this.orbit.pitch) * this.orbit.radius + 0.48 + this.attentionFocus * 0.18
    const cz = Math.cos(this.orbit.yaw) * Math.cos(this.orbit.pitch) * this.orbit.radius
    this.camera.position.set(cx, cy, cz)
    this.tempVector.copy(this.focusPoint)
    this.tempVector.x += this.pointerTarget.x * 0.08
    this.tempVector.y += this.pointerTarget.y * -0.05
    this.camera.lookAt(this.tempVector)

    if (this.panelObject) {
      this.panelLocalCurrPos.lerp(this.panelLocalTargetPos, 0.06)
      this.panelObject.position.copy(this.panelLocalCurrPos)
    }

    this.composer.render()
  }

  // ─── input ────────────────────────────────────────────────────────────────

  private bindEvents() {
    window.addEventListener('resize', this._onResize)
    this.canvas.addEventListener('pointerdown',  this._onPointerDown)
    this.canvas.addEventListener('pointermove',  this._onPointerMove)
    this.canvas.addEventListener('pointerup',    this._onPointerUp)
    this.canvas.addEventListener('pointercancel',this._onPointerUp)
    this.canvas.addEventListener('wheel',        this._onWheel, { passive: false })
    this.canvas.addEventListener('dblclick',     () => this.recenterCamera())
    this.canvas.addEventListener('touchstart',   this._onTouchStart, { passive: false })
    this.canvas.addEventListener('touchmove',    this._onTouchMove,  { passive: false })
    this.canvas.addEventListener('touchend',     this._onTouchEnd,   { passive: false })
    window.addEventListener('deviceorientation', this._onDeviceOrient)
  }

  private unbindEvents() {
    window.removeEventListener('resize', this._onResize)
    this.canvas.removeEventListener('pointerdown',   this._onPointerDown)
    this.canvas.removeEventListener('pointermove',   this._onPointerMove)
    this.canvas.removeEventListener('pointerup',     this._onPointerUp)
    this.canvas.removeEventListener('pointercancel', this._onPointerUp)
    this.canvas.removeEventListener('wheel',         this._onWheel)
    this.canvas.removeEventListener('touchstart',    this._onTouchStart)
    this.canvas.removeEventListener('touchmove',     this._onTouchMove)
    this.canvas.removeEventListener('touchend',      this._onTouchEnd)
    window.removeEventListener('deviceorientation',  this._onDeviceOrient)
  }

  private handlePointerDown(e: PointerEvent) {
    this.canvas.setPointerCapture(e.pointerId)
    const hitEye   = this.hitTestEye(e.clientX, e.clientY)
    const hitPanel = this.hitTestPanel(e.clientX, e.clientY)
    const rect = this.canvas.getBoundingClientRect()
    this.setPointerTarget(
      (e.clientX - rect.left) / rect.width  - 0.5,
      (e.clientY - rect.top)  / rect.height - 0.5,
    )
    this.dragState = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false, hitEye, hitPanel }
  }

  private handlePointerMove(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect()
    this.setPointerTarget(
      (e.clientX - rect.left) / rect.width  - 0.5,
      (e.clientY - rect.top)  / rect.height - 0.5,
    )
    if (!this.dragState || this.dragState.pointerId !== e.pointerId || this.touchState?.pinching) return
    const dx = e.clientX - this.dragState.lastX
    const dy = e.clientY - this.dragState.lastY
    this.dragState.lastX = e.clientX; this.dragState.lastY = e.clientY
    if (Math.abs(e.clientX - this.dragState.startX) > 4 || Math.abs(e.clientY - this.dragState.startY) > 4) this.dragState.moved = true
    this.orbitBy(dx, dy)
  }

  private handlePointerUp(e: PointerEvent) {
    if (!this.dragState || this.dragState.pointerId !== e.pointerId) return
    if (!this.dragState.moved) {
      if (this.dragState.hitEye) this.triggerBlink()
      else if (this.dragState.hitPanel && !this.panelActive) this.onPanelClick?.()
    }
    this.dragState = null
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault()
    this.zoomBy(e.deltaY > 0 ? 0.12 : -0.12)
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault()
      this.touchState = { pinching: true, distance: this.getTouchDist(e.touches[0], e.touches[1]) }
      return
    }
    const now = Date.now()
    if (now - this.doubleTapTime < 280) this.recenterCamera()
    this.doubleTapTime = now
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.touchState?.pinching || e.touches.length !== 2) return
    e.preventDefault()
    const next  = this.getTouchDist(e.touches[0], e.touches[1])
    const delta = (this.touchState.distance - next) * 0.005
    this.touchState.distance = next
    this.zoomBy(delta)
  }

  private handleTouchEnd(e: TouchEvent) { if (e.touches.length < 2) this.touchState = null }

  private handleDeviceOrientation(e: DeviceOrientationEvent) {
    if (typeof e.gamma !== 'number' || typeof e.beta !== 'number') return
    this.orbit.gyroYaw   = THREE.MathUtils.clamp(e.gamma / 120, -0.12, 0.12)
    this.orbit.gyroPitch = THREE.MathUtils.clamp((e.beta - 35) / 240, -0.12, 0.12)
  }

  private getTouchDist(a: Touch, b: Touch) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }
}
