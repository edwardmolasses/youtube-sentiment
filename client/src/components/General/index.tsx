import React, { useState, useEffect } from "react";
import { useMyContext } from "../../MyContextProvider";
import * as ContentfulLib from "contentful";

import * as contentfulManagement from "contentful-management";

const spaceId: string = "o96cnuimdmzy";
const accessToken: string = "BSz66SBo-g-MmMliQDivcJqK0BNBk1WJx2c3Sv41rmc";
const managementToken: string = "CFPAT-f3L0wTtOa6yDBXdWDU5pkuUPVK3Ma9e3tKH1TH11IOA";

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
  const [publishing, setPublishing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null); // New state for error handling


  function handlePublish() {
    if (inputText.trim() === "") {
      setError("Please enter something before publishing.");
    } else {
      setError(null);
      setPublishing(true);
      publishEntry(inputText);
    }
  }

  function getEntries() {

    client
      .getEntries<ContentfulData>({
        content_type: "articles",
        limit: 8,
      })
      .then((response: any) => {
        setData(response);
        console.log("response", response);
      })
      .catch(console.error);
  }

  function publishEntry(newText: string) {
    managementClient
      .getSpace(spaceId)
      .then((space) => {
        space.getEnvironment("master").then((environment: any) => {
          environment
            .createEntry("articles", {
              fields: {
                title: { "en-US": newText }, 
              },
            })
            .then((entry: any) => {
              entry.publish();
              setTimeout(() => {
                getEntries();
                setPublishing(false);
                setInputText(""); 
              }, 1000);
            })
            .catch(console.error);
          });
        })
        .catch(console.error);
  }

  useEffect(() => {

    getEntries();

    // let timerId: NodeJS.Timeout;

    // timerId = setInterval(() => {
    //   getEntries();
    // }, 30000);

    // return () => clearInterval(timerId);
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
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter something here"
            onFocus={(e) => setError(null)}
          />
          <div className="general-message">
          {error && <div className="error-message">{error}</div>}
          {publishing ? <><i className="fa-duotone fa-spinner-third spin"></i> PUBLISHING</>: !error && <button onClick={handlePublish}>TEST PUT DATA</button>}
          </div>
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
