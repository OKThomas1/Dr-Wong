import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';
import * as nodeAdapter from "@sveltejs/adapter-node";
const PROD = false;

const config = {
        kit: {
                adapter: PROD ? nodeAdapter.default({ out: "build" }) : adapter()
	},

	preprocess: [
		preprocess({
			scss: {
				prependData: '@use "src/variables.scss" as *;'
			}
		})
	]
};

export default config;
