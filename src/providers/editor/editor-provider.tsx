"use client";

import { EditorBtns } from "@/lib/constants";
import { EditorAction } from "./editor-actions";
import { createContext, Dispatch, useContext, useReducer } from "react";
import { FunnelPage } from "@prisma/client";
import { CustomStyles } from "@/lib/types";

/*
This code is part of an editor application where users can create and manage elements (like a page builder). 
The state management is handled using a reducer pattern, commonly in applications using libraries like Redux.
*/

export type DeviceTypes = "Desktop" | "Mobile" | "Tablet"; //Represents the types of devices the editor can switch between (e.g., Desktop, Mobile, Tablet).

//Represents an element in the editor.
export type EditorElement = {
  id: string;
  // styles: React.CSSProperties;
  styles: CustomStyles; // Use the new CustomStyles type here
  name: string;
  type: EditorBtns;
  content:
    | EditorElement[]
    | { href?: string; innerText?: string; src?: string }; //it will be either editor element and an array of them or it will be a special objects  //href?: string is a custom properties, that will be used in the settings-tab (custom)
};

//Represents the state of the editor
export type Editor = {
  liveMode: boolean; //Whether the editor is in live mode.
  elements: EditorElement[];
  selectedElement: EditorElement; //if we click on something, we want to populate the sidebar/ the properties tab with that specific element styles.
  device: DeviceTypes; //which device we editing on
  previewMode: boolean; //: Whether the editor is in preview mode.
  funnelPageId: string; //The ID of the funnel page being edited.
};

//Manages the history of editor states for undo/redo functionality:
export type HistoryState = {
  history: Editor[];
  currentIndex: number; //: The current position in the history array.
};

//The entire state of the editor, combining Editor and HistoryState.
export type EditorState = {
  editor: Editor;
  history: HistoryState;
};

//The default state of the editor
const initialEditorState: EditorState["editor"] = {
  //default values
  elements: [
    {
      content: [],
      id: "__body",
      name: "Body",
      styles: {},
      type: "__body",
    },
  ],
  selectedElement: {
    id: "",
    content: [],
    name: "",
    styles: {},
    type: null,
  },
  device: "Desktop",
  previewMode: false,
  liveMode: false,
  funnelPageId: "",
};

// The default history state.
const initialHistoryState: HistoryState = {
  history: [initialEditorState],
  currentIndex: 0,
};

//initialState of the entire editor (initialEditorState and initialHistoryState.)
const initialState: EditorState = {
  editor: initialEditorState,
  history: initialHistoryState,
};

/* 
Recursive function. Add an element to any container on the editor, so if we drag n drop into a container that is completely nested,
then, with the help of this containerId, we can tell which one to put that element into.

So, when we dispatch this function with the container, let's say if the element is
container that is inside another container, then we are going to search for that container based on what we get
from the payload, and if we find that container, we're going to put set its contents to everything that's in there.
and then add a new elementDetails in there. If we can't find that containerId, we will check item.content and it is an
array, then we will return the item and the content we will invoke addAnElement one more time and pass in the item.content and the action.


better explaination: This function is responsible for adding a new element to a specific container within the editor's elements array. It's a recursive function that can handle deeply nested structures.
*/
const addAnElement = (
  editorArray: EditorElement[], //The array of EditorElement objects where the new element should be added.
  action: EditorAction //  The action object containing the type and payload for adding an element.
): EditorElement[] => {
  //This check ensures that the function is only called with the ADD_ELEMENT action type. If the action type is not ADD_ELEMENT, it throws an error.
  if (action.type !== "ADD_ELEMENT")
    throw Error(
      "You sent the wrong action type to the Add Element editor State"
    );
  // The function maps over each item in the editorArray.
  return editorArray.map((item) => {
    //If the item's id matches the containerId from the action payload and its content is an array:
    // Return a new object with the same properties as the item but with the new element added to its content.
    if (item.id === action.payload.containerId && Array.isArray(item.content)) {
      // Create a new array with the new element inserted at the specified position
      // a copy of the current item.content array. We create a new array to avoid mutating the original array directly,
      const newContent = [...item.content];
      // splice method is used to insert the new element at the specified position (positionIndex) within the newContent array.
      //splice syntax: array.splice(startIndex, deleteCount, item1, item2, ...)
      //startIndex: The index at which to start changing the array.
      //deleteCount: The number of elements to remove(0 in this case, as we are only inserting).
      newContent.splice(
        action.payload.positionIndex,
        0,
        action.payload.elementDetails
      );
      // Return a new object with the same properties as the item but with the new element added to its content.
      return {
        ...item,
        content: [...item.content, action.payload.elementDetails],
      };
      // If the item's content is an array but the id does not match:
      //Recursively call addAnElement on the content array to potentially find the correct container deeper in the structure.
    } else if (item.content && Array.isArray(item.content)) {
      return {
        ...item,
        content: addAnElement(item.content, action),
      };
    }
    //If neither condition is met, return the item unchanged.
    return item;
  });
};

