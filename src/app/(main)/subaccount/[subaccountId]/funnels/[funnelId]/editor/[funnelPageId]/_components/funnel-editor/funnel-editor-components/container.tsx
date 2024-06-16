"use client";
import { Badge } from "@/components/ui/badge";
import { EditorBtns, defaultStyles } from "@/lib/constants";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import React from "react";
import Recursive from "./recursive";
import { Trash } from "lucide-react";
import { v4 } from "uuid";

// This container is recursive. A container inside can have other elements or even another container.
type Props = { element: EditorElement };

const Container = ({ element }: Props) => {
  const { id, content, name, styles, type } = element;
  const { dispatch, state } = useEditor();

  const calculateDropIndex = (e: React.DragEvent): number => {
    // e.clientY: The vertical coordinate within the application's client area at which the event occurred.
    // It is used to determine the drop position relative to the viewport.
    const dropY = e.clientY;

    // Converts the children of the current target (container) into an array and finds the index where the new element should be inserted
    const dropIndex = Array.from(e.currentTarget.children).findIndex(
      (child) => {
        // Returns the size of an element and its position relative to the viewport.
        const childRect = child.getBoundingClientRect();
        // Checks if the drop position (dropY) is above the midpoint of the child element.
        // This helps in determining whether to insert the new element before or after the current child element.
        return dropY < childRect.top + childRect.height / 2;
      }
    );

    // Return the calculated drop index
    return dropIndex;
  };

  //The event object of type React.DragEvent which provides information about the drag-and-drop event.
  const handleOnDrop = (e: React.DragEvent) => {
    e.preventDefault(); //Prevents the default behavior of the browser, which might be to open the dragged item.
    e.stopPropagation(); //Stops the event from propagating (bubbling up) to parent elements.

    // Retrieves the data associated with the drag event. In this case, it gets the serialized data of the component being dragged.
    const componentData = e.dataTransfer.getData("componentData");

    //If componentData exists, it deserializes the data using JSON.parse.
    //With componentData: This typically means an element is being moved within the same container or between different containers,
    //and its details are serialized in componentData.
    if (componentData) {
      // Deserialize the element data
      const elementDetails = JSON.parse(componentData);
      const dropIndex = calculateDropIndex(e); // Calculate the drop index

      //Converts content to an array if it isn't already.
      //Dispatches the MOVE_ELEMENT action with the containerId, elementDetails, and dropIndex.
      //If dropIndex is -1, it adds the element to the end of the content array.
      const contentArray = Array.isArray(content) ? content : [];
      dispatch({
        type: "MOVE_ELEMENT",
        payload: {
          containerId: id,
          elementDetails,
          dropIndex: dropIndex === -1 ? contentArray.length : dropIndex,
        },
      });
    } else {
      //means a new element is being dragged from a sidebar or palette and dropped into the container. The type of the new element is identified by componentType.
      //when we drag an element form the sidebar, there is a thing called "dataTransfer, we can basically
      //attach metadata or any type of data into event when it is dragged across the page.
      const componentType = e.dataTransfer.getData(
        "componentType"
      ) as EditorBtns;
      const dropIndex = calculateDropIndex(e); // Calculate the drop index

      const contentArray = Array.isArray(content) ? content : [];
      //calculated based on the dropIndex. If dropIndex is -1, the new element is added at the end of the container's content array.
      const positionIndex = dropIndex === -1 ? contentArray.length : dropIndex;

      // Switch statement to handle different types of components being dropped.
      switch (componentType) {
        //so, if an element that was dropped into below component was of type text, we will dispatch and add element.
        case "text":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id, // ID of the current container.
              elementDetails: {
                content: { innerText: "Text Element" }, // Content of the new text element.
                id: v4(), // Generating a unique ID for the new element
                name: "Text",
                styles: {
                  color: "black",
                  ...defaultStyles,
                },
                type: "text", // Applying default styles.
              },
              positionIndex,
            },
          });
          break;
        case "link":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id,
              elementDetails: {
                content: {
                  innerText: "Link Element",
                  href: "#",
                },
                id: v4(),
                name: "Link",
                styles: {
                  color: "black",
                  ...defaultStyles,
                },
                type: "link",
              },
              positionIndex,
            },
          });
          break;
        case "video":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id,
              elementDetails: {
                content: {
                  src: "https://www.youtube.com/embed/Mfa9ah4Rvlo?si=95RzWjowadLbFw2H",
                },
                id: v4(),
                name: "Video",
                styles: {},
                type: "video",
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
        case "contactForm":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id,
              elementDetails: {
                content: [],
                id: v4(),
                name: "Contact Form",
                styles: {},
                type: "contactForm",
              },
              positionIndex,
            },
          });
          break;
        case "paymentForm":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id,
              elementDetails: {
                content: [],
                id: v4(),
                name: "Payment Form",
                styles: {},
                type: "paymentForm",
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
                content: [
                  {
                    content: [],
                    id: v4(),
                    name: "Container",
                    styles: { ...defaultStyles, width: "100%" },
                    type: "container",
                  },
                  {
                    content: [],
                    id: v4(),
                    name: "Container",
                    styles: { ...defaultStyles, width: "100%" },
                    type: "container",
                  },
                ],
                id: v4(),
                name: "Two Columns",
                styles: { ...defaultStyles, display: "flex" },
                type: "2Col",
              },
              positionIndex,
            },
          });
          break;
        case "icon":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id,
              elementDetails: {
                content: [],
                id: v4(),
                name: "Icon",
                styles: { icon: "star" }, // Default icon
                type: "icon",
              },
              positionIndex,
            },
          });
        // Add cases for other component types if needed
        default:
          console.warn(`Unhandled component type: ${componentType}`);
      }
    }
  };

  // Handles the drag over event to allow dropping.
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Prevents the default behavior to allow dropping.
  };

  const handleDragStart = (e: React.DragEvent, element: EditorElement) => {
    const elementData = JSON.stringify(element);
    e.dataTransfer.setData("componentData", elementData);
  };

  // Handles the click event on the container body.
  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stops the event from propagating
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: element, // Sets the clicked element
      },
    });
  };
  // Handles the delete element event.
  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  // Determine if dragging should be enabled
  const isDraggable = !state.editor.previewMode && !state.editor.liveMode;

  return (
    <div
      style={styles} // Applying styles to the container.
      className={clsx("relative p-2 transition-all group mx-[3px]", {
        "max-w-full w-full": type === "container" || type === "2Col", // Applying full width styles for container or 2Col types.
        "h-fit": type === "container", // Applying fit height for container type.
        "h-full": type === "__body", // Applying full height for __body type.
        "overflow-y-scroll custom-scrollbar overflow-x-hidden ":
          type === "__body", // Applying overflow auto for __body type.
        "mb-[100px]": !state.editor.liveMode,
        "flex flex-col md:!flex-row": type === "2Col", // Applying flex layout for 2Col type.
        "!border-blue-500":
          state.editor.selectedElement.id === id &&
          !state.editor.liveMode &&
          state.editor.selectedElement.type !== "__body", // Applying blue border for selected element if not in live mode and not __body type.
        "!border-yellow-400 !border-4":
          state.editor.selectedElement.id === id &&
          !state.editor.liveMode &&
          state.editor.selectedElement.type === "__body", // Applying yellow border for selected element if not in live mode and is __body type.
        "!border-solid":
          state.editor.selectedElement.id === id && !state.editor.liveMode, // Applying solid border for selected element if not in live mode.
        "border-dashed border-[1px] border-slate-300": !state.editor.liveMode, // Applying dashed border if not in live mode.
      })}
      onDrop={isDraggable ? handleOnDrop : undefined} // Handling drop event only if draggable
      onDragOver={isDraggable ? handleDragOver : undefined} // Handling drag over event only if draggable
      onClick={handleOnClickBody} // Handling click event on the container body.
      draggable={isDraggable}
    >
      <Badge
        className={clsx(
          "absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg hidden",
          {
            block:
              state.editor.selectedElement.id === element.id &&
              !state.editor.liveMode, // Displaying the badge if the element is selected and not in live mode
          }
        )}
      >
        {element.name}
      </Badge>

      {/* recursive elements 
            if the content of above component is an array, then we need to map over that and return recursive components
            e.g., if the content was an array of multiple elements, now each of those can be another container, that's why we are returning recursive elements
        */}
      {Array.isArray(content) &&
        content.map((childElement) => (
          <Recursive key={childElement.id} element={childElement} />
        ))}

      {/* delete button */}
      {/* Displaying the delete button if the element is selected, not in live mode, and not __body type */}
      {state.editor.selectedElement.id === element.id &&
        !state.editor.liveMode &&
        state.editor.selectedElement.type !== "__body" && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg ">
            <Trash size={16} onClick={handleDeleteElement} />
          </div>
        )}
    </div>
  );
};

export default Container;
