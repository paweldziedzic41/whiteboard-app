import { useState, useRef, useEffect } from "react";
import "./index.css"; // Importujemy zaktualizowany plik CSS
import { Stage, Layer, Line, Circle } from "react-konva";

const RoomPage = ({ user, socket }) => {
  const stageRef = useRef(null);
  const whiteboardRef = useRef(null);
  const [pencilThickness, setPencilThickness] = useState(5);
  const [eraserThickness, setEraserThickness] = useState(10);
  const [strokeColor, setStrokeColor] = useState("#000000"); // Black
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [mode, setMode] = useState("pencil"); // 'select', 'pencil', 'eraser'
  const [drawingLines, setDrawingLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [eraserPosition, setEraserPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (whiteboardRef.current) {
        setWidth(whiteboardRef.current.clientWidth);
        setHeight(whiteboardRef.current.clientHeight);
      }
    };

    handleResize(); // Set the initial dimensions

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    socket.on("drawingHistory", (lines) => {
      setDrawingLines(lines);
    });

    socket.on("drawing", (line) => {
      setDrawingLines((prevLines) => [...prevLines, line]);
    });

    socket.on("undo", (newLines) => {
      setDrawingLines(newLines);
    });

    socket.on("redo", (newLines) => {
      setDrawingLines(newLines);
    });
  }, [socket]);

  useEffect(() => {
    const handleUndoRedo = (e) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        socket.emit("undo", user.roomId);
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        socket.emit("redo", user.roomId);
      }
    };

    window.addEventListener("keydown", handleUndoRedo);
    return () => window.removeEventListener("keydown", handleUndoRedo);
  }, [socket, user.roomId]);

  const ChangeAttribute = (attribute) => {
    if (attribute.target.className === "pencil-thickness") {
      setPencilThickness(attribute.target.value);
    } else if (attribute.target.className === "eraser-thickness") {
      setEraserThickness(attribute.target.value);
    } else if (attribute.target.className === "color") {
      setStrokeColor(attribute.target.value);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const getRelativePointerPosition = (node) => {
    const transform = node.getAbsoluteTransform().copy();
    transform.invert();
    const pos = node.getStage().getPointerPosition();
    return transform.point(pos);
  };

  const handleMouseDown = (e) => {
    if (mode === "pencil" || mode === "eraser") {
      setIsDrawing(true);
      const stage = e.target.getStage();
      const pos = getRelativePointerPosition(stage);
      const newLine = {
        points: [pos.x, pos.y],
        tool: mode,
        pencilThickness,
        eraserThickness,
        strokeColor,
      };
      setDrawingLines((prevLines) => [...prevLines, newLine]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    if (mode === "eraser") {
      setEraserPosition(pos);
    }
    let lastLine = drawingLines[drawingLines.length - 1];
    lastLine.points = lastLine.points.concat([pos.x, pos.y]);
    drawingLines.splice(drawingLines.length - 1, 1, lastLine);
    setDrawingLines(drawingLines.concat());

    socket.emit("drawing", { roomId: user.roomId, line: lastLine });
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      const lastLine = drawingLines[drawingLines.length - 1];
      socket.emit("drawing", { roomId: user.roomId, line: lastLine });
    }
    setIsDrawing(false);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();
  };

  return (
    <div className="page">
      <div className="toolbox">
        <button
          id="item"
          className={`pencil ${mode === "pencil" ? "active" : ""}`}
          onClick={() => handleModeChange("pencil")}
        >
          Pencil
        </button>
        <label id="item" htmlFor="pencil-thickness">
          Pencil thickness
        </label>
        <input
          id="item"
          type="range"
          min="1"
          max="50"
          className="pencil-thickness"
          value={pencilThickness}
          onChange={ChangeAttribute}
        />
        <label id="item" htmlFor="eraser-thickness">
          Eraser thickness
        </label>
        <input
          id="item"
          type="range"
          min="1"
          max="50"
          className="eraser-thickness"
          value={eraserThickness}
          onChange={ChangeAttribute}
        />
        <label id="item" htmlFor="color">
          Color
        </label>
        <input
          id="item"
          type="color"
          className="color"
          value={strokeColor}
          onChange={ChangeAttribute}
        />
        <button
          id="item"
          className={`eraser ${mode === "eraser" ? "active" : ""}`}
          onClick={() => handleModeChange("eraser")}
        >
          Eraser
        </button>
        <button
          id="item"
          className={`drag ${mode === "drag" ? "active" : ""}`}
          onClick={() => handleModeChange("drag")}
        >
          Drag
        </button>
      </div>
      <div className="whiteboard" ref={whiteboardRef}>
        <Stage
          width={width}
          height={height}
          draggable={mode === "drag"}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          ref={stageRef}
        >
          <Layer>
            {drawingLines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === "eraser" ? "#FFFFFF" : line.strokeColor}
                strokeWidth={
                  line.tool === "eraser" ? line.eraserThickness : line.pencilThickness
                }
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            ))}
            {isDrawing && mode === "eraser" && (
              <Circle
                x={eraserPosition.x}
                y={eraserPosition.y}
                radius={eraserThickness / 2}
                fill="rgba(255,255,255,0.5)"
                stroke="blue"
                strokeWidth={2}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default RoomPage;
