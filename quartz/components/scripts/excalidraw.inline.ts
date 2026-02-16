import { registerEscapeHandler, removeAllChildren } from "./util"

interface Position {
  x: number
  y: number
}

class DiagramPanZoom {
  private isDragging = false
  private startPan: Position = { x: 0, y: 0 }
  private currentPan: Position = { x: 0, y: 0 }
  private scale = 1
  private readonly MIN_SCALE = 0.5
  private readonly MAX_SCALE = 3

  cleanups: (() => void)[] = []

  constructor(
    private container: HTMLElement,
    private content: HTMLElement,
  ) {
    this.setupEventListeners()
    this.setupNavigationControls()
    this.waitForElementAndReset()
  }

  private waitForElementAndReset() {
    const svg = this.content.querySelector("svg")
    const img = this.content.querySelector("img") as HTMLImageElement | null
    if (img) {
      if (!img.complete) {
        img.onload = () => this.resetTransform()
      } else {
        requestAnimationFrame(() => this.resetTransform())
      }
    } else if (svg) {
      requestAnimationFrame(() => this.resetTransform())
    }
  }

  private setupEventListeners() {
    const mouseDownHandler = this.onMouseDown.bind(this)
    const mouseMoveHandler = this.onMouseMove.bind(this)
    const mouseUpHandler = this.onMouseUp.bind(this)

    const touchStartHandler = this.onTouchStart.bind(this)
    const touchMoveHandler = this.onTouchMove.bind(this)
    const touchEndHandler = this.onTouchEnd.bind(this)

    const resizeHandler = this.resetTransform.bind(this)

    this.container.addEventListener("mousedown", mouseDownHandler)
    document.addEventListener("mousemove", mouseMoveHandler)
    document.addEventListener("mouseup", mouseUpHandler)

    this.container.addEventListener("touchstart", touchStartHandler, { passive: false })
    document.addEventListener("touchmove", touchMoveHandler, { passive: false })
    document.addEventListener("touchend", touchEndHandler)

    window.addEventListener("resize", resizeHandler)

    this.cleanups.push(
      () => this.container.removeEventListener("mousedown", mouseDownHandler),
      () => document.removeEventListener("mousemove", mouseMoveHandler),
      () => document.removeEventListener("mouseup", mouseUpHandler),
      () => this.container.removeEventListener("touchstart", touchStartHandler),
      () => document.removeEventListener("touchmove", touchMoveHandler),
      () => document.removeEventListener("touchend", touchEndHandler),
      () => window.removeEventListener("resize", resizeHandler),
    )
  }

  cleanup() {
    for (const cleanup of this.cleanups) {
      cleanup()
    }
  }

  private setupNavigationControls() {
    const controls = document.createElement("div")
    controls.className = "excalidraw-controls"

    const zoomIn = this.createButton("+", () => this.zoom(0.1))
    const zoomOut = this.createButton("-", () => this.zoom(-0.1))
    const resetBtn = this.createButton("Reset", () => this.resetTransform())

    controls.appendChild(zoomOut)
    controls.appendChild(resetBtn)
    controls.appendChild(zoomIn)

    this.container.appendChild(controls)
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button")
    button.textContent = text
    button.className = "excalidraw-control-button"
    button.addEventListener("click", onClick)
    window.addCleanup(() => button.removeEventListener("click", onClick))
    return button
  }

  private onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return
    this.isDragging = true
    this.startPan = { x: e.clientX - this.currentPan.x, y: e.clientY - this.currentPan.y }
    this.container.style.cursor = "grabbing"
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return
    e.preventDefault()

    this.currentPan = {
      x: e.clientX - this.startPan.x,
      y: e.clientY - this.startPan.y,
    }

