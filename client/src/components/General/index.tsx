import React, { useState, useEffect, Fragment } from "react";
import { useMyContext } from "../../MyContextProvider";
import * as ContentfulLib from "contentful";

const SPACE_ID = "o96cnuimdmzy";
const ACCESS_TOKEN = "BSz66SBo-g-MmMliQDivcJqK0BNBk1WJx2c3Sv41rmc";

const contentfulAPI = `https://cdn.contentful.com/spaces/${SPACE_ID}/entries?access_token=${ACCESS_TOKEN}&${Date.now()}`;

const client = ContentfulLib.createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});


interface ContentfulData {
  items: any[];
}

function General() {
  const [data, setData] = useState<ContentfulData | undefined>();

  useEffect(() => {
    client
      .getEntries({
        content_type: "articles",
        limit: 8,
      })
      .then((response) => {
        setData(response);
        console.log("response", response);
      })
      .catch(console.error);
  }, []);

  const dataContext = useMyContext();
  const { moduleGas, dragEnabled, sizingStatus, draggingStatus } = dataContext;

  if (!moduleGas) {
    return null;
  }

  return (
      <div className={dragEnabled ? "general-enabled" : "general-disabled"}>
        <div className="general-container">
          <div className="general-header">
              <h3>CONTENTFUL DATA</h3>
          </div>
              {data?.items.map((item, index) => (
                <div className="general-item" key={index}>
                  <small>TITLE</small>
                  <h3>{item.fields.title} </h3>
                </div>
              ))}

          </div>
        </div>
  );
}

export default General;
