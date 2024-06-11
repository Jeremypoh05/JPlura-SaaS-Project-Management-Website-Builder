"use client";
import { Badge } from "@/components/ui/badge";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Trash } from "lucide-react";
import React, { useEffect } from "react";

type Props = {
  element: EditorElement;
};

const LinkComponent = (props: Props) => {
  const { dispatch, state } = useEditor();

  const handleDragStart = (e: React.DragEvent, element: EditorElement) => {
    const elementData = JSON.stringify(element);
    e.dataTransfer.setData("componentData", elementData);
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

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: props.element },
    });
  };

  const isValidUrl = (url: string) => {
    return /^https?:\/\//i.test(url);
  };

  const href = !Array.isArray(props.element.content)
    ? props.element.content.href
    : null;

  // const formattedHref = href && isValidUrl(href) ? href : null;
  const formattedHref = href && !isValidUrl(href) ? `http://${href}` : href;

  const hasBackgroundImage = props.element.styles.backgroundImage;
  
  // Dynamically load the font import
  useEffect(() => {
    if (props.element.styles.fontImport) {
      const link = document.createElement("link");
      link.href = props.element.styles.fontImport;
      link.rel = "stylesheet";
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [props.element.styles.fontImport]);
  return (
    <div
      style={{
        ...props.element.styles,
        cursor: formattedHref ? 'pointer' : 'default',
      }}
      draggable
      onDragStart={(e) => handleDragStart(e, props.element)}
      onClick={handleOnClickBody}
      className={clsx(
        "p-[2px] w-full m-[2px] my-[5px] relative text-[16px] transition-all",
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
      {!Array.isArray(props.element.content) &&
        (state.editor.previewMode || state.editor.liveMode) && formattedHref ? (
        <a
          href={formattedHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            backgroundImage: hasBackgroundImage ? `url(${props.element.styles.backgroundImage})` : 'none',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {props.element.content.innerText && !hasBackgroundImage && (
            <span>{props.element.content.innerText}</span>
          )}
        </a>
      ) : (
        <span
          contentEditable={!state.editor.liveMode}
          onBlur={(e) => {
            const spanElement = e.target as HTMLSpanElement;
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                elementDetails: {
                  ...props.element,
                  content: {
                    ...props.element.content,
                    innerText: spanElement.innerText,
                  },
                },
              },
            });
          }}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            backgroundImage: hasBackgroundImage ? `url(${props.element.styles.backgroundImage})` : 'none',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!Array.isArray(props.element.content) &&
            props.element.content.innerText}
        </span>
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

export default LinkComponent;