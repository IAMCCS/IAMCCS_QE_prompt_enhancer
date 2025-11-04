"""
IAMCCS QE Prompt Enhancer
Custom ComfyUI node for quick prompt selection with visual button interface

Author: Carmine Cristallo Scalzi (IAMCCS)
Website: www.carminecristalloscalzi.com
         www.faidenblass.com
GitHub: www.github.com/IAMCCS
Patreon: www.patreon.com/IAMCCS
Repository: IAMCCS_QE_prompt_enhancer
"""

import inspect
import sys
import re

# Import nodes
from .nodes.qe_prompt_enhancer import *

NODE_CONFIG = {}

def to_display_name(name):
    """Convert CamelCase to readable display name"""
    # Remove IAMCCS_ prefix for display
    name_without_prefix = name.replace('IAMCCS_', '')
    # Split CamelCase
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', name_without_prefix)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1)
    return f"IAMCCS {s2}"

# Dynamically populate NODE_CONFIG from imported classes
current_module = sys.modules[__name__]
for name, obj in inspect.getmembers(current_module):
    if inspect.isclass(obj):
        module_name = getattr(obj, '__module__', '')
        # Check if the class is defined in one of the modules within the .nodes package
        if module_name.startswith(__name__ + '.nodes'):
            # Basic check for ComfyUI node structure
            is_comfy_node = hasattr(obj, 'INPUT_TYPES') and hasattr(obj, 'FUNCTION') and hasattr(obj, 'CATEGORY')
            if is_comfy_node:
                class_name = obj.__name__
                # Use explicit Node.DISPLAY_NAME if available, otherwise generate one
                display_name = getattr(obj, 'DISPLAY_NAME', None) or to_display_name(class_name)
                NODE_CONFIG[class_name] = {"class": obj, "name": display_name}

def generate_node_mappings(node_config):
    node_class_mappings = {}
    node_display_name_mappings = {}

    for node_name, node_info in node_config.items():
        node_class_mappings[node_name] = node_info["class"]
        node_display_name_mappings[node_name] = node_info.get("name", node_info["class"].__name__)

    return node_class_mappings, node_display_name_mappings

NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS = generate_node_mappings(NODE_CONFIG)

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

WEB_DIRECTORY = "./web"

# Add API routes for prompt loading
try:
    import server
    import json
    import os
    from aiohttp import web

    @server.PromptServer.instance.routes.get("/iamccs/qe_prompts/list")
    async def get_qe_prompts(request):
        """API endpoint to get available prompts with preset support"""
        try:
            prompts_dir = os.path.join(os.path.dirname(__file__), "prompts")
            json_path = os.path.join(prompts_dir, "prompts.json")

            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return web.json_response(data)
            else:
                # Return default presets
                default_presets = {
                    "presets": {
                        "Camera Angles 📷": [
                            {"slot": 1, "label": "Back View 🔄", "prompt": "View from the back side perspective"},
                            {"slot": 2, "label": "Front View 👁️", "prompt": "from the front-side perspective"}
                        ],
                        "Style Effects 🎨": [
                            {"slot": 1, "label": "Pencil Sketch ✏️", "prompt": "pencil sketch, pencil drawing"},
                            {"slot": 2, "label": "Line Art 🖊️", "prompt": "Change the image into line art"}
                        ],
                        "Scene Changes 🌍": [
                            {"slot": 1, "label": "Daytime ☀️", "prompt": "Change the scene to day time"},
                            {"slot": 2, "label": "Night 🌙", "prompt": "Change the scene to night time"}
                        ]
                    }
                }
                return web.json_response(default_presets)
        except Exception as e:
            print(f"[IAMCCS QE] Error loading prompts: {e}")
            return web.json_response({"error": str(e)}, status=500)

    print("[IAMCCS QE] API routes registered")
except Exception as e:
    print(f"[IAMCCS QE] Failed to register API routes: {e}")