    this.updateTransform()
  }

  private onMouseUp() {
    this.isDragging = false
    this.container.style.cursor = "grab"
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return
    this.isDragging = true
    const touch = e.touches[0]
    this.startPan = { x: touch.clientX - this.currentPan.x, y: touch.clientY - this.currentPan.y }
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.isDragging || e.touches.length !== 1) return
    e.preventDefault()

    const touch = e.touches[0]
    this.currentPan = {
      x: touch.clientX - this.startPan.x,
      y: touch.clientY - this.startPan.y,
    }

    this.updateTransform()
  }

  private onTouchEnd() {
    this.isDragging = false
  }

  private zoom(delta: number) {
    const newScale = Math.min(Math.max(this.scale + delta, this.MIN_SCALE), this.MAX_SCALE)

    const rect = this.content.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const scaleDiff = newScale - this.scale
    this.currentPan.x -= centerX * scaleDiff
    this.currentPan.y -= centerY * scaleDiff

    this.scale = newScale
    this.updateTransform()
  }

  private updateTransform() {
    this.content.style.transform = `translate(${this.currentPan.x}px, ${this.currentPan.y}px) scale(${this.scale})`
  }

  private resetTransform() {
    const svg = this.content.querySelector("svg")
    const img = this.content.querySelector("img")
    const element = svg || img
    if (!element) return

    this.scale = 1
    this.currentPan = { x: 0, y: 0 }
    this.updateTransform()

    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect()
      const width = rect.width / this.scale
      const height = rect.height / this.scale

      this.currentPan = {
        x: (this.container.clientWidth - width) / 2,
        y: (this.container.clientHeight - height) / 2,
      }
      this.updateTransform()
    })
  }
}

document.addEventListener("nav", async () => {
  const center = document.querySelector(".center") as HTMLElement
  const nodes = center.querySelectorAll(".excalidraw-embed") as NodeListOf<HTMLElement>
  if (nodes.length === 0) return

  for (let i = 0; i < nodes.length; i++) {
    const embed = nodes[i] as HTMLElement
    const img = embed.querySelector(".excalidraw-svg") as HTMLImageElement

    const wrapper = document.createElement("div")
    wrapper.className = "excalidraw-wrapper"
    wrapper.style.position = "relative"
    wrapper.style.display = "inline-block"
    wrapper.style.maxWidth = "100%"

    embed.parentElement?.replaceChild(wrapper, embed)
    wrapper.appendChild(embed)

    const expandBtn = document.createElement("button")
    expandBtn.className = "excalidraw-expand-button"
    expandBtn.setAttribute("aria-label", "Expand excalidraw diagram")
    expandBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M3.72 3.72a.75.75 0 011.06 1.06L2.56 7h10.88l-2.22-2.22a.75.75 0 011.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l2.22-2.22H2.56l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5z"/>
      </svg>
    `
    wrapper.appendChild(expandBtn)

    const popupContainer = document.createElement("div")
    popupContainer.id = `excalidraw-container-${i}`
    popupContainer.className = "excalidraw-container"
    popupContainer.setAttribute("role", "dialog")
    popupContainer.innerHTML = `
      <div id="excalidraw-space-${i}" class="excalidraw-space">
        <div class="excalidraw-content"></div>
      </div>
    `
    wrapper.appendChild(popupContainer)

    let panZoom: DiagramPanZoom | null = null

    function showExcalidraw() {
      const container = popupContainer.querySelector(`#excalidraw-space-${i}`) as HTMLElement
      const content = popupContainer.querySelector(".excalidraw-content") as HTMLElement
      if (!content || !img) return
      removeAllChildren(content)

      const imgClone = img.cloneNode(true) as HTMLImageElement
      imgClone.style.maxWidth = "none"
      imgClone.style.height = "auto"
      imgClone.style.display = "block"
      content.appendChild(imgClone)

      popupContainer.classList.add("active")
      container.style.cursor = "grab"

      panZoom = new DiagramPanZoom(container, content)
    }

    function hideExcalidraw() {
      popupContainer.classList.remove("active")
      panZoom?.cleanup()
      panZoom = null
    }

    expandBtn.addEventListener("click", showExcalidraw)
    registerEscapeHandler(popupContainer, hideExcalidraw)

    window.addCleanup(() => {
      panZoom?.cleanup()
      expandBtn.removeEventListener("click", showExcalidraw)
    })
  }
})
