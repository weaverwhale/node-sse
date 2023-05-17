import { useEffect, useState, useRef } from "react";
import { SSE } from "sse";

// declare outside of app component
// so that it doesn't get redeclared on every render
let openSource = true;
const url = "/stream";
let source = new SSE(url, {
  headers: {
    "Content-Type": "application/json",
  },
  method: "POST",
});

// event listener functions
function messageStreamer(setResponse, responseRef, e) {
  if (!openSource) {
    source.close();
    openSource = true;
    return;
  }

  console.log("Message: ", e.data);
  if (e.data != "[DONE]") {
    let payload = e.data;

    if (payload != "\n") {
      console.log("payload: ", payload);
      responseRef.current += `\n${payload}`;
      setResponse(responseRef.current);
    } else {
      source.close();
    }
  }
}

function readyStateStreamer(setIsLoading, e) {
  if (e.readyState >= 2) {
    setIsLoading(false);
    console.log(source.status);
  }
}

function App() {
  let [response, setResponse] = useState("");
  let [isLoading, setIsLoading] = useState(false);
  let [listenersAttached, setListenersAttached] = useState(false);

  const responseRef = useRef(response);

  useEffect(() => {
    responseRef.current = response;
  }, [response]);

  let handleClearBtnClicked = () => {
    setResponse("");
    setIsLoading(false);
    openSource = false;
  };

  let handleSubmitBtnClicked = async () => {
    openSource = true;
    setIsLoading(true);

    if (!listenersAttached) {
      setListenersAttached(true);
      source.addEventListener(
        "message",
        messageStreamer.bind(event, setResponse, responseRef)
      );
      source.addEventListener(
        "readystatechange",
        readyStateStreamer.bind(event, setIsLoading)
      );
    }

    source.stream();
  };

  return (
    <div>
      <h1>🎉 Streamer</h1>
      <button onClick={handleSubmitBtnClicked}>
        {!isLoading ? "Start Stream" : "Streaming..."}
      </button>
      <button onClick={handleClearBtnClicked}>Clear</button>

      {response === "" ? null : (
        <div>
          <p>Response</p>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
