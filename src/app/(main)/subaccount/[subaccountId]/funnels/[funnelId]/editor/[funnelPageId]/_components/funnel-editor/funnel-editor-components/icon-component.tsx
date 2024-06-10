"use client";
import { Badge } from "@/components/ui/badge";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Trash } from "lucide-react";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

type Props = {
  element: EditorElement;
};

const IconComponent = (props: Props) => {
  const { dispatch, state } = useEditor(); //Custom hook to get the dispatch function and state from the editor context.
  const [hover, setHover] = useState(false); //React hook to manage the hover state of the icon.

  // Handles the drag start event. It serializes the element data and sets it in the dataTransfer object.
  const handleDragStart = (e: React.DragEvent, element: EditorElement) => {
    const elementData = JSON.stringify(element);
    e.dataTransfer.setData("componentData", elementData);
  };

  //Handles the click event on the icon. It stops the event from propagating and dispatches an action to change the clicked element.
  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
  };

  //Dispatches an action to delete the current element.
  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: props.element },
    });
  };

  //Handle mouse enter and leave events to set the hover state based on the enableHover property.
  const handleMouseEnter = () => {
    if (props.element.styles.enableHover) {
      setHover(true);
    }
  };

  const handleMouseLeave = () => {
    if (props.element.styles.enableHover) {
      setHover(false);
    }
  };

  //Renders the FontAwesome icon with styles based on the hover state and element properties.
  const icon = (
    <FontAwesomeIcon
      icon={props.element.styles.icon || "star"}
      size="2x"
      style={{
        color: hover
          ? props.element.styles.hoverIconColor
          : props.element.styles.iconColor,
        fontSize: props.element.styles.iconFontSize,
        transition: `color ${props.element.styles.transitionDuration || "0.3s"}`,
      }}
    />
  );

  //: Extracts the href property from the content if it is not an array.
  const href = !Array.isArray(props.element.content)
    ? props.element.content.href
    : null;

  // Helper function to check if a URL includes a protocol.
  const isValidUrl = (url: string) => {
    return /^https?:\/\//i.test(url);
  };

  //Prepends http:// to the URL if it doesn't already include a protocol.
  const formattedHref = href && !isValidUrl(href) ? `http://${href}` : href;

  return (
    <div
      draggable //Makes the element draggable.
      onDragStart={(e) => handleDragStart(e, props.element)}
      onClick={handleOnClickBody}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "p-[2px] w-full m-[5px] relative text-[16px] transition-all flex items-center justify-center",
        {
          "!border-blue-500":
            state.editor.selectedElement.id === props.element.id,
          "!border-solid": state.editor.selectedElement.id === props.element.id,
          "border-dashed border-[1px] border-slate-300": !state.editor.liveMode,
        }
      )}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">
            {state.editor.selectedElement.name}
          </Badge>
        )}
        
      {/* if formattedHref is available */}
      {!Array.isArray(props.element.content) &&
        (state.editor.previewMode || state.editor.liveMode) ? (
        <a href={formattedHref || "#"} target="_blank" rel="noopener noreferrer">
          {icon}
        </a>
      ) : (
        icon
      )}
      
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </div>
  );
};

export default IconComponent;