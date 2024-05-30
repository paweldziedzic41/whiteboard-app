import rough from "roughjs";
import { useEffect, useState, useLayoutEffect } from "react";

const roughGenerator = rough.generator();

const Whiteboard = ({ canvasRef, ctxRef, elements, setElements, tool, color }) => {
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.height = window.innerHeight * 2;
        canvas.width = window.innerWidth * 2;
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctxRef.current = ctx;
    }, []);

    useEffect(() => {
        if (ctxRef.current) {
            ctxRef.current.strokeStyle = color;
        }
    }, [color]);

    useLayoutEffect(() => {
        if (!ctxRef.current) return;

        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const roughCanvas = rough.canvas(canvasRef.current);

        elements.forEach((element) => {
            roughCanvas.linearPath(element.path, {
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                roughness: element.roughness,
            });
        });
    }, [elements]);

    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        setElements((prevElements) => [
            ...prevElements,
            {
                type: "pencil",
                offsetX,
                offsetY,
                path: [[offsetX, offsetY]],
                stroke: color,
                strokeWidth: 5,
                roughness: 0,
            },
        ]);

        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;

        const { offsetX, offsetY } = e.nativeEvent;
        setElements((prevElements) => {
            const newElements = [...prevElements];
            const currentElement = newElements[newElements.length - 1];
            currentElement.path.push([offsetX, offsetY]);
            return newElements;
        });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    return (
        <div
            className="border border-2 border-dark h-100 w-100 overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default Whiteboard;
