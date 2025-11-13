# IAMCCS QE Prompt Enhancer

**Visual prompt selector for Qwen Image Edit 2509 and other multimodal models**

<img src="icon.png" width="150" height="150">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Custom ComfyUI node providing a visual button grid interface for quick prompt selection, specifically designed for image editing workflows with Qwen IE 2509 and similar models.

![First image](assets/image_1.png)

**Author**: Carmine Cristallo Scalzi (IAMCCS)
**Website**: [www.carminecristalloscalzi.com](http://www.carminecristalloscalzi.com) | [www.faidenblass.com](http://www.faidenblass.com)
**GitHub**: [www.github.com/IAMCCS](http://www.github.com/IAMCCS)
**Patreon**: [www.patreon.com/IAMCCS](http://www.patreon.com/IAMCCS)
**Repository**: IAMCCS_QE_prompt_enhancer


## Installation

Install it from github in your ComfyUI custom_nodes directory.

Restart ComfyUI to load the node.

## Usage

1. **Add Node**: Search for "IAMCCS QE Prompt Enhancer" in ComfyUI
2. **Select Prompt**: scegli tramite le anteprime (card) oppure dal dropdown `preset_prompt` sincronizzato
3. **Search**: usa il campo "Search prompts..." per filtrare rapidamente le anteprime
4. **Connect**: collega l'uscita al tuo text encoder o ad altri nodi di testo
5. **Append Mode**: puoi combinare prompt selezionato e altri controlli del nodo (es. consistenza, pose)

![2nd image](assets/image_2.png)

## Integration with Qwen Image Edit 2509

This node is specifically designed for Qwen Image Edit 2509 workflows

[Image Input] → [IAMCCS QE Prompt Enhancer] → [Text Encoder] → [Qwen Image Edit 2509]

### Toolbar e controlli rapidi

- Keep selection: evita il reset automatico di selezione card e dropdown dopo l'esecuzione, mantenendo l'ultima scelta.
- Dark previews: anteprime su sfondo nero con icone bianche per un migliore contrasto visivo.
- Clear Selection: cancella la selezione corrente (card evidenziate e valore del dropdown).
- Selected pill: indicatore compatto che appare quando c'è una selezione attiva.
- Maintain consistency: aggiunge una traccia testuale per mantenere coerenza visiva.
- Get pose image 3: aggiunge una traccia testuale per usare la posa dell'immagine 3.
- QwenVL: prompt esclusivo generato lato testo; pensato per l'uso con il modello `qwen_vl`. Un esempio d'uso sarà incluso nei prossimi workflow IAMCCS.

![Third image](assets/image_3.png)

### If my work helped you, and you’d like to say thanks — grab me a coffee ☕

<a href="https://www.buymeacoffee.com/iamccs" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200" />
</a>

### Example Workflow

Further instructions for the workflow example
To load the workflow as intended, you’ll also need to install the IAMCCS_annotate custom node from this repository.

## Credits

**Created by**: Carmine Cristallo Scalzi (IAMCCS)
**For**: ComfyUI
**Designed for**: Qwen Image Edit 2509 workflows
**Websites**:
- [www.carminecristalloscalzi.com](http://www.carminecristalloscalzi.com)
- [www.faidenblass.com](http://www.faidenblass.com)
- [www.github.com/IAMCCS](http://www.github.com/IAMCCS)
- [www.patreon.com/IAMCCS](http://www.patreon.com/IAMCCS)

## License

MIT


### v1.0.0 (2025-10-12)
- Initial release
- JSON configuration support
- SVG icon system


