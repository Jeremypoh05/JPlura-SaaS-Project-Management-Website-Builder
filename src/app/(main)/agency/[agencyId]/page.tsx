import React from "react";

//the page that when users get routed after submit the form of create a new agency.
const Page = ({ params }: { params: { agencyId: string } }) => {
    return <div>{params.agencyId}</div>;
    
};

export default Page;
