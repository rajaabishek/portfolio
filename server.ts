import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

/**netlify start */
  import { render } from '@netlify/angular-runtime/common-engine'

  const commonEngine = new CommonEngine()

  export async function netlifyCommonEngineHandler(request: Request, context: any): Promise<Response> {
    return await render(commonEngine)
  }
  import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
  import { getContext } from '@netlify/angular-runtime/context'

  const angularAppEngine = new AngularAppEngine()

  export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
    const context = getContext()

    const result = await angularAppEngine.handle(request, context)
    return result || new Response('Not found', { status: 404 })
  }

  /**
   * The request handler used by the Angular CLI (dev-server and during build).
   */
  export const reqHandler = createRequestHandler(netlifyAppEngineHandler)
  /**netlify end */


  
// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4500;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
