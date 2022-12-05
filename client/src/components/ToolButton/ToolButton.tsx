import { Tools } from '../../utils/consts';
import "./ToolButton.css";

interface Props {
    message: string,
    buttonTool: Tools,
    globalTool: Tools,
    onClick: () => void,
    shortcutKey?: string;
}

function ToolButton({ message, buttonTool, globalTool, onClick, shortcutKey }: Props) {
    const buttonClassName = globalTool === buttonTool ? "button button-selected" : "button" 

    return (
        <div className='tool-button-container'>
            <button onClick={onClick} className={buttonClassName}><img src={message}></img></button>
            {shortcutKey && <span>Shortcut: {shortcutKey}</span>}
        </div>
    )
}

export default ToolButton