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
                // Call callback with the entire prompt object
                onSelect(prompt);
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
                // Cache-bust query param using slot + date so new SVGs show immediately
                const iconName = prompt.icon.replace("icons/", "");
                const versionTag = (prompt.slot ? `v=${prompt.slot}-${new Date().getFullYear()}${(new Date().getMonth()+1)}${new Date().getDate()}` : "v=1");
                img.src = `/extensions/IAMCCS_QE_prompt_enhancer/icons/${iconName}?${versionTag}`;
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
                const FIXED_HEIGHT = 920;
                this.setSize([FIXED_WIDTH, FIXED_HEIGHT]);
                this.resizable = false;

                const presetWidget = this.widgets.find(w => w.name === "preset");
                const dropdownWidget = this.widgets.find(w => w.name === "preset_prompt");
                const maintainConsistencyWidget = this.widgets.find(w => w.name === "maintain_consistency");
                const getPoseWidget = this.widgets.find(w => w.name === "get_pose_image3");
                const relightWidget = this.widgets.find(w => w.name === "relight");
                const qwenVLWidget = this.widgets.find(w => w.name === "QwenVL");
                const promptWidget = this.widgets.find(w => w.name === "selected_prompt");

                if (!promptWidget) {
                    console.error("[QE Enhancer] selected_prompt widget not found!");
                    return result;
                }

                // Hide header widgets we mirror inside padding tools
                const hideHeaderWidget = (w) => {
                    if (!w) return;
                    w.type = "converted-widget";
                    w.computeSize = () => [0, -4];
                };
                hideHeaderWidget(promptWidget);
                // Fully hide maintain_consistency header widget (use toggle in padding)
                if (maintainConsistencyWidget) {
                    try {
                        maintainConsistencyWidget.hidden = true;
                        maintainConsistencyWidget.type = "converted-widget";
                        maintainConsistencyWidget.draw = () => {};
                        maintainConsistencyWidget.computeSize = () => [0, -4];
                    } catch {}
                }
                // Ensure the preset_prompt header widget remains visible and functional
                if (dropdownWidget) {
                    try {
                        dropdownWidget.hidden = false;
                        // Remove any previous overrides that hid it
                        if (dropdownWidget.draw && dropdownWidget.draw.toString && dropdownWidget.draw.toString().includes('=> {}')) {
                            delete dropdownWidget.draw;
                        }
                        if (dropdownWidget.computeSize && dropdownWidget.computeSize.toString && dropdownWidget.computeSize.toString().includes('[0, -4]')) {
                            delete dropdownWidget.computeSize;
                        }
                    } catch {}
                }
                // Fully hide get_pose_image3 header widget (use toggle in padding)
                if (getPoseWidget) {
                    try {
                        getPoseWidget.hidden = true;
                        getPoseWidget.type = "converted-widget";
                        getPoseWidget.draw = () => {};
                        getPoseWidget.computeSize = () => [0, -4];
                    } catch {}
                }
                // Hide relight header widget but preserve original type for proper serialization
                if (relightWidget) {
                    try {
                        relightWidget.hidden = true;
                        relightWidget.draw = () => {};
                        relightWidget.computeSize = () => [0, -4];
                    } catch {}
                }
                // Hide QwenVL header widget completely (no space, no draw)
                if (qwenVLWidget) {
                    try {
                        qwenVLWidget.hidden = true;
                        qwenVLWidget.type = "converted-widget";
                        qwenVLWidget.draw = () => {};
                        qwenVLWidget.computeSize = () => [0, -4];
                    } catch {}
                }

                const DEFAULT_PRESET = "Camera Angles 📷";
                let currentPreset = DEFAULT_PRESET;
                if (presetWidget && presetWidget.value !== DEFAULT_PRESET) {
                    try { presetWidget.value = DEFAULT_PRESET; } catch {}
                }
                let isInitializing = true;
                const PLACEHOLDER = "— Select a prompt —";

                // Removed custom purple styling to ensure widget visibility across themes

                // Helpers for dropdown display formatting and full prompt mapping
                const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();
                const truncatePrompt = (s, max = 70) => {
                    const t = normalize(s);
                    return t.length > max ? t.slice(0, max) + "..." : t;
                };

                // Format dropdown entry without adding any new parentheses
                const formatDropdownEntry = (obj) => {
                    return `${obj.label} | ${truncatePrompt(obj.prompt)}`;
                };

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

                    const styleCards = getStyleCards(prompts, (pObj) => {
                        // Set selected prompt only when user explicitly clicks a card
                        promptWidget.value = pObj.prompt;
                        console.log("[QE Enhancer] Selected:", pObj.prompt);
                        // Sync dropdown selection to match the clicked card
                        if (dropdownWidget) {
                            const combined = formatDropdownEntry(pObj);
                            dropdownWidget.value = combined;
                            dropdownWidget.callback?.call(dropdownWidget, combined);
                        }
                        setSelectedPill(true);
                    });

                    grid.append(...styleCards);
                    // After rebuilding, re-apply dark previews if enabled
                    try { applyDarkPreviews(!!node._qeDarkPreviews, grid); } catch {}

                    // Do NOT auto-select first card: leave all unselected until user chooses
                    promptWidget.value = ""; // ensure cleared on preset change / initial load
                    // Clear dropdown selection
                    if (dropdownWidget) {
                        dropdownWidget.value = PLACEHOLDER;
                    }
                };

                // Helper: apply dark preview mode styles
                const applyDarkPreviews = (enabled, gridEl) => {
                    if (!gridEl) return;
                    gridEl.querySelectorAll(".iamccs-qe-prompt-style-image").forEach(area => {
                        area.style.backgroundColor = enabled ? "#000" : "";
                        // IMG icons
                        const img = area.querySelector("img");
                        if (img) {
                            img.style.filter = enabled ? "invert(1) grayscale(1) brightness(2)" : "";
                        }
                        // Emoji/text fallback
                        if (!img) {
                            area.style.color = enabled ? "#fff" : "";
                        }
                    });
                };

                const buildDropdownValues = (presetsMap, presetName) => {
                    const list = presetsMap[presetName] || [];
                    const values = [PLACEHOLDER, ...list.map(p => formatDropdownEntry(p))];
                    const map = {};
                    list.forEach(p => { map[formatDropdownEntry(p)] = p.prompt; });
                    return { values, map };
                };

                const updateDropdown = (presetsMap, presetName, widget, presetChanged = false) => {
                    if (!widget) return;
                    const { values, map } = buildDropdownValues(presetsMap, presetName);
                    widget.options = widget.options || {};
                    widget.options.values = values;
                    // When preset changes or current value isn't valid, reset to placeholder and notify
                    if (presetChanged || !values.includes(widget.value)) {
                        widget.value = PLACEHOLDER;
                        try { widget.callback?.call(widget, PLACEHOLDER); } catch {}
                    }
                    // Save mapping for full prompt restoration
                    node._qeDropdownMap = map;
                    // Force redraw if possible
                    try { app.canvas?.setDirty(true, true); } catch {}
                };

                loadPrompts().then(presets => {
                    const grid = $el("div.iamccs-qe-prompt-styles-list", []);

                    let selector = node.addDOMWidget(
                        "qe_prompt_selector",
                        "btn",
                        $el("div.iamccs-qe-prompt-styles", [
                            // Row 1: toggles
                            $el("div.tools.row1", {
                                style: { display: "flex", flexWrap: "wrap", gap: "2px", alignItems: "center", marginBottom: "6px" }
                            }, [
                                // Toggle: keep selection after execution
                                $el("label", { className: "qe-toggle keep", style: { display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "11px" } }, [
                                    $el("input", {
                                        type: "checkbox",
                                        onchange: (e) => { node._qePersistSelection = !!e.target.checked; }
                                    }),
                                    $el("span", { textContent: "KeepSel" })
                                ]),
                                $el("span", { textContent: "|", style: { opacity: 0.6, margin: "0 0px" } }),
                                // Toggle: dark preview mode
                                $el("label", { className: "qe-toggle dark", style: { display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "11px" } }, [
                                    $el("input", {
                                        type: "checkbox",
                                        onchange: (e) => { node._qeDarkPreviews = !!e.target.checked; try { applyDarkPreviews(node._qeDarkPreviews, grid); } catch {} }
                                    }),
                                    $el("span", { textContent: "DarkUI" })
                                ]),
                                $el("span", { textContent: "|", style: { opacity: 0.6, margin: "0 0px" } }),
                                // Toggle: maintain consistency (mirrors header widget)
                                $el("label", { className: "qe-toggle consistency", style: { display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "11px" } }, [
                                    $el("input", {
                                        type: "checkbox",
                                        checked: !!(maintainConsistencyWidget?.value),
                                        onchange: (e) => {
                                            if (maintainConsistencyWidget) {
                                                maintainConsistencyWidget.value = !!e.target.checked;
                                                maintainConsistencyWidget.callback?.call(maintainConsistencyWidget, maintainConsistencyWidget.value);
                                            }
                                        }
                                    }),
                                    $el("span", { textContent: "Consistency" })
                                ]),
                                $el("span", { textContent: "|", style: { opacity: 0.6, margin: "0 0px" } }),
                                // Toggle: get pose image 3 (mirrors header widget)
                                $el("label", { className: "qe-toggle pose", style: { display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "11px" } }, [
                                    $el("input", {
                                        type: "checkbox",
                                        checked: !!(getPoseWidget?.value),
                                        onchange: (e) => {
                                            if (getPoseWidget) {
                                                getPoseWidget.value = !!e.target.checked;
                                                getPoseWidget.callback?.call(getPoseWidget, getPoseWidget.value);
                                            }
                                        }
                                    }),
                                    $el("span", { textContent: "GetPoseImg3" })
                                ]),
                                $el("span", { textContent: "|", style: { opacity: 0.6, margin: "0 0px" } }),
                                // Toggle: Relight (mirrors header widget; adds 重新照明)
                                $el("label", { className: "qe-toggle relight", style: { display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "11px" } }, [
                                    $el("input", {
                                        type: "checkbox",
                                        checked: !!(relightWidget?.value),
                                        onchange: (e) => {
                                            const checked = !!e.target.checked;
                                            if (relightWidget) {
                                                relightWidget.value = checked;
                                                relightWidget.callback?.call(relightWidget, relightWidget.value);
                                            }
                                            // Frontend preview injection so user sees the appended relight text before execution
                                            if (checked) {
                                                if (promptWidget.value) {
                                                    if (!/重新照明/.test(promptWidget.value)) {
                                                        promptWidget.value += " | 重新照明";
                                                    }
                                                } else {
                                                    promptWidget.value = "重新照明";
                                                }
                                            } else {
                                                // Remove the relight suffix for preview only
                                                if (promptWidget.value) {
                                                    promptWidget.value = promptWidget.value
                                                        .replace(/\s*\|\s*重新照明/g, "")
                                                        .replace(/^重新照明$/,"" );
                                                }
                                            }
                                        }
                                    }),
                                    $el("span", { textContent: "Relight" })
                                ]),
                                $el("span", { textContent: "|", style: { opacity: 0.6, margin: "0 0px" } }),
                                // Toggle: Qwen VL (mirrors header widget)
                                $el("label", { className: "qe-toggle qwenvl", style: { display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "11px", color: "#a371f7" } }, [
                                    $el("input", {
                                        type: "checkbox",
                                        checked: !!(qwenVLWidget?.value),
                                        onchange: (e) => {
                                            if (qwenVLWidget) {
                                                qwenVLWidget.value = !!e.target.checked;
                                                qwenVLWidget.callback?.call(qwenVLWidget, qwenVLWidget.value);
                                            }
                                        }
                                    }),
                                    $el("span", { textContent: "QwenVL" })
                                ])
                            ]),
                            // Row 2: clear + search
                            $el("div.tools.row2", { style: { display: "flex", gap: "4px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" } }, [
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
                                        if (dropdownWidget) {
                                            dropdownWidget.value = PLACEHOLDER;
                                            dropdownWidget.callback?.call(dropdownWidget, PLACEHOLDER);
                                        }
                                        console.log("[QE Enhancer] Prompt cleared - output will be empty string");
                                    }
                                }),
                                $el("span", { textContent: "|", style: { opacity: 0.6, margin: "0 2px" } }),
                                $el("input.search", {
                                    type: "text",
                                    dir: "ltr",
                                    placeholder: "Search prompts...",
                                    style: { width: "260px", whiteSpace: "nowrap" },
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

                    // Compact UI: no pills used
                    const setSelectedPill = () => {};
                    const setPresetPill = () => {};

                    // Prepare dropdown widget UI/behavior
                    if (dropdownWidget) {
                        // Force the widget to behave as a dropdown combo, even if defined as STRING in Python
                        dropdownWidget.type = "combo";
                        // Initial options for default preset
                        updateDropdown(presets, currentPreset, dropdownWidget, true);
                        const originalDropdownCallback = dropdownWidget.callback;
                        dropdownWidget.callback = function (value) {
                            // Ignore placeholder
                            if (value === PLACEHOLDER) {
                                // Clear selection state in grid and prompt value
                                grid.querySelectorAll(".iamccs-qe-prompt-style-card").forEach(card => card.classList.remove("selected"));
                                promptWidget.value = "";
                                setSelectedPill(false);
                            } else {
                                // Restore the FULL prompt using the map; fallback to parsing
                                let finalPrompt = (node._qeDropdownMap && node._qeDropdownMap[value]) || (value.includes("|") ? value.split("|").slice(1).join("|").trim() : value);
                                // If the RHS is wrapped in parentheses, strip them
                                if (finalPrompt.startsWith("(") && finalPrompt.endsWith(")")) {
                                    finalPrompt = finalPrompt.slice(1, -1);
                                }
                                promptWidget.value = finalPrompt;
                                // Highlight matching card
                                grid.querySelectorAll(".iamccs-qe-prompt-style-card").forEach(card => {
                                    if (card.dataset.prompt === finalPrompt) card.classList.add("selected");
                                    else card.classList.remove("selected");
                                });
                                setSelectedPill(true);
                            }
                            if (originalDropdownCallback) originalDropdownCallback.apply(this, arguments);
                        };
                    }

                    updateGrid(presets, currentPreset, grid, selector);
                    // Apply dark previews if toggle is on (initial false)
                    try { applyDarkPreviews(!!node._qeDarkPreviews, grid); } catch {}
                    // Ensure dropdown shows placeholder on first load
                    try {
                        if (dropdownWidget) {
                            dropdownWidget.value = PLACEHOLDER;
                            dropdownWidget.callback?.call(dropdownWidget, PLACEHOLDER);
                        }
                    } catch {}
                    // Expose references for later reset (after execution)
                    node._qeGrid = grid;
                    node._qePromptWidget = promptWidget;
                    node._qeDropdownWidget = dropdownWidget;

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
                            updateDropdown(presets, currentPreset, dropdownWidget, true);
                            // Re-apply dark previews on grid rebuild if enabled
                            try { applyDarkPreviews(!!node._qeDarkPreviews, grid); } catch {}
                            if (originalCallback) {
                                originalCallback.apply(this, arguments);
                            }
                        };
                    }

                    // QwenVL exclusivity UX: when enabled, clear any current selection and dropdown
                    if (qwenVLWidget) {
                        const originalQwenCB = qwenVLWidget.callback;
                        qwenVLWidget.callback = function(value) {
                            if (value === true) {
                                try {
                                    // Clear grid selection
                                    grid.querySelectorAll(".iamccs-qe-prompt-style-card").forEach(card => card.classList.remove("selected"));
                                    // Reset dropdown to placeholder and trigger its callback for UI sync
                                    if (dropdownWidget) {
                                        dropdownWidget.value = PLACEHOLDER;
                                        dropdownWidget.callback?.call(dropdownWidget, PLACEHOLDER);
                                    }
                                    // Clear prompt widget value so backend will emit only QwenVL text
                                    promptWidget.value = "";
                                    setSelectedPill(false);
                                } catch (e) {
                                    console.warn("[QE Enhancer] Failed to apply QwenVL exclusivity reset", e);
                                }
                            }
                            if (originalQwenCB) originalQwenCB.apply(this, arguments);
                        };
                    }

                    // Clear prompt after node execution (reset for next generation)
                    const originalOnExecuted = node.onExecuted;
                    node.onExecuted = function() {
                        // Call any existing handler first
                        if (originalOnExecuted) {
                            originalOnExecuted.apply(this, arguments);
                        }
                        try {
                            const keep = !!this._qePersistSelection;
                            if (!keep) {
                                if (this._qePromptWidget) {
                                    this._qePromptWidget.value = "";
                                }
                                if (this._qeGrid) {
                                    this._qeGrid.querySelectorAll(".iamccs-qe-prompt-style-card").forEach(card => {
                                        card.classList.remove("selected");
                                    });
                                }
                                if (this._qeDropdownWidget) {
                                    this._qeDropdownWidget.value = PLACEHOLDER;
                                }
                                setSelectedPill(false);
                            }
                            console.log("[QE Enhancer] Prompt auto-reset after execution");
                        } catch (e) {
                            console.warn("[QE Enhancer] Failed to auto-reset after execution", e);
                        }
                    };
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
