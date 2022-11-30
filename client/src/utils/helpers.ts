export function rgbToString(r: number, g: number, b: number, a: number): string | null {
    if(r === 0 && g === 0 && b === 0 && a === 0) return null;
    return `rgb(${r},${g},${b})`;
}

export function rgbToHex(color: string): string {
    const oldStringValues = color.split("");
    const newStringValues: string[] = [];
    
    for(let i = 4; i < oldStringValues.length - 1; i++) {
        newStringValues.push(oldStringValues[i]);
    }

    const auxString1 = newStringValues.join("");
    const auxString2 = auxString1.split(",");

    let finalString = "#";
    auxString2.forEach(v => {
        let aux = parseInt(v).toString(16);
        aux = aux.length === 1 ? '0' + aux : aux;
        finalString += aux;
    })

    return finalString;
}