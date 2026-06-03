import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.test.ts"], // !core: find all test files
        environment: "node", // !important: ProgressBar uses process.stdout
        globals: true, // !convenience: describe/it without imports

        // !quality: coverage config
        coverage: {
            provider: "v8", // !accurate: Node's built-in coverage
            reporter: ["text", "json", "html"], // !output formats
            exclude: ["node_modules/", "dist/"], // !ignore build artifacts
            thresholds: {
                // !guard: fail if coverage drops
                lines: 80,
                branches: 75,
                functions: 80,
                statements: 80,
            },
        },
    },
});
