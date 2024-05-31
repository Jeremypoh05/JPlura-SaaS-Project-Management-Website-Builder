import React from "react";

type Props = {
  children: React.ReactNode;
};

const BlurPage = ({ children }: Props) => {
  return (
    <div
      className="h-screen overflow-y-scroll backdrop-blur-[35px] dark:bg-muted/40 bg-muted/60 dark:shadow-2xl dark:shadow-black mx-auto pt-20 p-4 absolute top-0 right-0 left-0 bottom-0 z-[11]"
      id="blur-page" //this id will be used later in the funnel-step-card.tsx 
    >
      {children}
    </div>
  );
};

export default BlurPage;
