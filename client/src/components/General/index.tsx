import React, { useState, useEffect } from "react";
import { useMyContext } from "../../MyContextProvider";
import * as ContentfulLib from "contentful";

import * as contentfulManagement from "contentful-management";

const spaceId: string = "o96cnuimdmzy";
const accessToken: string = "BSz66SBo-g-MmMliQDivcJqK0BNBk1WJx2c3Sv41rmc";
const managementToken: string = "CFPAT-f3L0wTtOa6yDBXdWDU5pkuUPVK3Ma9e3tKH1TH11IOA"; // Replace with your Contentful management token

const client = ContentfulLib.createClient({
  space: spaceId,
  accessToken: accessToken,
});

const managementClient = contentfulManagement.createClient({
  accessToken: managementToken,
});

interface ContentfulData {
  items: any[];
}

function General() {

  const [data, setData] = useState<ContentfulData | undefined>();


  function publishEntry() {
    managementClient
      .getSpace(spaceId)
      .then((space) => {
        space.getEnvironment("master").then((environment: any) => {
          environment
            .createEntry("articles", {
              fields: {
                title: { "en-US": "HELLOWW!!!" },
              },
            })
            .then((entry: any) => {
              entry.publish();
            })
            .catch(console.error);
        });
      })
      .catch(console.error);
  }


  useEffect(() => {
    client
      .getEntries<ContentfulData>({
        content_type: "articles", // Adjusted content type to match the one used in createEntry
        limit: 8,
      })
      .then((response: any) => {
        setData(response);
        console.log("response", response);
      })
      .catch(console.error);
  }, []);

  const dataContext = useMyContext();
  const { moduleGeneral, dragEnabled } = dataContext;

  if (!moduleGeneral) {
    return null;
  }

  return (
    <div className={dragEnabled ? "general-enabled" : "general-disabled"}>
      <div className="general-container">
        <div className="general-header">
          <h3>CONTENTFUL DATA</h3>
          <button onClick={publishEntry}>TEST PUT DATA</button>
        </div>
        {data?.items.map((item, index) => (
          <div className="general-item" key={index}>
            <small>TITLE</small>
            <h3>{item.fields.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default General;