const updateAnElement = (
  editorArray: EditorElement[],
  action: EditorAction
): EditorElement[] => {
  // Ensure the action type is UPDATE_ELEMENT
  if (action.type !== "UPDATE_ELEMENT") {
    throw Error("You sent the wrong action type to the update Element State");
  }
  // Iterate over each item in the editorArray
  return editorArray.map((item) => {
    // Check if the current item's id matches the elementId from the action payload
    if (item.id === action.payload.elementDetails.id) {
      //if we found that elements that we are trying to update,
      // Return a new object with the updated details
      return { ...item, ...action.payload.elementDetails }; //then we will return everything inside the item, but we will also add new elementDetails
      // If the current item's content is an array, recursively call updateAnElement on the content array
    } else if (item.content && Array.isArray(item.content)) {
      //if not find, but if it has content and it is an array
      return {
        ...item,
        //call it one more time recursively, and pass in the new content
        content: updateAnElement(item.content, action),
      };
    }
    return item;
  });
};

/*
 move an element within a nested array of EditorElement objects.
 Removing the element from its original location.
 Inserting the element into its new location.
*/

const moveElement = (
  editorArray: EditorElement[],
  action: EditorAction //The action object containing the details of the move operation.
): EditorElement[] => {
  if (action.type !== "MOVE_ELEMENT") {
    throw Error(
      "You sent the wrong action type to the Move Element editor State"
    );
  }

  //Extracts containerId, elementDetails, and dropIndex from the action payload. These are the parameters needed to move the element.
  const { containerId, elementDetails, dropIndex } = action.payload;

  // Function to remove the element from the array
  const removeElement = (
    elements: EditorElement[],
    elementId: string // The ID of the element to remove
  ): {
    updatedElements: EditorElement[];
    removedElement: EditorElement | null;
  } => {
    let removedElement: EditorElement | null = null; // Variable to store the removed element
    //If the element matches elementId, it sets removedElement and excludes it from the returned array.
    const updatedElements = elements.reduce<EditorElement[]>((acc, el) => {
      if (el.id === elementId) {
        // If the current element matches the ID
        removedElement = el; // Store the element in removedElement
        return acc; // Do not include this element in the updated array
      }
      //If the element has nested content (i.e., Array.isArray(el.content)),
      //it recursively calls removeElement on the nested content.
      if (Array.isArray(el.content)) {
        // If the element has nested content
        const result = removeElement(el.content, elementId); // Recursively call removeElement on the nested content
        if (result.removedElement) {
          // If an element was removed from the nested content
          removedElement = result.removedElement; // Store the removed element
          return [...acc, { ...el, content: result.updatedElements }]; // Update the current element's content and include it in the updated array
        }
      }
      return [...acc, el]; //Include the current element in the updated array
    }, []);
    return { updatedElements, removedElement }; // Return the updated array and the removed element
  };

  // Function to insert the element into the array
  const insertElementAt = (
    elements: EditorElement[], // The array of elements to search through
    containerId: string, // The ID of the container to insert the element into
    element: EditorElement, // The element to insert
    index: number //The index at which to insert the element
  ): EditorElement[] => {
    return elements.map((el) => {
      if (el.id === containerId) {
        // If the current element matches the container ID
        const newContent = Array.isArray(el.content) ? [...el.content] : []; // Ensure the content is an array
        newContent.splice(index, 0, element); // Insert the element at the specified index
        return {
          ...el,
          content: newContent, // Update the current element's content
        };
      }
      if (Array.isArray(el.content)) {
        // If the element has nested content
        return {
          ...el,
          content: insertElementAt(el.content, containerId, element, index), // Recursively call insertElementAt on the nested content
        };
      }
      return el; //if nothing matches, return the current element unchanged
    });
  };

  // Remove the element from its original location
  const { updatedElements, removedElement } = removeElement(
    editorArray,
    elementDetails.id
  );

  if (!removedElement) {
    // If the element was not found
    return editorArray; // Return the original array
  }

  // Insert the element into its new location
  const result = insertElementAt(
    updatedElements,
    containerId,
    removedElement,
    dropIndex
  );

  return result; // Return the updated array
};

