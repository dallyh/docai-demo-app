# Document AI API demo
This is s simple demo utilizing the [ABBYY Document AI API](https://docs.abbyy.com/introduction) [technical preview](https://docs.abbyy.com/technical-preview).

The demo can:
- Extract data from all of the available models
- Convert image to text (JSON)
- Convert documents from one format to another

Demo is available live at [https://docaidemo.daliborhon.dev/](https://docaidemo.daliborhon.dev/). The processing volume is limited to 1k pages at the moment. 

If my pages run out, you can plug in your own API key:
- Download the repo
- Run `pnpm install`
- Set `DOCAI_API_KEY` to your own API key in the `.env` file
- Run the app with `pnpm dev` or build with `pnpm build` and then start with `pnpm start`


