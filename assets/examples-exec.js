// CalcPlot Examples Execution Engine & Navigation

// Update toggle arrow based on expanded state
function updateToggleArrow(categoryId, isExpanded) {
    const toggle = document.getElementById(`toggle-${categoryId}`);
    if (toggle) {
        if (isExpanded) {
            toggle.classList.add('expanded');
            toggle.textContent = '▲';
        } else {
            toggle.classList.remove('expanded');
            toggle.textContent = '▼';
        }
    }
}

// Toggle category visibility
let activeCategory = null;

// Navigation functionality
function toggleCategory(categoryId) {
    const examples = document.getElementById(`examples-${categoryId}`);
    
    // If clicking on already active category, don't hide it
    if (activeCategory === categoryId && examples.classList.contains('expanded')) {
        return;
    }
    
    // Close all other categories first
    document.querySelectorAll('.nav-category').forEach(cat => {
        const otherCategoryId = cat.querySelector('.nav-examples').id.replace('examples-', '');
        if (otherCategoryId !== categoryId) {
            const otherExamples = document.getElementById(`examples-${otherCategoryId}`);
            otherExamples.classList.remove('expanded');
            updateToggleArrow(otherCategoryId, false);
            hideCategoryExamples(otherCategoryId);
        }
    });
    
    // Toggle current category
    if (examples.classList.contains('expanded')) {
        examples.classList.remove('expanded');
        updateToggleArrow(categoryId, false);
        hideCategoryExamples(categoryId);
        activeCategory = null;
    } else {
        examples.classList.add('expanded');
        updateToggleArrow(categoryId, true);
        showCategoryExamples(categoryId);
        activeCategory = categoryId;
    }
}

function showCategoryExamples(categoryId) {
    // Hide all category groups first
    document.querySelectorAll('.category-group').forEach(group => {
        group.style.display = 'none';
    });
    
    // Show the target category group
    const targetGroup = document.getElementById(`category-${categoryId}`);
    if (targetGroup) {
        targetGroup.style.display = 'block';
    }
    
    // Force resize of all CalcPlot containers in the visible category
    setTimeout(() => {
        targetGroup.querySelectorAll('.calcplot-container').forEach(container => {
            // Trigger resize event for any charts inside
            const resizeEvent = new Event('resize');
            container.dispatchEvent(resizeEvent);
            
            // Also resize any SVG or canvas elements
            container.querySelectorAll('svg, canvas').forEach(element => {
                element.dispatchEvent(resizeEvent);
            });
        });
    }, 100);
    
    // Examples are already executed from initial load, no need to re-execute
}

function hideCategoryExamples(categoryId) {
    // Hide the target category group
    const targetGroup = document.getElementById(`category-${categoryId}`);
    if (targetGroup) {
        targetGroup.style.display = 'none';
    }
}

