"use client";
import { Badge } from "@/components/ui/badge";
import { EditorBtns, defaultStyles } from "@/lib/constants";
import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import React from "react";
import { v4 } from "uuid";
import Recursive from "./recursive";
import { Trash } from "lucide-react";

type Props = { element: EditorElement };

// This container is recursive. A container inside can have other elements or even another container.
const Container = ({ element }: Props) => {
  const { id, content, name, styles, type } = element;
  const { dispatch, state } = useEditor();

  const handleOnDrop = (e: React.DragEvent) => {
    e.stopPropagation();

    // Retrieve the serialized element data
    const componentData = e.dataTransfer.getData("componentData");

    if (componentData) {
      // Deserialize the element data
      const elementDetails = JSON.parse(componentData);

      // Function to generate new IDs for the duplicated element
      const generateNewIds = (element: EditorElement) => {
        element.id = v4();
        if (Array.isArray(element.content)) {
          element.content.forEach(generateNewIds);
        }
      };

      // Generate new IDs for the duplicated element
      generateNewIds(elementDetails);

      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id, // ID of the current container.
          elementDetails, // Use the deserialized element details with new IDs.
        },
      });
    } else {
      // Fallback to component type if component data does not exist
      //when we drag an element form the sidebar, there is a thing called "dataTransfer, we can basically
      //attach metadata or any type of data into event when it is dragged across the page.
      //And the handleOnDrop event basically gives access to that data transfer"
      const componentType = e.dataTransfer.getData("componentType") as EditorBtns;

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
                  ...defaultStyles, // Applying default styles.
                },
                type: "text", // Type of the new element
              },
            },
          });
          break;
        case "link":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id, //specific containerId equal to current id 
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
            },
          });
          break;
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
    if (element.type === "__body") return;  // If the type is "__body", do nothing.

    // Serialize the element data
    const elementData = JSON.stringify(element);
    e.dataTransfer.setData("componentData", elementData); // Sets the component data in the data transfer object.
  };

  // Handles the click event on the container body.
  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stops the event from propagating
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: element,  // Sets the clicked element
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

  return (
    <div
      style={styles}  // Applying styles to the container.
      className={clsx("relative p-4 transition-all group", {
        "max-w-full w-full": type === "container" || type === "2Col", // Applying full width styles for container or 2Col types.
        "h-fit": type === "container", // Applying fit height for container type.
        "h-full": type === "__body",  // Applying full height for __body type.
        "custom-scrollbar mb-10": type === "__body",  // Applying overflow auto for __body type.
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
          state.editor.selectedElement.id === id && !state.editor.liveMode,  // Applying solid border for selected element if not in live mode.
        "border-dashed border-[1px] border-slate-300": !state.editor.liveMode, // Applying dashed border if not in live mode.
      })}
      onDrop={handleOnDrop} // Handling drop event.
      onDragOver={handleDragOver} // Handling drag over event.
      draggable={type !== "__body"} // Making the container draggable if it's not __body type.
      onClick={handleOnClickBody}  // Handling click event on the container body.
      onDragStart={(e) => handleDragStart(e, element)} // Handling drag start event with element data.
    >

      <Badge
        className={clsx(
          "absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg hidden",
          {
            block:
              state.editor.selectedElement.id === element.id &&
              !state.editor.liveMode, // Displaying the badge if the element is selected and not in live mode.
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