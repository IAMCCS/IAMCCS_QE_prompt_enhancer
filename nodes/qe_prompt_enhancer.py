"""
IAMCCS QE Prompt Enhancer Node
Visual button grid for prompt selection

Author: Carmine Cristallo Scalzi (IAMCCS)
Website: www.carminecristalloscalzi.com
         www.faidenblass.com
GitHub: www.github.com/IAMCCS
Patreon: www.patreon.com/IAMCCS
Repository: IAMCCS_QE_prompt_enhancer
"""

import json
import os


class IAMCCS_QE_PromptEnhancer:
    """Visual button grid prompt selector - Uses DOM widget for UI"""

    def __init__(self):
        self.prompts_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "prompts"
        )
        os.makedirs(self.prompts_dir, exist_ok=True)

    def load_prompts(self):
        """Load prompts from JSON file with preset support"""
        json_path = os.path.join(self.prompts_dir, "prompts.json")

        # Default presets
        default = {
            "Camera Angles 📷": [
                {"slot": 1, "label": "Back View 🔄", "prompt": "View from the back side perspective"},
                {"slot": 2, "label": "Front View 👁️", "prompt": "from the front-side perspective"},
            ],
            "Style Effects 🎨": [
                {"slot": 1, "label": "Pencil Sketch ✏️", "prompt": "pencil sketch, pencil drawing"},
                {"slot": 2, "label": "Line Art 🖊️", "prompt": "Change the image into line art"},
            ],
            "Scene Changes 🌍": [
                {"slot": 1, "label": "Daytime ☀️", "prompt": "Change the scene to day time"},
                {"slot": 2, "label": "Night 🌙", "prompt": "Change the scene to night time"},
            ]
        }

        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Support both old format (prompts array) and new format (presets object)
                    if "presets" in data:
                        return data.get("presets", default)
                    elif "prompts" in data:
                        # Convert old format to new format
                        return {"Default": data.get("prompts", [])}
            except:
                pass

        return default

    @classmethod
    def INPUT_TYPES(cls):
        """Define inputs - we use a hidden STRING to pass selected prompt"""
        return {
            "required": {
                # Preset selector (dropdown)
                "preset": (["Camera Angles 📷", "Style Effects 🎨", "Scene Changes 🌍", "Multi-Image Edits 🖼️", "Additional Effects 🎯", "Other amazing prompts 😍", "Travel 🌍", "Cinematic Looks 🎞️"], {
                    "default": "Camera Angles 📷"
                }),
                # Boolean buttons for additional prompts (clickable buttons)
                "maintain_consistency": ("BOOLEAN", {
                    "default": False
                }),
                "get_pose_image3": ("BOOLEAN", {
                    "default": False
                }),
                # This will be controlled by the custom widget
                "selected_prompt": ("STRING", {
                    "default": "View from the back side perspective",
                    "multiline": True
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "get_prompt"
    CATEGORY = "IAMCCS/Prompt"
    OUTPUT_NODE = False

    def get_prompt(self, preset="Camera Angles 📷", maintain_consistency=False, get_pose_image3=False, selected_prompt=""):
        """Return the selected prompt text with optional additions"""
        # The widget will populate selected_prompt with the full prompt text
        # If empty string, keep it empty (Clear Selection was pressed)
        if not selected_prompt or selected_prompt.strip() == "":
            # Empty string means no prompt (Clear Selection)
            final_prompt = ""
        else:
            final_prompt = selected_prompt

        # Add consistency prompt if enabled (only if there's a base prompt)
        if final_prompt and maintain_consistency:
            final_prompt += " | Maintain the consistency"

        # Add pose prompt if enabled (can work independently)
        if get_pose_image3:
            if final_prompt:
                final_prompt += " | Get the pose of image 3"
            else:
                final_prompt = "Get the pose of image 3"

        return (final_prompt,)


NODE_CLASS_MAPPINGS = {
    "IAMCCS_QE_PromptEnhancer": IAMCCS_QE_PromptEnhancer,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "IAMCCS_QE_PromptEnhancer": "IAMCCS QE Prompt Enhancer",
}