// Auto-expand first category and show its examples
document.addEventListener('DOMContentLoaded', function() {
    // Check for hash in URL
    const hash = window.location.hash.substring(1); // Remove #
    
    if (hash) {
        // Find example by ID
        const targetExample = document.getElementById(hash);
        if (targetExample) {
            const categoryId = targetExample.getAttribute('data-category');
            
            // Find and expand the category
            const categoryHeader = document.querySelector(`[onclick="toggleCategory('${categoryId}')"]`);
            if (categoryHeader) {
                // Close all other categories first
                document.querySelectorAll('.nav-category').forEach(cat => {
                    const otherCategoryId = cat.querySelector('.nav-examples').id.replace('examples-', '');
                    if (otherCategoryId !== categoryId) {
                        const otherExamples = document.getElementById(`examples-${otherCategoryId}`);
                        const otherToggle = document.getElementById(`toggle-${otherCategoryId}`);
                        otherExamples.classList.remove('expanded');
                        otherToggle.classList.remove('expanded');
                        updateToggleArrow(otherCategoryId, false);
                    }
                });
                
                // Expand target category
                const examples = document.getElementById(`examples-${categoryId}`);
                const toggle = document.getElementById(`toggle-${categoryId}`);
                examples.classList.add('expanded');
                toggle.classList.add('expanded');
                updateToggleArrow(categoryId, true);
                
                // Show examples of this category
                showCategoryExamples(categoryId);
                activeCategory = categoryId;
                
                // Scroll to example
                setTimeout(() => {
                    targetExample.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } else {
            // No hash, show first category
            const firstCategory = document.querySelector('.nav-category');
            if (firstCategory) {
                const categoryId = firstCategory.querySelector('.nav-examples').id.replace('examples-', '');
                // Expand first category
                const examples = document.getElementById(`examples-${categoryId}`);
                const toggle = document.getElementById(`toggle-${categoryId}`);
                examples.classList.add('expanded');
                toggle.classList.add('expanded');
                updateToggleArrow(categoryId, true);
                // Show examples of first category
                showCategoryExamples(categoryId);
                activeCategory = categoryId;
            }
        }
    } else {
        // No hash, show first category
        const firstCategory = document.querySelector('.nav-category');
        if (firstCategory) {
            const categoryId = firstCategory.querySelector('.nav-examples').id.replace('examples-', '');
            // Expand first category
            const examples = document.getElementById(`examples-${categoryId}`);
            const toggle = document.getElementById(`toggle-${categoryId}`);
            examples.classList.add('expanded');
            toggle.classList.add('expanded');
            updateToggleArrow(categoryId, true);
            // Show examples of first category
            showCategoryExamples(categoryId);
            activeCategory = categoryId;
        }
    }
    
    // Execute ALL examples on page load
    executeAllExamples();
});

// Handle hash changes
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetExample = document.getElementById(hash);
        if (targetExample) {
            const categoryId = targetExample.getAttribute('data-category');
            
            // Close all other categories first
            document.querySelectorAll('.nav-category').forEach(cat => {
                const otherCategoryId = cat.querySelector('.nav-examples').id.replace('examples-', '');
                if (otherCategoryId !== categoryId) {
                    const otherExamples = document.getElementById(`examples-${otherCategoryId}`);
                    const otherToggle = document.getElementById(`toggle-${otherCategoryId}`);
                    otherExamples.classList.remove('expanded');
                    otherToggle.classList.remove('expanded');
                    updateToggleArrow(otherCategoryId, false);
                }
            });
            
            // Expand target category
            const examples = document.getElementById(`examples-${categoryId}`);
            const toggle = document.getElementById(`toggle-${categoryId}`);
            examples.classList.add('expanded');
            toggle.classList.add('expanded');
            updateToggleArrow(categoryId, true);
            
            showCategoryExamples(categoryId);
            activeCategory = categoryId;
            
            setTimeout(() => {
                targetExample.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
});

// Copy code function
function copyCode(codeId) {
    const script = document.getElementById(codeId);
    if (script) {
        const code = script.textContent.trim();
        
        navigator.clipboard.writeText(code).then(() => {
            // Show feedback
            const button = document.querySelector(`button[onclick="copyCode('${codeId}')"]`);
            if (button) {
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 1000);
            }
        }).catch(err => {
            console.error('Failed to copy code:', err);
        });
    }
}

// Simple execution for each example
function executeExample(codeId, code) {
    const demoElement = document.querySelector(`[data-code-id="${codeId}"]`);
    if (!demoElement) return;
    
    // Check if already executed
    if (demoElement.querySelector('.executed')) {
        return;
    }
    
    // Mark as executed
    demoElement.classList.add('executed');
    
    // Create module blob for execution
    const moduleCode = `
        // Execute user code with target container
        (function() {
            const originalShow = window.show;
            const originalExplore = window.explore;
            const originalCompare = window.compare;
            
            // Override functions to pass target container
            const show = function(timeline, viewConfig, options = {}) {
                options.target = 'calcplot-${codeId}';
                return originalShow(timeline, viewConfig, options);
            };
            
            const explore = function(timeline, viewConfig, options = {}) {
                options.target = 'calcplot-${codeId}';
                return originalExplore(timeline, viewConfig, options);
            };
            
            const compare = function(timeline, viewConfig, options = {}) {
                options.target = 'calcplot-${codeId}';
                return originalCompare(timeline, viewConfig, options);
            };
            
            ${code.replace(/import\s*\{[^}]+\}\s*from\s*['"][^'"]*['"];?\s*/g, '')}
        })();
    `;
    
    const blob = new Blob([moduleCode], { type: 'text/javascript' });
    import(URL.createObjectURL(blob)).catch(error => {
        console.error('Error executing example:', error);
    });
}

// Execute all examples on page load
function executeAllExamples() {
    // Find all CalcPlot example scripts
    const exampleScripts = document.querySelectorAll('script[type="text/x-calcplot-example"]');
    
    exampleScripts.forEach(script => {
        const codeId = script.id;
        const code = script.textContent.trim();
        
        if (code) {
            executeExample(codeId, code);
        }
    });
}

// Execute only visible examples (for category toggling)
function executeVisibleExamples() {
    // Find all CalcPlot example scripts
    const exampleScripts = document.querySelectorAll('script[type="text/x-calcplot-example"]');
    
    exampleScripts.forEach(script => {
        const codeId = script.id;
        const code = script.textContent.trim();
        
        // Only execute if the example's category group is visible
        const exampleElement = document.getElementById(codeId);
        if (exampleElement) {
            const categoryGroup = exampleElement.closest('.category-group');
            if (categoryGroup && categoryGroup.style.display !== 'none' && !categoryGroup.classList.contains('hidden')) {
                if (code) {
                    executeExample(codeId, code);
                }
            }
        }
    });
}

// Re-execute examples when category changes
function reexecuteVisibleExamples() {
    // Execute examples in visible category
    executeVisibleExamples();
}
