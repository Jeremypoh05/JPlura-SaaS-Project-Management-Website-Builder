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
import { saveActivityLogsNotification, getFunnel, upsertFunnelPage, upsertFunnel } from "@/lib/queries";
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
import React, { FocusEventHandler, useEffect, useState } from "react";
import { toast } from "sonner";

// Props type defines the expected properties passed down to the FunnelEditorNavigation component  
type Props = {
  funnelId: string; // Funnel ID from the params  
  funnelPageDetails: FunnelPage; // Funnel page details  
  subaccountId: string; // Subaccount ID from the params  
  isPublished: boolean; // Initial published state  
};

// Define a type for the FunnelData  
type FunnelData = {
  id: string;
  name: string;
  description: string | null;
  published: boolean;
  liveProducts: string | null;
  subDomainName?: string | null;
  favicon?: string | null;
};

const FunnelEditorNavigation = ({
  funnelId,
  funnelPageDetails,
  subaccountId,
  isPublished,
}: Props) => {
  const router = useRouter();
  const { state, dispatch } = useEditor(); // Custom hook to access state and dispatch from editor context  
  const [isPublishedState, setIsPublishedState] = useState(isPublished); // State to track published status  
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null); // State to track fetched funnel data  

  useEffect(() => {
    // Fetch funnel data once on component mount  
    async function fetchFunnelData() {
      try {
        const currentFunnel = await getFunnel(funnelId);
        if (currentFunnel) {
          // Destructure relevant data from the fetched funnel  
          const {
            id,
            name,
            description,
            published,
            liveProducts,
            subDomainName,
            favicon,
          } = currentFunnel;

          // Log fetched funnel data  
          console.log('Fetched Funnel Data:', currentFunnel);

          // Set the fetched funnel data into component state for later use  
          setFunnelData({
            id,
            name,
            description,
            published,
            liveProducts,
            subDomainName,
            favicon,
          });
        } else {
          // Display error if no funnel data is found  
          toast("Error", {
            description: "Could not load funnel data",
          });
        }
      } catch (error) {
        // Log and display error if fetching data fails  
        console.error("Error fetching funnel data:", error);
        toast("Error", {
          description: "Failed to fetch funnel data",
        });
      }
    }

    fetchFunnelData();

    // Set the funnel page ID for the editor context  
    dispatch({
      type: "SET_FUNNELPAGE_ID",
      payload: { funnelPageId: funnelPageDetails.id },
    });
  }, [funnelPageDetails]); // Dependency array ensures useEffect runs when funnelPageDetails change  

  // Save the title when input loses focus  
  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (
    event
  ) => {
    // Return early if the title hasn't changed  
    if (event.target.value === funnelPageDetails.name) return;

    // If title has changed, update the funnel page  
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

      // Notify success and refresh the page to reflect changes  
      toast("Success", {
        description: "Saved Funnel Page title",
      });
      router.refresh();
    } else {
      // Warn user if title is empty and revert to original name  
      toast("Oops!", {
        description: "You need to have a title!",
      });
      event.target.value = funnelPageDetails.name;
    }
  };

  // Toggle preview and live mode  
  const handlePreviewClick = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };

  // Undo the last state change  
  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  // Redo the last undone state change  
  const handleRedo = () => {
    dispatch({ type: "REDO" });
  };

  // Save changes made in the editor  
  const handleOnSave = async () => {
    // Convert editor state to a JSON string for storage  
    const content = JSON.stringify(state.editor.elements);
    try {
      // Update the funnel page with the current content  
      const responsePage = await upsertFunnelPage(
        subaccountId,
        {
          ...funnelPageDetails,
          content,
        },
        funnelId
      );

      // Ensure funnel data is available before updating  
      if (!funnelData) {
        toast("Error", {
          description: "Funnel data not loaded",
        });
        return;
      }

      // Merge funnel data with current published status and update  
      await upsertFunnel(
        subaccountId,
        {
          ...funnelData,
          description: funnelData.description || "", // Use empty string if null  
          liveProducts: funnelData.liveProducts || "", // Use empty string if null  
          published: isPublishedState,
          subDomainName: funnelData.subDomainName || undefined, // Use undefined if null  
          favicon: funnelData.favicon || undefined, // Use undefined if null  
        },
        funnelId
      );

      // Log the funnel page update action  
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a funnel page | ${responsePage?.name} with published status: ${isPublishedState}`,
        subaccountId: subaccountId,
      });

      // Notify success  
      toast("Success", {
        description: "Saved Editor",
      });
    } catch (error) {
      // Notify user of saving failure  
      toast("Oops!", {
        description: "Could not save editor",
      });
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <nav
        className={clsx(
          "border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all",
          { "!h-0 !p-0 !overflow-hidden": state.editor.previewMode } // Hides nav when preview mode is enabled  
        )}
      >
        <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
          {/* Back arrow goes back to the funnels list */}
          <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
            <ArrowLeftCircle />
          </Link>
          <div className="flex flex-col w-full ">
            <Input
              defaultValue={funnelPageDetails.name}
              className="border-none h-5 m-0 p-0 text-lg"
              onBlur={handleOnBlurTitleChange}
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
                payload: { device: value as DeviceTypes }, // Update editor state with selected device  
              });
            }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
              {/* Tabs for selecting device view with tooltips */}
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
            // Enable undo button only if there is a previous state  
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-slate-800"
          >
            <Undo2 />
          </Button>
          <Button
            // Enable redo button only if there's a future state available  
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
              <Switch
                checked={isPublishedState}
                onCheckedChange={setIsPublishedState}
              />
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