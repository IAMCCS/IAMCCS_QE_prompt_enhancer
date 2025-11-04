/**
 * IAMCCS QE Prompt Enhancer - EXACT COPY of easyuse style selector GUI
 *
 * Author: Carmine Cristallo Scalzi (IAMCCS)
 * Website: www.carminecristalloscalzi.com | www.faidenblass.com
 * GitHub: www.github.com/IAMCCS
 * Patreon: www.patreon.com/IAMCCS
 * Repository: IAMCCS_QE_prompt_enhancer
 */

import { app } from "../../scripts/app.js";
import { $el } from "../../scripts/ui.js";

// Load CSS
const styleElement = document.createElement("link");
styleElement.rel = "stylesheet";
styleElement.type = "text/css";
styleElement.href = new URL("qe_prompt_enhancer.css", import.meta.url).href;
document.head.appendChild(styleElement);

/**
 * Create style cards with icon preview
 */
function getStyleCards(prompts, onSelect) {
    let cards = [];

    prompts.forEach((prompt, index) => {
        // Create card with icon/image preview
        const card = $el("div.iamccs-qe-prompt-style-card", {
            dataset: {
                slot: prompt.slot,
                label: prompt.label,
                prompt: prompt.prompt,
                index: index
            },
            onclick: function () {
                // Remove selected from all cards
                this.parentElement.querySelectorAll(".iamccs-qe-prompt-style-card").forEach(el => {
                    el.classList.remove("selected");
                });
                // Add selected to this card
                this.classList.add("selected");
                // Call callback with full prompt
                onSelect(prompt.prompt);
            }
        }, [
            // Image preview area with icon/image support
            createIconPreview(prompt),
            // Label at bottom
            $el("div.iamccs-qe-prompt-style-label", {
                textContent: prompt.label
            })
        ]);

        cards.push(card);
    });

    return cards;
}

/**
 * Create icon preview - supports emoji, SVG, PNG, or URL
 */
function createIconPreview(prompt) {
    const previewDiv = $el("div.iamccs-qe-prompt-style-image");

    if (prompt.icon) {
        // Support local or remote SVG/PNG icons
        if (
            prompt.icon.startsWith("http") ||
            prompt.icon.startsWith("/") ||
            prompt.icon.endsWith(".svg") ||
            prompt.icon.endsWith(".png")
        ) {
            const img = document.createElement("img");
            // Handle relative paths to icons folder
            if (prompt.icon.startsWith("icons/")) {
                // Icons are served via ComfyUI's /extensions endpoint
                // ComfyUI serves: /extensions/{custom_node_name}/web/{file}
                const iconName = prompt.icon.replace("icons/", "");
                img.src = `/extensions/IAMCCS_QE_prompt_enhancer/icons/${iconName}`;
                console.log("[QE Enhancer] Loading icon from /extensions:", img.src);
            } else {
                img.src = prompt.icon;
            }
            img.alt = prompt.label || "icon";
            // CSS now handles sizing (128x128) and filtering (invert)
            previewDiv.appendChild(img);
        }
        // Inline SVG support
        else if (prompt.icon.includes("<svg")) {
            previewDiv.innerHTML = prompt.icon;
        }
        // Emoji or text fallback
        else {
            previewDiv.textContent = prompt.icon;
            previewDiv.style.fontSize = "28px";
            previewDiv.style.display = "flex";
            previewDiv.style.alignItems = "center";
            previewDiv.style.justifyContent = "center";
        }
    } else {
        // Fallback: extract emoji from label
        previewDiv.textContent = getEmojiForPrompt(prompt.label);
        previewDiv.style.fontSize = "28px";
        previewDiv.style.display = "flex";
        previewDiv.style.alignItems = "center";
        previewDiv.style.justifyContent = "center";
    }

    return previewDiv;
}

/**
 * Extract icon from label or use default
 */
function getEmojiForPrompt(label) {
    const iconMatch = label.match(/([\u{1F300}-\u{1F9FF}][\u{FE00}-\u{FE0F}]?)|([\u{2600}-\u{26FF}][\u{FE00}-\u{FE0F}]?)|([\u{2700}-\u{27BF}])|([\u{1F600}-\u{1F64F}])|([\u{1F680}-\u{1F6FF}])|([\u{1F900}-\u{1F9FF}])|[🔄👁️🔀↶↷⬅️➡️⬆️⬇️👀🦅🔭🔍🔃↔️🎥🚶🔁📹🔬📸✏️🖊️🟤⚫🌈✨☀️🎨💥🔥❄️🧹🧴🎭🌙🌅🌇🌧️🌫️☁️🗑️✂️♻️👤🖐️💡🪑👗👔👥🏞️💇😊🤸🌆🔧💍🌟🖌️💨🪞🌑🎞️📼🌈🎪🔆💧🎌🎮🏺📷]/u);
    return iconMatch ? iconMatch[0] : "◈";
}

