import { ChangeEvent } from "react";
import "./ToolInput.css";

interface Props {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    type: string,
    value: string
}

function ToolInput({ onChange, value, type }: Props) {
  return (
    <div className='tool-input-container'>
        <input onChange={onChange} value={value} type={type} />
    </div>
  )
}

export default ToolInput