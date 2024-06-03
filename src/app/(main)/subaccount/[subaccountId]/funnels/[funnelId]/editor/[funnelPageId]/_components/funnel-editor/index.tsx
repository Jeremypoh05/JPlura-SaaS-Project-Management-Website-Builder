"use client";
import { Button } from "@/components/ui/button";
import { getFunnelPageDetails } from "@/lib/queries";
import { useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { EyeOff } from "lucide-react";
import React, { useEffect } from "react";
import Recursive from "./funnel-editor-components/recursive";

type Props = { funnelPageId: string; liveMode?: boolean };

const FunnelEditor = ({ funnelPageId, liveMode }: Props) => {

  //A custom hook that provides access to the editor's state and dispatch function.
  const { dispatch, state } = useEditor();

  // useEffect hook runs when the component mounts or when liveMode changes.
  useEffect(() => {
    //If liveMode is true, it dispatches an action to toggle live mode in the editor.
    if (liveMode) {
      dispatch({
        type: "TOGGLE_LIVE_MODE",
        payload: { value: true },
      });
    }
  }, [liveMode]);

  //hook runs when the component mounts or when funnelPageId changes.
  useEffect(() => {
    const fetchData = async () => {
      //defines and calls an asynchronous fetchData function that fetches funnel page details using getFunnelPageDetails.
      const response = await getFunnelPageDetails(funnelPageId);
      if (!response) return;

      //if have response, dispatch the LOAD_DATA. then set the elements to the response.content
      dispatch({
        type: "LOAD_DATA",
        payload: {
          elements: response.content ? JSON.parse(response?.content) : "",
          withLive: !!liveMode,
        },
      });
      console.log("funnelpageIdDetails", response)
    };
    fetchData();
  }, [funnelPageId]);

  // Dispatches an action to change the clicked element in the editor.
  const handleClick = () => {
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {},
    });
  };

  // Dispatches actions to toggle both preview mode and live mode.
  const handleUnpreview = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };
  return (
    <div
      className={clsx(
        "use-automation-zoom-in h-full overflow-auto custom-scrollbar mr-[385px] bg-background transition-all rounded-md",
        {
          "!p-0 !mr-0":
            state.editor.previewMode === true || state.editor.liveMode === true,
          "!w-[850px]": state.editor.device === "Tablet",
          "!w-[420px]": state.editor.device === "Mobile",
          "w-full": state.editor.device === "Desktop",
        }
      )}
      onClick={handleClick}
    >
      {state.editor.previewMode && state.editor.liveMode && (
        <Button
          variant={"ghost"}
          size={"icon"}
          className="w-6 h-6 bg-slate-600 p-[2px] fixed top-0 left-0 z-[100]"
          onClick={handleUnpreview}
        >
          <EyeOff />
        </Button>
      )}
      
      {/* if it is true, we're gonna map over those elements */}
      {Array.isArray(state.editor.elements) &&
        state.editor.elements.map((childElement) => (
          <Recursive key={childElement.id} element={childElement} />
        ))}
    </div>
  );
};

export default FunnelEditor;