// Register extension
app.registerExtension({
    name: "IAMCCS.QEPromptEnhancer",

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "IAMCCS_QE_PromptEnhancer") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;

            nodeType.prototype.onNodeCreated = function () {
                const result = onNodeCreated?.apply(this, arguments);
                const node = this;

                const FIXED_WIDTH = 580;
                const FIXED_HEIGHT = 950;
                this.setSize([FIXED_WIDTH, FIXED_HEIGHT]);
                this.resizable = false;

                const presetWidget = this.widgets.find(w => w.name === "preset");
                const maintainConsistencyWidget = this.widgets.find(w => w.name === "maintain_consistency");
                const getPoseWidget = this.widgets.find(w => w.name === "get_pose_image3");
                const promptWidget = this.widgets.find(w => w.name === "selected_prompt");

                if (!promptWidget) {
                    console.error("[QE Enhancer] selected_prompt widget not found!");
                    return result;
                }

                promptWidget.type = "converted-widget";
                promptWidget.computeSize = () => [0, -4];

                let currentPreset = presetWidget ? presetWidget.value : "Camera Angles 📷";
                let isInitializing = true;

                const loadPrompts = async () => {
                    try {
                        const response = await fetch(`/iamccs/qe_prompts/list`);
                        let presets = {};

                        if (response.ok) {
                            const data = await response.json();
                            if (data.presets) {
                                presets = data.presets;
                            } else if (data.prompts) {
                                presets = { "Default": data.prompts };
                            }
                        }

                        if (Object.keys(presets).length === 0) {
                            presets = {
                                "Camera Angles 📷": [
                                    { slot: 1, label: "Back View 🔄", prompt: "View from the back side perspective" },
                                    { slot: 2, label: "Front View 👁️", prompt: "from the front-side perspective" }
                                ],
                                "Style Effects 🎨": [
                                    { slot: 1, label: "Pencil Sketch ✏️", prompt: "pencil sketch, pencil drawing" },
                                    { slot: 2, label: "Line Art 🖊️", prompt: "Change the image into line art" }
                                ],
                                "Scene Changes 🌍": [
                                    { slot: 1, label: "Daytime ☀️", prompt: "Change the scene to day time" },
                                    { slot: 2, label: "Night 🌙", prompt: "Change the scene to night time" }
                                ]
                            };
                        }

                        return presets;
                    } catch (error) {
                        console.error("[QE Enhancer] Failed to load prompts:", error);
                        return {
                            "Camera Angles 📷": [
                                { slot: 1, label: "Back View 🔄", prompt: "View from the back side perspective" }
                            ]
                        };
                    }
                };

                const updateGrid = (presets, presetName, grid, selector) => {
                    const prompts = presets[presetName] || [];
                    grid.innerHTML = "";

                    if (selector && selector.element) {
                        const searchInput = selector.element.querySelector(".search");
                        if (searchInput) searchInput.value = "";
                    }

                    const styleCards = getStyleCards(prompts, (selectedPrompt) => {
                        promptWidget.value = selectedPrompt;
                        console.log("[QE Enhancer] Selected:", selectedPrompt);
                    });

                    grid.append(...styleCards);

                    if (styleCards.length > 0) {
                        setTimeout(() => {
                            styleCards[0].classList.add("selected");
                            promptWidget.value = prompts[0].prompt;
                        }, 50);
                    }
                };

                loadPrompts().then(presets => {
                    const grid = $el("div.iamccs-qe-prompt-styles-list", []);

                    let selector = node.addDOMWidget(
                        "qe_prompt_selector",
                        "btn",
                        $el("div.iamccs-qe-prompt-styles", [
                            $el("div.tools", [
                                $el("button.delete", {
                                    textContent: "Clear Selection",
                                    onclick: () => {
                                        const searchInput = selector.element.querySelector(".search");
                                        if (searchInput) searchInput.value = "";

                                        grid.querySelectorAll(".iamccs-qe-prompt-style-card").forEach(card => {
                                            card.classList.remove("selected");
                                            card.classList.remove("hide");
                                        });

                                        promptWidget.value = "";
                                        console.log("[QE Enhancer] Prompt cleared - output will be empty string");
                                    }
                                }),
                                $el("textarea.search", {
                                    dir: "ltr",
                                    rows: 1,
                                    placeholder: "Search prompts...",
                                    oninput: (e) => {
                                        let value = e.target.value.toLowerCase();
                                        grid.querySelectorAll(".iamccs-qe-prompt-style-card").forEach(card => {
                                            const label = card.dataset.label.toLowerCase();
                                            if (label.indexOf(value) !== -1 || card.classList.contains("selected")) {
                                                card.classList.remove("hide");
                                            } else {
                                                card.classList.add("hide");
                                            }
                                        });
                                    }
                                })
                            ]),
                            grid
                        ])
                    );

                    updateGrid(presets, currentPreset, grid, selector);

                    // Fix preset initialization bug: force refresh on node creation
                    if (isInitializing && currentPreset === "Camera Angles 📷") {
                        setTimeout(() => {
                            updateGrid(presets, currentPreset, grid, selector);
                            console.log("[QE Enhancer] Preset initialization: forced refresh for", currentPreset);
                            isInitializing = false;
                        }, 100);
                    } else {
                        isInitializing = false;
                    }

                    if (presetWidget) {
                        const originalCallback = presetWidget.callback;
                        presetWidget.callback = function (value) {
                            currentPreset = value;
                            updateGrid(presets, currentPreset, grid, selector);
                            if (originalCallback) {
                                originalCallback.apply(this, arguments);
                            }
                        };
                    }
                });

                return result;
            };

            const getExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
            nodeType.prototype.getExtraMenuOptions = function (_, options) {
                if (getExtraMenuOptions) {
                    getExtraMenuOptions.apply(this, arguments);
                }

                options.unshift({
                    content: "Reload Prompts",
                    callback: () => {
                        const pos = [this.pos[0], this.pos[1]];
                        const size = [this.size[0], this.size[1]];
                        app.graph.remove(this);
                        const newNode = LiteGraph.createNode(this.type);
                        newNode.pos = pos;
                        newNode.size = size;
                        app.graph.add(newNode);
                    }
                });
            };
        }
    }
});
