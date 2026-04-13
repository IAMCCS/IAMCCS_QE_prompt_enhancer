"""
IAMCCS Qwen Multi-Gen Node
Generates up to 8 images in a single workflow execution by looping over the
multiline prompt variants produced by IAMCCS QE PromptEnhancer.

Requirements:
  - MODEL  : already patched (LoRA×N, TorchCompile, ModelSamplingAuraFlow, CFGNorm)
  - IMAGE  : pre-scaled (FluxKontextImageScale output)
  - Negative: empty prompt + same source image (shared, computed once)
  - Seed   : each iteration uses seed+i for reproducible, independent noise

Author : Carmine Cristallo Scalzi (IAMCCS)
Website: www.carminecristalloscalzi.com / www.faidenblass.com
GitHub : www.github.com/IAMCCS
Patreon: www.patreon.com/IAMCCS
"""

import math
import os
import re

import numpy as np
import torch
from PIL import Image as _PILImage

import comfy.sample
import comfy.samplers
import comfy.utils
import folder_paths
import latent_preview
import node_helpers


# ── internal helpers ───────────────────────────────────────────────────────────

def _encode_qwen(clip, vae, image, prompt: str):
    """Mirror TextEncodeQwenImageEditPlus.execute() for a single image + prompt."""
    llama_template = (
        "<|im_start|>system\n"
        "Describe the key features of the input image (color, shape, size, "
        "texture, objects, background), then explain how the user's text "
        "instruction should alter or modify the image. Generate a new image "
        "that meets the user's requirements while maintaining consistency with "
        "the original input where appropriate.<|im_end|>\n"
        "<|im_start|>user\n{}<|im_end|>\n"
        "<|im_start|>assistant\n"
    )

    ref_latents = []
    images_vl = []
    image_prompt = ""

    if image is not None:
        samples = image.movedim(-1, 1)  # [B, C, H, W]

        # VL thumbnail ~384×384 for vision tokens
        total_vl = int(384 * 384)
        scale_vl = math.sqrt(total_vl / (samples.shape[3] * samples.shape[2]))
        w_vl = round(samples.shape[3] * scale_vl)
        h_vl = round(samples.shape[2] * scale_vl)
        s_vl = comfy.utils.common_upscale(samples, w_vl, h_vl, "area", "disabled")
        images_vl.append(s_vl.movedim(1, -1))

        # Reference latent ~1024×1024 (multiples of 8) stored in conditioning
        if vae is not None:
            total_lat = int(1024 * 1024)
            scale_lat = math.sqrt(total_lat / (samples.shape[3] * samples.shape[2]))
            w_lat = round(samples.shape[3] * scale_lat / 8.0) * 8
            h_lat = round(samples.shape[2] * scale_lat / 8.0) * 8
            s_lat = comfy.utils.common_upscale(samples, w_lat, h_lat, "area", "disabled")
            ref_latents.append(vae.encode(s_lat.movedim(1, -1)[:, :, :, :3]))

        image_prompt = "Picture 1: <|vision_start|><|image_pad|><|vision_end|>"

    tokens = clip.tokenize(
        image_prompt + prompt,
        images=images_vl,
        llama_template=llama_template,
    )
    cond = clip.encode_from_tokens_scheduled(tokens)

    if ref_latents:
        cond = node_helpers.conditioning_set_values(
            cond, {"reference_latents": ref_latents}, append=True
        )
    return cond


def _apply_ref_method(cond, method: str):
    """Mirror FluxKontextMultiReferenceLatentMethod.execute()."""
    if "uxo" in method or "uso" in method:
        method = "uxo"
    return node_helpers.conditioning_set_values(
        cond, {"reference_latents_method": method}
    )


def _prompt_to_slug(prompt: str, max_words: int = 5) -> str:
    """First max_words meaningful words → safe filename fragment (no <sks> token)."""
    text = re.sub(r"<[^>]+>", "", prompt).strip()
    words = [re.sub(r"[^a-zA-Z0-9]", "", w) for w in text.split()[:max_words] if w]
    filtered = [w for w in words if w]
    return "_".join(filtered) if filtered else "prompt"


def _unique_png_path(output_dir: str, prefix: str) -> str:
    """Return a path that does not already exist, appending a counter if needed."""
    counter = 1
    while True:
        path = os.path.join(output_dir, f"{prefix}_{counter:05d}.png")
        if not os.path.exists(path):
            return path
        counter += 1


# ── node ───────────────────────────────────────────────────────────────────────

