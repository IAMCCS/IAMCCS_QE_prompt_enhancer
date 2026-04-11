# IAMCCS QE Prompt Enhancer

**Visual prompt selector for Qwen Image Edit 2509, 2511, flux.2 Klein and other image edit models**

<img src="icon.png" width="150" height="150">

![Version](https://img.shields.io/badge/version-1.0.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Custom ComfyUI node providing a visual button grid interface for quick prompt selection, specifically designed for image editing workflows with Qwen IE 2509 and similar models.

![First image](assets/image_1.png)

**Author**: Carmine Cristallo Scalzi (IAMCCS)
**Website**: [www.carminecristalloscalzi.com](http://www.carminecristalloscalzi.com) | [www.faidenblass.com](http://www.faidenblass.com)
**GitHub**: [www.github.com/IAMCCS](http://www.github.com/IAMCCS)
**Patreon**: [www.patreon.com/IAMCCS](http://www.patreon.com/IAMCCS)
**Repository**: IAMCCS_QE_prompt_enhancer

🚀 ## NEW in v1.0.3 (Update)

New preset for dataset creation: Dataset generator 2,3,4,5 - designed for multiline prompt workflows.
Added hide/show button.
Added Character profile to iniect prompt to multiline prompt.

🚀 ## NEW in v1.0.2 (Update)

The IAMCCS QE Prompt Enhancer has a new preset this release: Dataset generator 1, designed for multiline prompt workflows.

🚀 ## NEW in v1.0.1 (Update)

Version 1.0.1 introduces several UI improvements and new presets:

🔧 UI Update

Updated UI with new UI toggles.

Improved toolbar layout and better visual grouping of controls.

New highlight style for selected cards and dropdown sync.

🎥 New Camera Angle Presets

The Preset Camera Angle category now includes new prompt entries designed for CAMERA ANGLES PRESET

### ⚠️ Low VRAM Recommendation

If you're running on a GPU with low VRAM, it is strongly recommended to use the updated Qwen LoRA Loader from IAMCCS_nodes, recently refreshed for v1.0.1 compatibility.
You can install it:

Directly from ComfyUI Manager, or

From the GitHub repo: www.github.com/IAMCCS/IAMCCS_nodes

This ensures smoother LoRA injection and prevents VRAM overflow when using Qwen models.

## Installation

Install it from github in your ComfyUI custom_nodes directory.

Restart ComfyUI to load the node.

## Usage

Usage

Add the Node: Search for “IAMCCS QE Prompt Enhancer” in ComfyUI.
Select Prompt: Click the preview cards or use the synchronized preset_prompt dropdown.
Search: Use Search prompts… to instantly filter the grid.
Connect: Link the output to your text encoder or any text-based node.
Append Mode: Combine the selected prompt with other node settings (consistency, pose, relight, QwenVL modes).

![2nd image](assets/image_2.png)

## Integration with Qwen Image Edit 2509

This node is specifically designed for Qwen Image Edit 2509 workflows

[Image Input] → [IAMCCS QE Prompt Enhancer] → [Text Encoder] → [Qwen Image Edit 2509]

### Toolbar e controlli rapidi

Keep selection: Prevents automatic reset after each execution.
Dark previews: Black-background thumbnails with white icons for clearer visibility.
Clear Selection: Removes dropdown and card highlight.
Selected pill: Small floating pill showing the active preset.
Maintain consistency: Adds text to stabilize visual coherence.
Get pose (image 3): Injects pose-based prompt from the third input image.
QwenVL mode: Generates exclusive text-side prompts designed for qwen_vl.
A full workflow example will be included in upcoming IAMCCS releases.

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


