"use client";
import MediaComponent from "@/components/media";
import { getMedia } from "@/lib/queries";
import { GetMediaFiles } from "@/lib/types";
import React, { useEffect, useState } from "react";

type Props = {
  //this props actually passed from the index.tsx, then from the funnel-editor-navigation, then from the page.tsx that get the params.
  subaccountId: string; // This prop is necessary because it uniquely identifies the sub-account for which the media files are being fetched. Without this identifier, the application wouldn't know which sub-account's media files to retrieve from the database.
};

const MediaBucketTab = (props: Props) => {
  //Initializes the state variable data with null. The data state will hold the media files fetched from the database.
  const [data, setdata] = useState<GetMediaFiles>(null);

  //when this component renders or mounted, call this useEffect to fetch data.
  useEffect(() => {
    const fetchData = async () => {
      //getMedia function is called with the subaccountId prop.
      //Inside the getMedia function, a database query is performed using db.subAccount.findUnique.
      //The query searches for a subaccount with the given subaccountId and includes its related media files.
      const response = await getMedia(props.subaccountId);
      //Once the data is fetched, the setdata function is called to update the data state with the fetched media files.
      setdata(response);
    };
    fetchData();
  }, [props.subaccountId]);

  return (
    <div className="h-[900px] overflow-auto p-4 custom-scrollbar">
      <MediaComponent data={data} subaccountId={props.subaccountId} />
    </div>
  );
};

export default MediaBucketTab;
