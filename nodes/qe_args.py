"""
IAMCCS QE Split Node
Splits a multi-line prompt string (as produced by IAMCCS QE PromptEnhancer)
into up to 8 individual STRING outputs, one per variation.

Author: Carmine Cristallo Scalzi (IAMCCS)
Website: www.carminecristalloscalzi.com
         www.faidenblass.com
GitHub: www.github.com/IAMCCS
Patreon: www.patreon.com/IAMCCS
Repository: IAMCCS_QE_prompt_enhancer
"""


class IAMCCS_QeSplit:
    """Splits a newline-separated multi-prompt string into up to 8 individual outputs.

    Connects directly to the 'text' output of IAMCCS QE PromptEnhancer.
    Dataset generator slots carry 8 variations separated by '\\n'.
    Single-line slots (Camera Angles, Style Effects, etc.) populate only
    prompt_1; the remaining outputs return an empty string.
    """

    DISPLAY_NAME = "IAMCCS QE Split"
    CATEGORY = "IAMCCS/Prompt"
    FUNCTION = "split"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "multi_prompt": ("STRING", {"forceInput": True}),
            },
            "optional": {
                # Override separator if needed (default: newline).
                # Use the literal two-char sequence \n in the widget.
                "separator": ("STRING", {
                    "default": "\\n",
                    "multiline": False,
                }),
            },
        }

    RETURN_TYPES = (
        "STRING", "STRING", "STRING", "STRING",
        "STRING", "STRING", "STRING", "STRING",
        "INT",
    )
    RETURN_NAMES = (
        "prompt_1", "prompt_2", "prompt_3", "prompt_4",
        "prompt_5", "prompt_6", "prompt_7", "prompt_8",
        "count",
    )

    def split(self, multi_prompt: str, separator: str = "\\n"):
        # Convert literal \n widget value to real newline
        sep = separator.replace("\\n", "\n")

        # Split and strip each line; discard blank entries
        parts = [p.strip() for p in multi_prompt.split(sep) if p.strip()]

        # Pad to exactly 8 slots (empty string for unused outputs)
        count = len(parts)
        padded = (parts + [""] * 8)[:8]

        return (*padded, count)


NODE_CLASS_MAPPINGS = {
    "IAMCCS_QeSplit": IAMCCS_QeSplit,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "IAMCCS_QeSplit": "IAMCCS QE Split",
}
