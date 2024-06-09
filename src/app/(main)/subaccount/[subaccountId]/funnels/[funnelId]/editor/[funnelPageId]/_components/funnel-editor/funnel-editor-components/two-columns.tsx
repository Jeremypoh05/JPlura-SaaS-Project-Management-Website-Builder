"use client";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import React from "react";
import RecursiveElement from "./recursive";

import { v4 } from "uuid";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { EditorBtns, defaultStyles } from "@/lib/constants";

type Props = {
  element: EditorElement;
};

const TwoColumns = (props: Props) => {
  const { id, content, type } = props.element;
  const { dispatch, state } = useEditor();

  const calculateDropIndex = (e: React.DragEvent): number => {
    const dropY = e.clientY;
    const dropIndex = Array.from(e.currentTarget.children).findIndex(
      (child) => {
        const childRect = child.getBoundingClientRect();
        return dropY < childRect.top + childRect.height / 2;
      }
    );
    return dropIndex;
  };

  const handleOnDrop = (e: React.DragEvent, type: string) => {
    e.stopPropagation();
    const componentType = e.dataTransfer.getData("componentType") as EditorBtns;
    const dropIndex = calculateDropIndex(e); // Calculate the drop index

    const contentArray = Array.isArray(content) ? content : [];
    const positionIndex = dropIndex === -1 ? contentArray.length : dropIndex; // If dropIndex is -1, add to the end

    switch (componentType) {
      case "text":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: id,
            elementDetails: {
              content: { innerText: "Text Component" },
              id: v4(),
              name: "Text",
              styles: {
                color: "black",
                ...defaultStyles,
              },
              type: "text",
            },
            positionIndex,
          },
        });
        break;
      case "container":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: id,
            elementDetails: {
              content: [],
              id: v4(),
              name: "Container",
              styles: { ...defaultStyles },
              type: "container",
            },
            positionIndex,
          },
        });
        break;
      case "2Col":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: id,
            elementDetails: {
              content: [],
              id: v4(),
              name: "Two Columns",
              styles: { ...defaultStyles },
              type: "2Col",
            },
            positionIndex,
          },
        });
        break;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDragStart = (e: React.DragEvent, type: string) => {
    if (type === "__body") return;
    e.dataTransfer.setData("componentType", type);
  };

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
  };

  return (
    <div
      style={props.element.styles}
      className={clsx("relative p-4 transition-all", {
        "h-fit": type === "container",
        "h-full": type === "__body",
        "m-4": type === "container",
        "!border-blue-500":
          state.editor.selectedElement.id === props.element.id &&
          !state.editor.liveMode,
        "!border-solid":
          state.editor.selectedElement.id === props.element.id &&
          !state.editor.liveMode,
        "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
      })}
      id="innerContainer"
      onDrop={(e) => handleOnDrop(e, id)}
      onDragOver={handleDragOver}
      draggable={type !== "__body"}
      onClick={handleOnClickBody}
      onDragStart={(e) => handleDragStart(e, "container")}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">
            {state.editor.selectedElement.name}
          </Badge>
        )}
      {Array.isArray(content) &&
        content.map((childElement) => (
          <RecursiveElement key={childElement.id} element={childElement} />
        ))}
    </div>
  );
};

export default TwoColumns;
