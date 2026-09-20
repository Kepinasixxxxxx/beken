import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { apiReference } from '@scalar/express-api-reference';
import path from 'path';
import fs from 'fs';

const docsRouter = Router();
const swaggerPath = path.join(__dirname, 'swagger-output.json');

const getSwaggerSpec = () => {
  if (fs.existsSync(swaggerPath)) {
    try {
      return JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    } catch {
      // Fallback if parsing fails
    }
  }
  return {
    openapi: '3.0.0',
    info: {
      title: 'VieGuard API Documentation',
      version: '1.0.0',
      description: 'Please run npm run docs:generate to populate endpoints.',
    },
    paths: {},
  };
};

// Serve raw JSON endpoint
docsRouter.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(getSwaggerSpec());
});

// Serve Classic Swagger UI
docsRouter.use('/api-docs', swaggerUi.serve, (req: any, res: any, next: any) => {
  const spec = getSwaggerSpec();
  swaggerUi.setup(spec)(req, res, next);
});

// Serve Scalar API Reference (Dedoc/Stoplight modern UI)
docsRouter.use(
  '/docs',
  apiReference({
    theme: 'purple',
    spec: {
      content: getSwaggerSpec,
    },
    pageTitle: 'VieGuard API Documentation',
  })
);

export default docsRouter;
