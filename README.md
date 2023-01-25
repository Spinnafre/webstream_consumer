## Por que usar webstream sendo que já existem as streams nativas?
 R: Stream que você usa no Node.js são diferentes das streams que você usa no frontend, logo para programar uma aplicação que usa stream em outras plataformas é necessário
 usar as web stream. No próprio Node.js você consegue converter as streams dele para web stream e vice-versa.
 Logo, usamos webstreams para CROSS-PLATAFORM.

## WebStrams
No Node.js as webstreams estão disponíveis tanto em nível global (sem precisar importar) como por meio do módulo ```node:stream/web```
## Pipelines
> *A readable stream can be piped directly to a writable stream, using its **pipeTo()** method, or it can be piped through one or more transform streams first, using its **pipeThrough()** method.*
## Controller
> *Created with the ability to control the state and queue of this stream*

### Referências
- link: https://exploringjs.com/nodejs-shell-scripting/ch_web-streams.html#what-are-web-streams
- link: https://streams.spec.whatwg.org/
- projeto base : https://github.dev/ErickWendel/webstreams-nodejs-and-browser-tutorial/tree/main/preclass/server