const deleteAnElement = (
  editorArray: EditorElement[],
  action: EditorAction
): EditorElement[] => {
  if (action.type !== "DELETE_ELEMENT")
    throw Error(
      "You sent the wrong action type to the Delete Element editor State"
    );
  // If the current item's id matches the id of the element to be deleted, filter it out
  return editorArray.filter((item) => {
    //If the id of the current item matches the id of the element to be deleted (action.payload.elementDetails.id),
    //the function returns false, effectively removing the element from the array.
    if (item.id === action.payload.elementDetails.id) {
      return false; //remove that item from the resulting array, which means this element will not be included in the new array.
    } else if (item.content && Array.isArray(item.content)) {
      //If the current item has a content property that is an array, the function makes a recursive call to deleteAnElement with the content array and the action.
      //This ensures that the function searches for the element to be deleted within nested structures.
      item.content = deleteAnElement(item.content, action);
    }
    //For all other items that do not match the id of the element to be deleted, the function returns true, keeping them in the array.
    return true;
  });
};

// handles various actions to update the editor state.
const editorReducer = (
  state: EditorState = initialState, // The current state of the editor.
  action: EditorAction // The action being dispatched to get the updated elements.
): EditorState => {
  console.log("Action:", action);
  console.log("State before:", state);
  switch (action.type) {
    case "ADD_ELEMENT":
      // Call addAnElement with the current elements and the action
      // to get the updated elements array
      const updatedEditorState = {
        ...state.editor,
        elements: addAnElement(state.editor.elements, action), //Call the addAnElement function with the current elements and the action to get the updated elements.
      };
      // Slice the history array up to the current index + 1
      // This removes any "future" states that may exist after the current index
      const updatedHistory = [
        //Slice the history array up to the current index + 1. This ensures any "future" states after the current index are discarded (important for undo/redo functionality).
        ...state.history.history.slice(0, state.history.currentIndex + 1), //everything before that
        { ...updatedEditorState }, // Save a copy of the updated editor state to keep track of the newest one.
      ];

      // Create a new state object combining the updated editor state and history
      const newEditorState = {
        ...state, //everthing inside the state
        editor: updatedEditorState,
        history: {
          ...state.history, //everything inside the history
          history: updatedHistory, //newest history
          currentIndex: updatedHistory.length - 1, // Update the currentIndex to the last index in the updated history array
        },
      };
      // Return the new state object

      return newEditorState;

    case "UPDATE_ELEMENT":
      // Call updateAnElement to handle updating an existing element
      const updatedElements = updateAnElement(state.editor.elements, action);

      // Check if the updated element is the currently selected element
      const UpdatedElementIsSelected =
        state.editor.selectedElement.id === action.payload.elementDetails.id;

      // Update the editor state with the updated elements
      const updatedEditorStateWithUpdate = {
        ...state.editor,
        elements: updatedElements,
        selectedElement: UpdatedElementIsSelected
          ? action.payload.elementDetails // If the updated element is selected, update the selected element details
          : {
              id: "", // If not, reset the selected element
              content: [],
              name: "",
              styles: {},
              type: null,
            },
      };

      // Update the history with the new editor state
      const updatedHistoryWithUpdate = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorStateWithUpdate }, // Save a copy of the updated state
      ];
      // Create a new state object combining the updated editor state and history
      const updatedEditor = {
        ...state, // Everything inside the state
        editor: updatedEditorStateWithUpdate,
        history: {
          ...state.history, // Everything inside the history
          history: updatedHistoryWithUpdate, // Newest history
          currentIndex: updatedHistoryWithUpdate.length - 1, // Update the currentIndex to the last index in the updated history array
        },
      };

      // Return the new state object
      return updatedEditor;

    case "MOVE_ELEMENT":
      console.log("Action payload:", action.payload); // Log the payload here
      //Calls the moveElement function with the current array of editor elements and the action.
      // The moveElement function handles the logic of removing the element from its original location and inserting it into its new location.
      // The result is the updated array of elements after the move operation.
      const movedElements = moveElement(state.editor.elements, action);
      // Create a new editor state with the updated elements array
      const movedEditorState = {
        ...state.editor, // Copy the existing editor state
        elements: movedElements, // Update the elements array with the moved elements
      };
      // Update the history array to include the new editor state
      const movedHistory = [
        ...state.history.history.slice(0, state.history.currentIndex + 1), // Keep the history up to the current index
        { ...movedEditorState }, // Add the new editor state to the history
      ];
      console.log("State after:", {
        ...state, // Copy the existing state
        editor: movedEditorState, // Update the editor state
        history: {
          ...state.history, // Copy the existing history state
          history: movedHistory, // Update the history array with the new editor state
          currentIndex: movedHistory.length - 1, // Update the current index to point to the latest state
        },
      });
      // Return the new state with the updated editor state and history
      return {
        ...state,
        editor: movedEditorState,
        history: {
          ...state.history,
          history: movedHistory,
          currentIndex: movedHistory.length - 1,
        },
      };

    case "DELETE_ELEMENT":
      // Call deleteAnElement to handle deleting an existing element
      const updatedElementsAfterDelete = deleteAnElement(
        state.editor.elements,
        action
      );
      const updatedEditorStateAfterDelete = {
        ...state.editor,
        elements: updatedElementsAfterDelete,
      };
      // Update the history with the new editor state
      const updatedHistoryAfterDelete = [
        //creates a new array that includes all elements from the start of the history array (index 0) up to and including the current state (currentIndex + 1).
        ...state.history.history.slice(0, state.history.currentIndex + 1), // Slice the history array up to the current index + 1
        { ...updatedEditorStateAfterDelete }, // Save a copy of the updated state
      ];

      // Create a new state object combining the updated editor state and history
      const deletedState = {
        ...state, //his spreads the existing state properties into the new state object. It ensures that all other properties of the state remain unchanged.
        editor: updatedEditorStateAfterDelete, //This replaces the editor part of the state with the updated editor state that includes the elements after deletion.
        history: {
          ...state.history, // This spreads the existing properties of the history object into the new history object.
          history: updatedHistoryAfterDelete, //This updates the history array with the new history that includes the latest state.
          currentIndex: updatedHistoryAfterDelete.length - 1, // This updates the currentIndex to point to the last item in the updated history array, which is the most recent state.
        },
      };
      return deletedState;

    //if elements was clicked so change the clicked element, so if we click on smth, one of the elements, we want the state also keep track of that.
    case "CHANGE_CLICKED_ELEMENT":
      const clickedState = {
        ...state, //This spreads all the current state properties into the new state object to ensure immutability.
        editor: {
          ...state.editor, // This spreads all the current editor properties into the new editor state object.
          //updates the selectedElement property with the details of the clicked element. If no element details are provided
          //(action.payload.elementDetails is null or undefined), resets selectedElement to an empty state.
          selectedElement: action.payload.elementDetails || {
            id: "",
            content: [],
            name: "",
            styles: {},
            type: null,
          },
        },
        history: {
          ...state.history, //This spreads all the current history properties into the new history state object.
          history: [
            //This creates a new history array that includes the states up to the current index
            // and adds a copy of the current editor state.
            ...state.history.history.slice(0, state.history.currentIndex + 1),
            { ...state.editor }, // Save a copy of the current editor state
          ],
          currentIndex: state.history.currentIndex + 1, //This updates the currentIndex to point to the new state in the history.
        },
      };
      return clickedState;

    //This case updates the state to reflect a change in the device type (e.g., mobile, tablet, desktop).
    case "CHANGE_DEVICE":
      const changedDeviceState = {
        ...state, //This spreads all the current state properties into the new state object.
        editor: {
          ...state.editor,
          device: action.payload.device, //updates the device property with the new device type provided in the action payload.
        },
      };
      return changedDeviceState;

    case "TOGGLE_PREVIEW_MODE":
      const toggleState = {
        ...state, // spreads all the current state properties into the new state object.
        //Imagine the current state is previewMode: false.
        //When the TOGGLE_PREVIEW_MODE action is dispatched, the reducer needs to update the state.
        // -!state.editor.previewMode evaluates to the opposite of the current value.
        //If previewMode is false, !state.editor.previewMode becomes true. Conversely, if previewMode is true, !state.editor.previewMode becomes false.
        editor: {
          ...state.editor, //spreads all the current editor properties into the new editor state object.
          previewMode: !state.editor.previewMode, //This toggles the previewMode property to its opposite value (true to false, or false to true).
        },
      };
      return toggleState;

    case "TOGGLE_LIVE_MODE":
      const toggleLiveMode: EditorState = {
        ...state, //spreads all the current state properties into the new state object.
        editor: {
          //updates the liveMode property. If action.payload is provided, it sets liveMode to action.payload.value. If not, it toggles the liveMode property to its opposite value.
          ...state.editor, //spreads all the current editor properties into the new editor state object.
          liveMode: action.payload
            ? action.payload.value
            : !state.editor.liveMode,
        },
      };
      return toggleLiveMode;

    //moves the state forward to the next state in the history,
    //effectively reapplying the most recently undone change.
    case "REDO":
      //This condition checks if there is a next state available in the history to redo.
      //If the current index is less than the last index in the history array, a redo is possible.
      if (state.history.currentIndex < state.history.history.length - 1) {
        const nextIndex = state.history.currentIndex + 1; //calculates the index of the next state in the history array.
        const nextEditorState = { ...state.history.history[nextIndex] }; //retrieves the next state from the history array and creates a new object to ensure immutability.
        // Update state: This creates a new state object with the updated editor state and history index.
        const redoState = {
          ...state,
          editor: nextEditorState,
          history: {
            ...state.history,
            currentIndex: nextIndex,
          },
        };
        return redoState; // The new state with the redone changes is returned.
      }
      return state; //If there are no more states to redo, the current state is returned unchanged.

    //The UNDO action moves the state backward to the previous state in the history, effectively undoing the most recent change.
    case "UNDO":
      //This condition checks if there is a previous state available in the history to undo. If the current index is greater than 0, an undo is possible.
      if (state.history.currentIndex > 0) {
        const prevIndex = state.history.currentIndex - 1; //This calculates the index of the previous state in the history array.
        const prevEditorState = { ...state.history.history[prevIndex] }; //This retrieves the previous state from the history array and creates a new object to ensure immutability.
        //Update State: creates a new state object with the updated editor state and history index.
        const undoState = {
          ...state,
          editor: prevEditorState,
          history: {
            ...state.history,
            currentIndex: prevIndex,
          },
        };
        return undoState; //: The new state with the undone changes is returned.
      }
      return state; //If there are no more states to undo, the current state is returned unchanged

    //load data when accessing a specific domain or page from production.
    case "LOAD_DATA":
      return {
        ...initialState, //This spreads all properties from initialState into the new state object. This ensures that the state is reset to its initial values, providing a clean slate.
        editor: {
          ...initialState.editor, // This spreads all properties from initialState.editor into the new editor state object. This ensures that the editor state is reset to its initial values.
          //This sets the elements property to the value provided in the action payload. If action.payload.elements is null or undefined, it falls back to initialEditorState.elements.
          //This provides flexibility in handling cases where the payload might not include elements.
          elements: action.payload.elements || initialEditorState.elements,
          //The !! operator converts the value to a boolean. If withLive is truthy, liveMode will be true; otherwise, it will be false.
          liveMode: !!action.payload.withLive,
        },
      };

    //update the funnelPageId in the editor state and also update the history to reflect this change.
    //This ensures that the state can be reverted or reapplied using undo and redo functionality.
    case "SET_FUNNELPAGE_ID":
      const { funnelPageId } = action.payload; //extracts the funnelPageId from the action payload.

      //creates a new editor state object with the updated funnelPageId.
      //The spread operator (...state.editor) ensures that all other properties of the editor state remain unchanged.
      const updatedEditorStateWithFunnelPageId = {
        ...state.editor,
        funnelPageId,
      };

      //slice: array.slice(begin, end)
      //begin: The index at which to start the extraction. The element at this index is included in the new array.
      //end: The index at which to end the extraction. The element at this index is not included in the new array.
      //If omitted, extraction continues to the end of the array.

      //updates the history to include the new editor state with the updated funnelPageId.
      const updatedHistoryWithFunnelPageId = [
        //slices the history array up to the current index + 1. This is necessary to discard any "future" states that exist beyond the current index,
        //ensuring that the history accurately reflects the new state.
        ...state.history.history.slice(0, state.history.currentIndex + 1), //
        { ...updatedEditorStateWithFunnelPageId }, // This adds a copy of the updated editor state to the end of the sliced history array.
      ];

      // creates a new state object with the updated editor state and history.
      const funnelPageIdState = {
        ...state,
        editor: updatedEditorStateWithFunnelPageId,
        history: {
          ...state.history,
          history: updatedHistoryWithFunnelPageId,
          //ensures that the currentIndex points to the latest state in the history array. This is important because it accurately reflects that the most recent change (updating funnelPageId) is now the current state.
          currentIndex: updatedHistoryWithFunnelPageId.length - 1, //Subtracting 1 gives the index of the last element in the array.
        },
      };
      return funnelPageIdState; // The new state with the updated funnelPageId and history is returned.

    //this default is to solve typescript error.
    default:
      return state;
  }
};

