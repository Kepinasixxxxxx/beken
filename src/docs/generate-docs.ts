import swaggerAutogen from 'swagger-autogen';
import path from 'path';
import fs from 'fs';

const docsDir = __dirname;
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const outputFile = path.join(docsDir, 'swagger-output.json');
const endpointsFiles = [
  path.join(__dirname, '../app.ts'),
];

const doc = {
  info: {
    title: 'VieGuard API Documentation',
    description: 'Interactive API documentation for VieGuard Backend Services (Website, Mobile, and Webhooks)',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Bearer JWT Token',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

console.log('Generating Swagger API Documentation...');

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then((result) => {
  if (result) {
    console.log('✅ OpenAPI specification successfully generated at:', outputFile);
  }
}).catch((err) => {
  console.error('❌ Failed to generate documentation:', err);
});
