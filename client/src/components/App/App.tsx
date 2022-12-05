import React, { useState, useRef, useEffect, MouseEvent, ChangeEvent } from 'react';
import ToolButton from "../ToolButton/ToolButton";
import { height, pixelWidthAndHeight, Tools, width } from "../../utils/consts";
import "./App.css";
import { getPixelXAndY, getPixelColor, floodFill, draw, erase } from './helpers';
import ToolInput from '../ToolInput/ToolInput';

interface HistoryAction {
  type: Tools.Eraser | Tools.Pencil,
  x: number,
  y: number,
  prevColor: string | null
}

export interface HistoryBucketActionElement {
  x: number,
  y: number,
  prevColor: string | null;
}

interface HistoryBucketAction {
  type: Tools.Bucket,
  list: HistoryBucketActionElement[]
}

type HistoryActions = HistoryAction | HistoryBucketAction;

function App() {
  //CANVAS REFS
  ////////////////////////////////////////////////////
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  //MOUSE REFS
  ////////////////////////////////////////////////////
  const isMouseDown = useRef(false);
  const isCTRLDown = useRef(false);
  const isZDown = useRef(false);
  //HISTORY REFS
  ////////////////////////////////////////////////////
  const history = useRef<HistoryActions[]>([]);

  const [tool, setTool] = useState(Tools.Pencil);
  const [color, setColor] = useState("#707070");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!canvasContainerRef.current) return;
    if (!ctx.current) {
      ctx.current = canvasRef.current.getContext("2d");
    }

    canvasRef.current.width = width * pixelWidthAndHeight;
    canvasRef.current.height = height * pixelWidthAndHeight;
    canvasRef.current.style.width = width * pixelWidthAndHeight + "px";
    canvasRef.current.style.height = height * pixelWidthAndHeight + "px";
    canvasContainerRef.current.style.width = width * pixelWidthAndHeight + "px";
    canvasContainerRef.current.style.height = height * pixelWidthAndHeight + "px";

    window.addEventListener("keydown", historyEvent);
    window.addEventListener("keyup", historyEvent);

    return () => {
      window.removeEventListener("keydown", historyEvent);
      window.removeEventListener("keyup", historyEvent);
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.style.width = width * pixelWidthAndHeight * scale + "px";
    canvasRef.current.style.height = height * pixelWidthAndHeight * scale + "px";
  }, [scale])

  //MOUSE FUNCTIONALITY
  ////////////////////////////////////////////////////
  function returnToolFuncionality() {
    switch (tool) {
      case Tools.Pencil: return drawPixel;
      case Tools.Eraser: return erasePixel;
      case Tools.Bucket: return fillColor;
      case Tools.Picker: return pickColor;
      default: return drawPixel;
    }
  }

  function mouseDown(e: MouseEvent): void {
    isMouseDown.current = true;
    const functionality = returnToolFuncionality();
    functionality(e);
  }

  function mouseUp(e: MouseEvent): void {
    isMouseDown.current = false;
  }

  function mouseMove(e: MouseEvent): void {
    if (!isMouseDown.current) return;
    const functionality = returnToolFuncionality();
    functionality(e);
  }

  //HISTORY AND KEYBOARD FUNCTIONALITY
  ////////////////////////////////////////////////////
  function historyEvent(e: KeyboardEvent): void {
    if (e.keyCode === 17) {
      isCTRLDown.current = !isCTRLDown.current;
    }

    if (e.keyCode === 90) {
      isZDown.current = !isZDown.current;
    }

    if (e.keyCode === 80) {
      setTool(Tools.Pencil);
    }
    if (e.keyCode === 69) {
      setTool(Tools.Eraser);
    }
    if (e.keyCode === 80) {
      setTool(Tools.Pencil);
    }
    if (e.keyCode === 66) {
      setTool(Tools.Bucket);
    }
    if (e.keyCode === 73) {
      setTool(Tools.Picker);
    }

    if (isZDown.current && isCTRLDown.current) {
      ;
      if (history.current.length === 0) return;

      const newHistory = [...history.current];
      const lastHistoryIndex = newHistory.pop();
      if (lastHistoryIndex) {
        reverseHistory(lastHistoryIndex)();
        history.current = newHistory;
      }
    }
  }

  function DrawOrErase(action: HistoryActions) {
    return () => {
      if (!ctx.current) return;
      if (!(action.type === Tools.Pencil || action.type === Tools.Eraser)) return;
      if (action.prevColor) {
        draw(action.x, action.y, ctx.current, action.prevColor);
      } else {
        erase(action.x, action.y, ctx.current)
      }
    }
  }

  function reverseHistory(action: HistoryActions) {
    switch (action.type) {
      case Tools.Bucket: {
        return () => {
          action.list.forEach(el => {
            if (ctx.current) {
              if (el.prevColor) {
                draw(el.x, el.y, ctx.current, el.prevColor);
              } else erase(el.x, el.y, ctx.current);
            }
          })
        }
      }

      default: return DrawOrErase(action);
    }
  }

  //TOOLS FUNCTIONALITY
  ////////////////////////////////////////////////////

  //PENCIL FUNCTIONALITY
  ////////////////////////////////////////////////////
  function drawPixel(e: MouseEvent): void {
    if (!ctx.current) return;

    const [x, y] = getPixelXAndY(e, scale);
    let lastHistoryIndex: HistoryActions;

    if (history.current.length !== 0) {
      lastHistoryIndex = history.current[history.current.length - 1];
      if (
        lastHistoryIndex.type === Tools.Pencil &&
        lastHistoryIndex.x === x &&
        lastHistoryIndex.y === y) return;
    }

    const prevColor = getPixelColor(x, y, ctx.current);
    const newHistory = [...history.current];
    newHistory.push({ type: Tools.Pencil, x, y, prevColor });
    history.current = newHistory;
    draw(x, y, ctx.current, color);
  }

  //ERASER FUNCTIONALITY
  ////////////////////////////////////////////////////
  function erasePixel(e: MouseEvent): void {
    if (!ctx.current) return;

    const [x, y] = getPixelXAndY(e, scale);

    let lastHistoryIndex: HistoryActions;

    if (history.current.length !== 0) {
      lastHistoryIndex = history.current[history.current.length - 1];
      if (
        lastHistoryIndex.type === Tools.Eraser &&
        lastHistoryIndex.x === x &&
        lastHistoryIndex.y === y) return;
    }

    const prevColor = getPixelColor(x, y, ctx.current);
    if (prevColor) {
      const newHistory = [...history.current];
      newHistory.push({ type: Tools.Eraser, x, y, prevColor });
      history.current = newHistory;
      erase(x, y, ctx.current);
    }
  }

  //BUCKET FUNCTIONALITY
  ////////////////////////////////////////////////////
  function fillColor(e: MouseEvent): void {
    if (!ctx.current) return;

    const [x, y] = getPixelXAndY(e, scale);
    const prevColor = getPixelColor(x, y, ctx.current);
    const pixelList: HistoryBucketActionElement[] = [];

    floodFill(x, y, prevColor, color, ctx.current, pixelList);
    const newHistory = [...history.current];
    newHistory.push({ type: Tools.Bucket, list: pixelList });
    history.current = newHistory;
  }

  //EYE TOOL FUNCTIONALITY
  ////////////////////////////////////////////////////
  function pickColor(e: MouseEvent) {
    if (!ctx.current) return;
    const newColor = getPixelColor(e.nativeEvent.offsetX, e.nativeEvent.offsetY, ctx.current);;
    if (newColor !== null) {
      setColor(newColor);
    }
  }

  //COLOR PICKER FUNCTIONALITY
  ////////////////////////////////////////////////////
  function handleColorChange(e: ChangeEvent<HTMLInputElement>): void {
    setColor(e.target.value);
  }

  //ZOOM IN FUNCTIONALITY
  ////////////////////////////////////////////////////
  function zoomIn(): void {
    if (scale < 4) setScale(s => s + 1);
  }

  //ZOOM OUT FUNCTIONALITY
  ////////////////////////////////////////////////////
  function zoomOut(): void {
    if (scale > 1) setScale(s => s - 1);
  }

  return (
    <div className="App">
      <div className="tools-bar">
        <ToolButton onClick={() => { setTool(Tools.Pencil) }} message="./icons/pen.svg" globalTool={tool} buttonTool={Tools.Pencil} shortcutKey={"P"} />
        <ToolButton onClick={() => { setTool(Tools.Eraser) }} message="./icons/eraser.svg" globalTool={tool} buttonTool={Tools.Eraser} shortcutKey={"E"}/>
        <ToolButton onClick={() => { setTool(Tools.Bucket) }} message="./icons/bucket.svg" globalTool={tool} buttonTool={Tools.Bucket} shortcutKey={"B"}/>
        <ToolButton onClick={() => { setTool(Tools.Picker) }} message="./icons/picker.svg" globalTool={tool} buttonTool={Tools.Picker} shortcutKey={"I"}/>
        <ToolButton onClick={() => zoomIn()} message="./icons/zoomIn.svg" globalTool={tool} buttonTool={Tools.ZoomIn} />
        <ToolButton onClick={() => zoomOut()} message="./icons/zoomOut.svg" globalTool={tool} buttonTool={Tools.ZoomOut} />
        <ToolInput onChange={handleColorChange} value={color} type="color"/>
      </div>
      <div className="canvas-container" ref={canvasContainerRef}>
        <canvas
          className="canvas"
          ref={canvasRef}
          onMouseDown={mouseDown}
          onMouseUp={mouseUp}
          onMouseMove={mouseMove}
          onMouseLeave={mouseUp}
        >
        </canvas>
      </div>
    </div>
  );
}

export default App;