//  Defines the shape of the context data, including the current device type and preview mode, along with functions to update these values.
export type EditorContextData = {
  device: DeviceTypes; // The current device type (e.g., Desktop, Mobile, Tablet).
  previewMode: boolean; // Whether the editor is in preview mode.
  setPreviewMode: (previewMode: boolean) => void; // Function to set the preview mode.
  setDevice: (device: DeviceTypes) => void; // Function to set the device type.
};

//Context:Context provides a way to pass data through the component tree without having to pass props down manually at every level. It is useful for global data that many components need,
//such as user authentication, theme, or application settings.

//It wraps its children with the EditorContext.Provider, passing down the state, dispatch function,
// and additional properties (subaccountId, funnelId, pageDetails).
export const EditorContext = createContext<{
  state: EditorState; // The current state of the editor.
  dispatch: Dispatch<EditorAction>; // The dispatch function to send actions to the reducer,  which then updates the state based on the action received.
  subaccountId: string;
  funnelId: string;
  pageDetails: FunnelPage | null; // The details of the current funnel page.
}>({
  state: initialState,
  dispatch: () => undefined, // Default initial state.
  subaccountId: "", // Default dispatch function (no-op).
  funnelId: "",
  pageDetails: null, // Default page details.
});

// defines the shape of the props that the EditorProvider component expects to receive
type EditorProps = {
  children: React.ReactNode; // The child components that will be wrapped by the provider.
  subaccountId: string;
  funnelId: string; // The ID of the funnel.
  pageDetails: FunnelPage; // The details of the current funnel page
};

//Initializes the state using useReducer and provides the state and dispatch function to its children through the context.
//This component wraps the part of the application that needs access to the editor state.
const EditorProvider = (props: EditorProps) => {
  //1. editorReducer: This is the reducer function that specifies how the state should be updated based on the dispatched actions.
  //It takes two arguments: the current state and an action, and it returns a new state.

  //2. initialState: This is the initial state of your component.It defines the starting values for state.
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        subaccountId: props.subaccountId,
        funnelId: props.funnelId,
        pageDetails: props.pageDetails,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};

//This custom hook provides an easy way to access the EditorContext in functional components. It ensures that the hook is used within an EditorProvider.
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor Hook must be used within the editor Provider");
  }
  return context;
};

export default EditorProvider;