class IAMCCS_QwenMultiGen:
    """Generates up to 8 images from multi-line prompt variants in a single run.

    Connect IAMCCS QE PromptEnhancer (or any STRING with newline-separated
    variants) to multi_prompt.  Each line becomes one Qwen generation pass.

    • MODEL  — already patched (LoRA×N → TorchCompile → ModelSamplingAuraFlow
                → CFGNorm).  TorchCompile executes only once across all passes.
    • IMAGE  — FluxKontextImageScale output (source reference image).
    • Negative — empty prompt + same source image, shared across all passes.
    • Seed   — each pass uses seed+i so images are independent but reproducible.
    • Output — IMAGE batch ready for SaveImage / preview; files are also written
               to the ComfyUI output folder with per-prompt filename prefixes.
    """

    DISPLAY_NAME = "IAMCCS Qwen Multi-Gen"
    CATEGORY = "IAMCCS/Qwen"
    FUNCTION = "generate"

    RETURN_TYPES = ("IMAGE", "INT")
    RETURN_NAMES = ("images",  "count")

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model":        ("MODEL",),
                "clip":         ("CLIP",),
                "vae":          ("VAE",),
                "image":        ("IMAGE",),
                "multi_prompt": ("STRING", {"forceInput": True}),
                "seed": ("INT", {
                    "default": 0,
                    "min": 0,
                    "max": 0xFFFFFFFFFFFFFFFF,
                }),
                "steps": ("INT", {"default": 4, "min": 1, "max": 100}),
                "cfg": ("FLOAT", {
                    "default": 1.0, "min": 0.0, "max": 100.0, "step": 0.01,
                }),
                "sampler_name": (comfy.samplers.KSampler.SAMPLERS,),
                "scheduler":    (comfy.samplers.KSampler.SCHEDULERS,),
                "denoise": ("FLOAT", {
                    "default": 1.0, "min": 0.0, "max": 1.0, "step": 0.01,
                }),
            },
            "optional": {
                "separator": ("STRING", {
                    "default": "\\n",
                    "multiline": False,
                }),
                "reference_latents_method": (
                    ["index_timestep_zero", "offset", "index", "uxo/uno"],
                    {"default": "index_timestep_zero"},
                ),
                "output_prefix": ("STRING", {"default": "qwen_multi"}),
                "save_images":   ("BOOLEAN", {"default": True}),
            },
        }

    def generate(
        self,
        model, clip, vae, image, multi_prompt,
        seed, steps, cfg, sampler_name, scheduler, denoise=1.0,
        separator="\\n",
        reference_latents_method="index_timestep_zero",
        output_prefix="qwen_multi",
        save_images=True,
    ):
        sep = separator.replace("\\n", "\n")
        prompts = [p.strip() for p in multi_prompt.split(sep) if p.strip()]

        if not prompts:
            blank = torch.zeros((1, image.shape[1], image.shape[2], 3))
            return (blank, 0)

        # ── shared pre-computation (done once, reused every iteration) ─────────

        # Negative: empty prompt + source image
        neg_cond = _encode_qwen(clip, vae, image, "")
        neg_cond = _apply_ref_method(neg_cond, reference_latents_method)

        # vae.encode() returns the raw latent tensor directly.
        # fix_empty_latent_channels is for EMPTY (zero) latents only — do NOT
        # call it here or WanVAE (video VAE) will unsqueeze a T-dim and corrupt
        # the decode output.
        latent_base = vae.encode(image[:, :, :, :3])

        output_dir = folder_paths.get_output_directory() if save_images else None
        results = []

        # ── per-prompt loop ────────────────────────────────────────────────────
        for i, prompt in enumerate(prompts):

            # Positive conditioning for this variant
            pos_cond = _encode_qwen(clip, vae, image, prompt)
            pos_cond = _apply_ref_method(pos_cond, reference_latents_method)

            # Independent reproducible noise per iteration
            noise = comfy.sample.prepare_noise(latent_base, seed + i, None)

            # Sample (mirrors standard KSampler node behaviour)
            callback = latent_preview.prepare_callback(model, steps)
            samples = comfy.sample.sample(
                model, noise, steps, cfg,
                sampler_name, scheduler,
                pos_cond, neg_cond, latent_base,
                denoise=denoise,
                callback=callback,
                disable_pbar=False,
                seed=seed + i,
            )

            # Decode → [B, H, W, C] on CPU.
            # Mirror VAEDecode: WanVAE (video VAE) returns 5D [B,T,H,W,C] —
            # reshape to [B*T, H, W, C] so decoded[0] is always 3D [H, W, C].
            decoded = vae.decode(samples)
            if decoded.ndim == 5:
                decoded = decoded.reshape(-1, decoded.shape[-3], decoded.shape[-2], decoded.shape[-1])
            decoded = decoded.cpu()
            results.append(decoded)

            # Save with prompt-derived filename prefix
            if save_images and output_dir is not None:
                slug   = _prompt_to_slug(prompt)
                prefix = f"{output_prefix}_{slug}"
                path   = _unique_png_path(output_dir, prefix)
                arr    = (decoded[0].numpy() * 255).clip(0, 255).astype(np.uint8)
                _PILImage.fromarray(arr).save(path)

        images_out = torch.cat(results, dim=0)
        return (images_out, len(prompts))
