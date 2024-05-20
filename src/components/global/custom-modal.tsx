import { useModal } from "@/providers/modal-provider";
import React, { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type Props = {
  title: string;
  subHeading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CustomModal = ({ title, subHeading, children, defaultOpen }: Props) => {
  const { isOpen, setClose } = useModal();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      setIsOverflow(contentElement.scrollHeight > contentElement.clientHeight);
    }
  }, [children]);

  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        ref={contentRef}
        className={`md:max-h-[600px] md:h-fit h-screen bg-card ${
          isOverflow ? "overflow-y-scroll" : "overflow-y-auto"
        }`}
      >
        <DialogHeader className="pt-8 text-left ">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>{subHeading}</DialogDescription>
          {children}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
