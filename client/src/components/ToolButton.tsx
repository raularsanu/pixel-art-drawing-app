import { Tools } from '../utils/consts'

interface Props {
    message: string,
    buttonTool: Tools,
    globalTool: Tools,
    onClick: () => void
}

function ToolButton({ message, buttonTool, globalTool, onClick }: Props) {
    const buttonClassName = globalTool === buttonTool ? "button button-selected" : "button" 

    return (
        <button onClick={onClick} className={buttonClassName}>{message}</button>
    )
}

export default ToolButton