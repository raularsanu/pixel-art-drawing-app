import React, { useState, useRef, useEffect, MouseEvent, ChangeEvent } from 'react';
import ToolButton from "./components/ToolButton";
import { Tools } from "./utils/consts";
import "./App.css";

interface Pixel {
  color: string
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const isMouseDown = useRef(false);
  const pixelMatrix = useRef<(null | Pixel)[][]>([]);

  const [tool, setTool] = useState(Tools.Pencil);
  const [color, setColor] = useState("black");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if(!canvasRef.current) return;
    if(!ctx.current) {
      ctx.current = canvasRef.current.getContext("2d");
    }

    canvasRef.current.width = width * pixelWidthAndHeight;
    canvasRef.current.height = height * pixelWidthAndHeight;
    canvasRef.current.style.width = width * pixelWidthAndHeight + "px";
    canvasRef.current.style.height = height * pixelWidthAndHeight + "px";

    if(pixelMatrix.current.length < height) {
      for(let i = 0; i < height; i++) {
        pixelMatrix.current = [...pixelMatrix.current, []];

        for(let j = 0; j < width; j++) {
          pixelMatrix.current[i] = [...pixelMatrix.current[i], null];
        }
      }
    }

    console.log(pixelMatrix.current)
  }, [])

  useEffect(() => {
    if(!canvasRef.current) return;

    canvasRef.current.style.width = width * pixelWidthAndHeight * scale + "px";
    canvasRef.current.style.height = height * pixelWidthAndHeight * scale + "px";
  }, [scale])

  const pixelWidthAndHeight = 20;
  const width = 36;
  const height = 36;

  function mouseDown(e: MouseEvent): void {
    isMouseDown.current = true;
    const functionality = returnToolFuncionality();
    functionality(e);
  }

  function mouseUp(e: MouseEvent): void {
    isMouseDown.current = false;
  }

  function mouseMove(e: MouseEvent): void {
    if(!isMouseDown.current) return;
    const functionality = returnToolFuncionality();
    functionality(e);
  }

  function returnToolFuncionality() {
    switch(tool) {
      case Tools.Pencil: return drawPixel;
      case Tools.Eraser: return erasePixel;
      case Tools.Bucket: return erasePixel;
      default: return drawPixel;
    }
  }

  function drawPixel(e: MouseEvent): void {
    if(!ctx.current) return;

    const x = Math.floor(((Math.floor(e.nativeEvent.offsetX / pixelWidthAndHeight))/scale)) * pixelWidthAndHeight;
    const y = Math.floor(((Math.floor(e.nativeEvent.offsetY / pixelWidthAndHeight))/scale)) * pixelWidthAndHeight;

    const newMatrix = [...pixelMatrix.current];
    newMatrix[y/pixelWidthAndHeight][x/pixelWidthAndHeight] = { color: color };
    pixelMatrix.current = newMatrix;

    ctx.current.fillStyle = color;
    ctx.current.beginPath();
    ctx.current.fillRect(x, y, pixelWidthAndHeight, pixelWidthAndHeight);
    ctx.current.closePath();
  }

  function erasePixel(e: MouseEvent): void {
    if(!ctx.current) return;

    const x = Math.floor(((Math.floor(e.nativeEvent.offsetX / pixelWidthAndHeight))/scale)) * pixelWidthAndHeight;
    const y = Math.floor(((Math.floor(e.nativeEvent.offsetY / pixelWidthAndHeight))/scale)) * pixelWidthAndHeight;

    const newMatrix = [...pixelMatrix.current];
    newMatrix[y/pixelWidthAndHeight][x/pixelWidthAndHeight] = null;
    pixelMatrix.current = newMatrix;

    ctx.current.clearRect(x, y, pixelWidthAndHeight, pixelWidthAndHeight);
    ctx.current.closePath();
  }

  function fillColor(): void {
    
  }

  function handleColorChange(e: ChangeEvent<HTMLInputElement>): void {
    setColor(e.target.value);
  }

  function zoomIn(): void {
    if(scale < 4) setScale(s => s+1);
  }

  function zoomOut(): void {
    if(scale > 1) setScale(s => s-1);
  }

  return (
    <div className="App">
      <div className="tools-bar">
        <ToolButton onClick={() => { setTool(Tools.Pencil) }} message="Pen" globalTool={tool} buttonTool={Tools.Pencil}/>
        <ToolButton onClick={() => { setTool(Tools.Eraser) }} message="Eraser" globalTool={tool} buttonTool={Tools.Eraser}/>
        <ToolButton onClick={() => { setTool(Tools.Bucket) }} message="Bucket" globalTool={tool} buttonTool={Tools.Bucket}/>

        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
        {scale}
        <input onChange={handleColorChange} value={color} type="color"/>
      </div>
      <div className="canvas-container">
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