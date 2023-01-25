import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { Readable, Transform, Writable } from "node:stream";
import { setTimeout } from "node:timers/promises";

import csvtojson from "csvtojson";

const PORT = 3000;
createServer(async (req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };

  // The HTTP OPTIONS method is used to request information about the communication options available for the target resource
  // Intended only for use in querying about ways to interact with a resource.
  if (req.method === "OPTIONS") {
    return res.writeHead(204, headers).end();
  }

  const nodeReadable = createReadStream("./server/animeflv.csv");
  // Convert a Node.js stream to a web stream
  const webReadableStream = Readable.toWeb(nodeReadable);

  webReadableStream
    .pipeThrough(Transform.toWeb(csvtojson()))
    .pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          const data = JSON.parse(Buffer.from(chunk));
          console.log("DATA => ", data);
          const sanitalizedData = {
            title: data.title,
            desc: data.description,
            url: data.url_anime,
          };
          //Adds chunk to the TransformStream’s internal queue
          controller.enqueue(JSON.stringify(sanitalizedData).concat("\n"));
        },
      })
    )
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          await setTimeout(1000);
          res.write(chunk);
        },
        close() {
          res.end(); //End connection
        },
      })
    );

  res.writeHead(200, headers);
})
  .listen(PORT)
  .on("listening", (_) => console.log(`Server is listening at ${PORT}`));
