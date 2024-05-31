import { Card, CardContent } from "@/components/ui/card";
import { FunnelPage } from "@prisma/client";
import { ArrowDown, Mail } from "lucide-react";
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { createPortal } from "react-dom";

type Props = {
  funnelPage: FunnelPage;
  index: number; //A number representing the position of the card in a list.
  activePage: boolean; //A boolean indicating if the current page is active.
};

const FunnelStepCard = ({ activePage, funnelPage, index }: Props) => {
  /*
A React portal provides a way to render children into a DOM node that exists outside the hierarchy of the parent 
component. This can be particularly useful for scenarios where you need to render a component that 
visually "breaks out" of its parent container, such as modals, tooltips, or in our   case, 
a draggable item that needs to be rendered in a different part of the DOM.
component outside of its parent container to avoid CSS overflow issues.
    */

  let portal = document.getElementById("blur-page"); //this id is from blur-page.tsx
  // This gets the DOM element with the id blur-page, which is used later for creating a portal.
  //this blur page will be the DOM node where the portal will render its children. 

  return (
    <Draggable
      draggableId={funnelPage.id.toString()} // A unique ID for the draggable item, converted to a string.
      index={index} // The position of the item in the list.
    >
      {/* provided: An object containing props and methods for the draggable item.
            snapshot: An object containing the current state of the draggable item. */}
      {(provided, snapshot) => {
        if (snapshot.isDragging) {
          const offset = { x: 320 };
          //@ts-ignore
          const x = provided.draggableProps.style?.left - offset.x;
          //@ts-ignore
          provided.draggableProps.style = {
            ...provided.draggableProps.style,
            //@ts-ignore
            left: x,
          };
        }
        const component = (
          <Card
            className="p-0 relative cursor-grab my-2"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <CardContent className="p-0 flex items-center gap-4 flex-row">
              <div className="h-14 w-14 bg-muted flex items-center justify-center">
                <Mail />
                <ArrowDown
                  size={18}
                  className="absolute -bottom-2 text-primary"
                />
              </div>
              {funnelPage.name}
            </CardContent>
            {activePage && (
              <div className="w-2 top-2 right-2 h-2 absolute bg-emerald-500 rounded-full" />
            )}
          </Card>
        );
        if (!portal) return component; //If the portal element is not found, it returns the component as is.
        if (snapshot.isDragging) { 
            //createPortal function from react-dom is used to achieve this.
          return createPortal(component, portal); //If the item is being dragged, it renders the component inside the portal using createPortal.
        }
        return component;
      }}
    </Draggable>
  );
};

export default FunnelStepCard;
