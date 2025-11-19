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
        # Build dropdown values that cover ALL presets so the server-side
        # validation accepts any selection while the UI can still filter
        # per-preset. Display is "label | prompt_truncated".
        try:
            presets = cls().load_prompts()
        except Exception:
            presets = {}
        def _truncate_70(s: str) -> str:
            try:
                s = " ".join((s or "").split())
                return s if len(s) <= 70 else s[:70] + "..."
            except Exception:
                return s
        dropdown_values = ["— Select a prompt —"]
        seen = set()
        for group in presets.values():
            if not isinstance(group, list):
                continue
            for it in group:
                label = (it.get('label', '') if isinstance(it, dict) else '')
                prompt = (it.get('prompt', '') if isinstance(it, dict) else '')
                disp = f"{label} | {_truncate_70(prompt)}"
                if disp not in seen:
                    seen.add(disp)
                    dropdown_values.append(disp)

        return {
            "required": {
                # Preset selector (dropdown)
                "preset": (["Camera Angles 📷", "Style Effects 🎨", "Scene Changes 🌍", "Multi-Image Edits 🖼️", "Additional Effects 🎯", "Other amazing prompts 😍", "Travel 🌍", "Cinematic Looks 🎞️"], {
                    "default": "Camera Angles 📷"
                }),
                # Dropdown with names + summaries of prompts (full universe).
                # The web UI narrows visible options per selected preset, but any
                # chosen value remains valid server-side.
                "preset_prompt": (dropdown_values, {"default": "— Select a prompt —"}),
                # Boolean buttons for additional prompts (clickable buttons)
                "maintain_consistency": ("BOOLEAN", {
                    "default": False
                }),
                "get_pose_image3": ("BOOLEAN", {
                    "default": False
                }),
                # Relight toggle (adds Chinese relight prompt)
                "relight": ("BOOLEAN", {
                    "default": False
                }),
                # QwenVL trigger (purple styled in frontend)
                "QwenVL": ("BOOLEAN", {
                    "default": False
                }),
                # This will be controlled by the custom widget
                "selected_prompt": ("STRING", {
                    # Start with empty prompt by default; user must select one manually
                    "default": "",
                    "multiline": True
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "get_prompt"
    CATEGORY = "IAMCCS/Prompt"
    OUTPUT_NODE = False

    def get_prompt(self, preset="Camera Angles 📷", preset_prompt="— Select a prompt —", maintain_consistency=False, get_pose_image3=False, relight=False, QwenVL=False, selected_prompt=""):
        """Return the selected prompt text with optional additions"""
        # The widget will populate selected_prompt with the full prompt text
        # If empty string, keep it empty (Clear Selection was pressed)
        if not selected_prompt or selected_prompt.strip() == "":
            # Try to use dropdown selection if provided
            dropdown_val = (preset_prompt or "").strip()
            # Ignore placeholder
            if dropdown_val and dropdown_val != "— Select a prompt —":
                # If value contains "label | prompt", extract the right-hand side as the actual prompt
                if "|" in dropdown_val:
                    parts = dropdown_val.split("|", 1)
                    final_prompt = parts[1].strip()
                else:
                    final_prompt = dropdown_val
            else:
                # Empty string means no prompt (Clear Selection)
                final_prompt = ""
        else:
            final_prompt = selected_prompt

        # If QwenVL is enabled, output ONLY the QwenVL meta-prompt (exclusive)
        if QwenVL:
            qwen_prompt = (
                "You are professional photographer, write a simple prompt, based on this image and include the following format from your response:\n"
                "character pose+camera angles+environment"
            )
            return (qwen_prompt,)

        # Add consistency prompt if enabled (now independent of base prompt)
        if maintain_consistency:
            if final_prompt:
                final_prompt += " | Maintain the consistency"
            else:
                final_prompt = "Maintain the consistency"

        # Add pose prompt if enabled (can work independently)
        if get_pose_image3:
            if final_prompt:
                final_prompt += " | Get the pose of image 3"
            else:
                final_prompt = "Get the pose of image 3"

        # Add relight prompt if enabled (can work independently)
        if relight:
            if final_prompt:
                final_prompt += " | 重新照明"
            else:
                final_prompt = "重新照明"

        return (final_prompt,)


NODE_CLASS_MAPPINGS = {
    "IAMCCS_QE_PromptEnhancer": IAMCCS_QE_PromptEnhancer,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "IAMCCS_QE_PromptEnhancer": "IAMCCS QE Prompt Enhancer",
}
