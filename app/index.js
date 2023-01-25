let receivedItems = 0;
let flushedItems = 0;

function parseNDJSON() {
  let rest = "";
  return new TransformStream({
    transform(chunk, controller) {
      rest += chunk;

      const items = rest.split("\n");

      items
        .slice(0, -1)
        .forEach((item) => controller.enqueue(JSON.parse(item))); // adds chunk to the internal queue
      receivedItems++;
      rest = items[items.length - 1];
    },
    // called after all input chunks were transformed successfully
    flush(controller) {
      if (!rest) return;
      flushedItems++;
      controller.enqueue(JSON.parse(rest));
    },
  });
}

function appendToHTML(element) {
  return new WritableStream({
    write(data) {
      const { title, desc, url } = data;
      const template = `              <div class="text">
                <h3>
                 ${title}
                </h3>
                <p>${desc.slice(0, 100)}</p>
                <a href="${url}"> Here's why</a>
              </div>;`;

      element.innerHTML += template;
    },
    abort(reason) {
      console.log("aborted**", reason);
    },
  });
}

async function startConsumeApiStream(signal) {
  const API_URL = "http://localhost:3000";

  //Fetch API possui o body que permite trabalhar com web-streams
  const response = await fetch(API_URL, {
    signal,
  });

  //Enquanto o servidor não encerrar a conexão, ou seja, realizar o res.end(),
  // e ainda estiver processando os chunks no lado do servidor, ele ainda irá continuar
  // enviando dados e o frontend nesse caso ira conseguir pegar esses dados pois o body
  // do fetch é uma readable. Então podemos dizer que funciona como se fosse uma conexão
  // client-server no qual irá ficar aberta por mais tempo que o normal.
  return response.body
    .pipeThrough(new TextDecoderStream()) //A TextDecoderStream converts such data to strings
    .pipeThrough(parseNDJSON());
}

const [startBtn, stopBtn] = ["start", "stop"].map((selector) =>
  document.getElementById(selector)
);

const cardItems = document.querySelector("#cards");

let abortController = new AbortController();

startBtn.addEventListener("click", async () => {
  try {
    const parsedData = await startConsumeApiStream(abortController.signal);

    await parsedData.pipeTo(appendToHTML(cardItems), {
      signal: abortController.signal,
    });
  } catch (error) {
    console.error(error);
    if (!error.message.includes("abort")) throw error;
  }
});

stopBtn.addEventListener("click", async () => {
  console.log("Aborting...");
  abortController.abort();
  abortController = new AbortController();
});
