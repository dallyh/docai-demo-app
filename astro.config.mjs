// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},
	env: {
		schema: {
			DOCAI_API_KEY: envField.string({ context: "server", access: "secret", optional: false }),
		},
	},
	adapter: node({
		mode: "standalone",
	}),
	integrations: [react()],
});
