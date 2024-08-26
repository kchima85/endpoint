run-cli:
	npx ts-node src/index.ts

setup:
	npm install && npm run build && chmod +x dist/index.js && chmod +x src/index.ts && npm link