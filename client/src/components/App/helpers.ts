import { MouseEvent } from "react";
import { height, pixelWidthAndHeight, width } from "../../utils/consts";
import { rgbToString, rgbToHex } from "../../utils/helpers";
import { HistoryBucketActionElement } from "./App";

export function draw(x: number, y: number, ctx: CanvasRenderingContext2D, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.fillRect(x, y, pixelWidthAndHeight, pixelWidthAndHeight);
    ctx.closePath();
}

export function erase(x: number, y: number, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(x, y, pixelWidthAndHeight, pixelWidthAndHeight);
}
  
export function getPixelXAndY(e: MouseEvent, scale: number): [number, number] {
    const x = Math.floor(((Math.floor(e.nativeEvent.offsetX / pixelWidthAndHeight))/scale)) * pixelWidthAndHeight;
    const y = Math.floor(((Math.floor(e.nativeEvent.offsetY / pixelWidthAndHeight))/scale)) * pixelWidthAndHeight;

    return [x, y];
}

export function getPixelColor(x: number, y: number, ctx: CanvasRenderingContext2D): string | null {
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const pixelColor = rgbToString(pixelData[0], pixelData[1], pixelData[2], pixelData[3]);

    if(pixelColor) return rgbToHex(pixelColor);
    return pixelColor;
}

export function floodFill(
    x: number, 
    y: number, 
    oldColor: string | null, 
    newColor: string, 
    ctx: CanvasRenderingContext2D,
    pixelList: HistoryBucketActionElement[]
    ): void {
    const pixelColor = getPixelColor(x, y, ctx);

    if(pixelColor === oldColor) {
      draw(x, y, ctx, newColor);
      pixelList.push({ x, y, prevColor: oldColor })

      if(y + pixelWidthAndHeight <= height * pixelWidthAndHeight - pixelWidthAndHeight) {
        floodFill(x, y + pixelWidthAndHeight, oldColor, newColor, ctx, pixelList);
      }
      if(x + pixelWidthAndHeight <= width * pixelWidthAndHeight - pixelWidthAndHeight) {
        floodFill(x + pixelWidthAndHeight, y, oldColor, newColor, ctx, pixelList);
      }
      if(y - pixelWidthAndHeight >= 0) {
        floodFill(x, y - pixelWidthAndHeight, oldColor, newColor, ctx, pixelList);
      }
      if(x - pixelWidthAndHeight >= 0) {
        floodFill(x - pixelWidthAndHeight, y, oldColor, newColor, ctx, pixelList);
      } 
    }
  }