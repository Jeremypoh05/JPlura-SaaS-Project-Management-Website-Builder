"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { saveActivityLogsNotification, upsertFunnelPage } from "@/lib/queries";
import { DeviceTypes, useEditor } from "@/providers/editor/editor-provider";
import { FunnelPage } from "@prisma/client";
import clsx from "clsx";
import {
  ArrowLeftCircle,
  EyeIcon,
  Laptop,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FocusEventHandler, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  funnelId: string; //this is come from the funnelPageId/page.tsx (we get from the params)
  funnelPageDetails: FunnelPage;
  subaccountId: string; //this is come from the funnelPageId/page.tsx(we get from the params)
};

const FunnelEditorNavigation = ({
  funnelId,
  funnelPageDetails,
  subaccountId,
}: Props) => {
  const router = useRouter();
  const { state, dispatch } = useEditor();

  useEffect(() => {
    dispatch({
      type: "SET_FUNNELPAGE_ID",
      payload: { funnelPageId: funnelPageDetails.id },
    });
  }, [funnelPageDetails]);

  //this will save the path if clicking out this input field
  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (
    event
  ) => {
    //if the value is same as the funnelPageDetails.name, means nothing have changed, then just return.
    if (event.target.value === funnelPageDetails.name) return;
    //else, upsert the page.
    if (event.target.value) {
      await upsertFunnelPage(
        subaccountId,
        {
          id: funnelPageDetails.id,
          name: event.target.value,
          order: funnelPageDetails.order,
        },
        funnelId
      );

      toast("Success", {
        description: "Saved Funnel Page title",
      });
      router.refresh();
    } else {
      toast("Oppse!", {
        description: "You need to have a title!",
      });
      event.target.value = funnelPageDetails.name;
    }
  };

  const handlePreviewClick = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
    dispatch({ type: "TOGGLE_LIVE_MODE" }); //removes all the border of elements when live mode
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
  };

  const handleOnSave = async () => {
    //Convert State to JSON
    //The state.editor.elements is likely a complex JavaScript object representing the current state of the editor. 
    //Converting it to a JSON string allows it to be easily stored or transmitted over a network.
    const content = JSON.stringify(state.editor.elements);
    try {
      const response = await upsertFunnelPage(
        subaccountId,
        {
          ...funnelPageDetails, //ensures that all other properties of funnelPageDetails are included in the update.
          content,
        },
        funnelId
      );
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a funnel page | ${response?.name}`,
        subaccountId: subaccountId,
      });
      toast("Success", {
        description: "Saved Editor",
      });
    } catch (error) {
      toast("Oppse!", {
        description: "Could not save editor",
      });
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <nav
        className={clsx(
          "border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all",
          { "!h-0 !p-0 !overflow-hidden": state.editor.previewMode } //only if the preview mode is true.
        )}
      >
        <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
          {/* this arrow will go back to the funnels */}
          <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
            <ArrowLeftCircle />
          </Link>
          <div className="flex flex-col w-full ">
            <Input
              defaultValue={funnelPageDetails.name}
              className="border-none h-5 m-0 p-0 text-lg"
              onBlur={handleOnBlurTitleChange} //allow user to save the title when user clicks inside it.
            />
            <span className="text-sm text-muted-foreground">
              Path: /{funnelPageDetails.pathName}
            </span>
          </div>
        </aside>

        <aside>
          <Tabs
            defaultValue="Desktop"
            className="w-fit "
            value={state.editor.device}
            onValueChange={(value) => {
              dispatch({
                type: "CHANGE_DEVICE",
                payload: { device: value as DeviceTypes }, //change device to whatever we selected.
              });
            }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Desktop"
                    className="data-[state=active]:bg-muted w-10 h-10 p-0"
                  >
                    <Laptop />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Desktop</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Tablet"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Tablet />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tablet</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Mobile"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Smartphone />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mobile</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </aside>

        <aside className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-slate-800"
            onClick={handlePreviewClick}
          >
            <EyeIcon />
          </Button>
          <Button
            //The undo button should be enabled only if there are previous states to go back to.
            //If currentIndex is greater than 0, it means there are previous states available for undo.
            //If currentIndex is 0, it means we are at the initial state, and there's nothing to undo
            //so ! > 0 means we less than 0.
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-slate-800"
          >
            <Undo2 />
          </Button>
          <Button
            //state.history.currentIndex: This represents the current position in the history stack.
            //state.history.history: This is an array that holds the history of states.
            //The redo button should be enabled only if there are future states to go forward to.
            //If currentIndex is less than history.length - 1, it means there are future states available for redo.
            //If currentIndex is equal to history.length - 1, it means we are at the most recent state, and there's nothing to redo.
            disabled={
              !(state.history.currentIndex < state.history.history.length - 1)
            }
            onClick={handleRedo}
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-slate-800 mr-4"
          >
            <Redo2 />
          </Button>
          <div className="flex flex-col item-center mr-4">
            <div className="flex flex-row items-center gap-4">
              Draft
              <Switch disabled defaultChecked={true} />
              Publish
            </div>
            <span className="text-muted-foreground text-sm">
              Last updated{" "}
              {new Date(funnelPageDetails.updatedAt).toLocaleString("en-US", {
                year: "2-digit",
                month: "2-digit",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
          <Button onClick={handleOnSave}>Save</Button>
        </aside>
      </nav>
    </TooltipProvider>
  );
};

export default FunnelEditorNavigation;
