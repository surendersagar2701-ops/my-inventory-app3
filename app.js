/* ========================================
   SMART INVENTORY v2.0 - Complete Management
   ======================================== */

let products = JSON.parse(localStorage.getItem('products')) || [];
let sections = JSON.parse(localStorage.getItem('sections')) || [];
let bills = JSON.parse(localStorage.getItem('bills')) || [];
let currentBill = [];

// ===== DESIGN TEMPLATES =====
let designTemplates = JSON.parse(localStorage.getItem('designTemplates')) || [];
let selectedSareeColor = null;
let selectedSareeImage = null;

// ==========================================
// 1. NAVIGATION
// ==========================================

function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[onclick="switchPage('${page}')"]`).classList.add('active');
    
    if (page === 'inventory') renderInventory();
    if (page === 'aiSet') { renderDesignTemplates(); updateUI(); }
    if (page === 'home') updateUI();
    if (page === 'bill') renderBillHistory();
}

// ==========================================
// 2. MODAL
// ==========================================

function openModal(type, data = null) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    let html = '';
    
    switch(type) {
        case 'addSection':
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">📁 Create New Section</h3>
                <div class="form-group">
                    <label>Section Name</label>
                    <input id="sectionNameInput" placeholder="e.g., Bangles, Sets" class="form-input">
                </div>
                <button onclick="addSection()" class="btn-gradient">Create Section</button>
            `;
            break;
            
        case 'renameSection':
            const section = sections.find(s => s.id === data);
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">✏️ Rename Section</h3>
                <div class="form-group">
                    <label>Current Name</label>
                    <input value="${section?.name || ''}" class="form-input" disabled style="opacity:0.5">
                </div>
                <div class="form-group">
                    <label>New Name</label>
                    <input id="renameSectionInput" value="${section?.name || ''}" class="rename-section-input" placeholder="Enter new section name">
                </div>
                <button onclick="renameSection('${data}')" class="btn-gradient">💾 Update Name</button>
            `;
            break;
            
        case 'addProduct':
            const sectionOptions = sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">➕ Add Bangle/Product</h3>
                <div class="form-group">
                    <label>Section</label>
                    <select id="productSection" class="form-input">
                        <option value="">Select Section</option>
                        ${sectionOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Product Name</label>
                    <input id="productName" placeholder="e.g., Gold Bangle" class="form-input">
                </div>
                <div class="form-group">
                    <label>SKU</label>
                    <input id="productSKU" placeholder="e.g., BGL-001" class="form-input">
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <select id="productColor" class="form-input">
                        <option value="">Select Color</option>
                        <option value="Red">🔴 Red</option>
                        <option value="Blue">🔵 Blue</option>
                        <option value="Gold">🟡 Gold</option>
                        <option value="Green">🟢 Green</option>
                        <option value="Silver">⚪ Silver</option>
                        <option value="Pink">🩷 Pink</option>
                        <option value="Purple">🟣 Purple</option>
                        <option value="Orange">🟠 Orange</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Size</label>
                    <input id="productSize" placeholder="e.g., M, L, 18" class="form-input">
                </div>
                <div class="form-group">
                    <label>Price (₹)</label>
                    <input id="productPrice" type="number" placeholder="0" class="form-input">
                </div>
                <div class="form-group">
                    <label>Stock</label>
                    <input id="productStock" type="number" value="0" class="form-input">
                </div>
                <button onclick="addProduct()" class="btn-gradient">➕ Add Product</button>
            `;
            break;
            
        case 'bulkAdd':
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">📥 Bulk Add Products</h3>
                <p style="color:#6b7280;font-size:13px;margin-bottom:12px">Format: Name,SKU,Color,Size,Price,Stock (one per line)</p>
                <div class="form-group">
                    <label>Section</label>
                    <select id="bulkSection" class="form-input">
                        <option value="">Select Section</option>
                        ${sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Products</label>
                    <textarea id="bulkProducts" rows="6" placeholder="Gold Bangle,BGL-001,Gold,M,499,10&#10;Red Bangle,BGL-002,Red,L,399,8" style="width:100%;padding:12px;border:1px solid rgba(255,255,255,0.06);border-radius:12px;background:rgba(255,255,255,0.04);color:#fff;font-family:monospace;font-size:14px;resize:vertical"></textarea>
                </div>
                <button onclick="bulkAdd()" class="btn-gradient">📥 Add All</button>
            `;
            break;
            
        case 'addTemplate':
        case 'editTemplate':
            const isEdit = type === 'editTemplate';
            const template = isEdit ? designTemplates.find(t => t.id === data) : null;
            const tName = template?.name || '';
            const tDesc = template?.desc || '';
            const tPositions = template?.positions?.join(', ') || '';
            const tImage = template?.image || '';
            
            html = `
                <button class="modal-close" onclick="closeModal()">✕</button>
                <h3 class="modal-title">${isEdit ? '✏️ Edit' : '📐 Add'} Design Template</h3>
                <p style="color:#6b7280;font-size:13px;margin-bottom:12px">
                    ${isEdit ? 'Update' : 'Upload a'} design pattern showing bangle arrangement
                </p>
                <div class="form-group">
                    <label>Template Name *</label>
                    <input id="templateName" value="${tName}" placeholder="e.g., Round Set, Long Set, Heavy Set" class="form-input">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input id="templateDesc" value="${tDesc}" placeholder="e.g., 8 bangles in round pattern" class="form-input">
                </div>
                <div class="form-group">
                    <label>Bangle Positions (comma separated)</label>
                    <input id="templatePositions" value="${tPositions}" placeholder="e.g., 1,2,3,4,5,6,7,8" class="form-input">
                    <div style="font-size:11px;color:#6b7280;margin-top:4px">Number of bangles in this set pattern</div>
                </div>
                <div class="form-group">
                    <label>Template Image</label>
                    <div class="image-upload-area" onclick="document.getElementById('templateImageInput').click()">
                        <span class="upload-icon">🖼️</span>
                        <span class="upload-text">${isEdit && tImage ? 'Change image (optional)' : 'Tap to upload template image'}</span>
                    </div>
                    <input type="file" id="templateImageInput" accept="image/*" style="display:none" onchange="handleTemplateImage(event)">
                    <div id="templateImagePreview" class="image-preview">
                        ${isEdit && tImage ? `<div class="image-preview-item"><img src="${tImage}" alt="Template"><button class="remove-img" onclick="removeTemplateImage()">✕</button></div>` : ''}
                    </div>
                </div>
                <button onclick="${isEdit ? `saveEditTemplate('${data}')` : 'saveDesignTemplate()'}" class="btn-gradient">
                    ${isEdit ? '💾 Update Template' : '💾 Save Template'}
                </button>
                ${isEdit ? `<button onclick="deleteTemplate('${data}')" style="width:100%;padding:12px;margin-top:8px;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:12px;font-weight:600;cursor:pointer">🗑️ Delete Template</button>` : ''}
            `;
            break;
            
        default:
            html = `<button class="modal-close" onclick="closeModal()">✕</button><p>Unknown</p>`;
    }
    
    content.innerHTML = html;
    modal.classList.add('show');
    
    if (type === 'editTemplate' && data) {
        const t = designTemplates.find(tm => tm.id === data);
        if (t && t.image) {
            window._editTemplateImage = t.image;
        }
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
    window._editTemplateImage = null;
}

// ==========================================
// 3. SECTIONS - FULL MANAGEMENT
// ==========================================

function addSection() {
    const name = document.getElementById('sectionNameInput').value.trim();
    if (!name) { alert('Enter section name'); return; }
    
    if (sections.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        alert('⚠️ Section with this name already exists!');
        return;
    }
    
    sections.push({ id: 'SEC-' + Date.now(), name: name });
    localStorage.setItem('sections', JSON.stringify(sections));
    closeModal();
    updateUI();
    alert('✅ Section "' + name + '" created!');
}

function renameSection(id) {
    const newName = document.getElementById('renameSectionInput').value.trim();
    if (!newName) { alert('Enter new section name'); return; }
    
    if (sections.some(s => s.name.toLowerCase() === newName.toLowerCase() && s.id !== id)) {
        alert('⚠️ Section with this name already exists!');
        return;
    }
    
    const section = sections.find(s => s.id === id);
    if (!section) { alert('Section not found!'); return; }
    
    const oldName = section.name;
    section.name = newName;
    localStorage.setItem('sections', JSON.stringify(sections));
    closeModal();
    updateUI();
    alert('✅ Section renamed from "' + oldName + '" to "' + newName + '"');
}

function deleteSection(id) {
    if (!confirm('⚠️ Delete this section and ALL products in it?')) return;
    
    const section = sections.find(s => s.id === id);
    products = products.filter(p => p.sectionId !== id);
    sections = sections.filter(s => s.id !== id);
    
    localStorage.setItem('sections', JSON.stringify(sections));
    localStorage.setItem('products', JSON.stringify(products));
    updateUI();
    alert('✅ Section "' + (section?.name || '') + '" deleted!');
}

function openRenameSection(id) {
    openModal('renameSection', id);
}

// ==========================================
// 4. DESIGN TEMPLATES - FULL CRUD
// ==========================================

let templateImageData = null;

function handleTemplateImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        templateImageData = e.target.result;
        document.getElementById('templateImagePreview').innerHTML = `
            <div class="image-preview-item">
                <img src="${e.target.result}" alt="Template">
                <button class="remove-img" onclick="removeTemplateImage()">✕</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function removeTemplateImage() {
    templateImageData = null;
    document.getElementById('templateImagePreview').innerHTML = '';
    document.getElementById('templateImageInput').value = '';
}

function saveDesignTemplate() {
    const name = document.getElementById('templateName').value.trim();
    const desc = document.getElementById('templateDesc').value.trim();
    const positionsText = document.getElementById('templatePositions').value.trim();
    
    if (!name) { alert('Enter template name'); return; }
    if (!templateImageData) { alert('Upload template image'); return; }
    
    const positions = positionsText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (positions.length === 0) {
        alert('Enter valid positions (e.g., 1,2,3,4)');
        return;
    }
    
    const template = {
        id: 'TMP-' + Date.now(),
        name: name,
        desc: desc || 'Bangle Set Pattern',
        positions: positions,
        image: templateImageData,
        created: new Date().toISOString()
    };
    
    designTemplates.push(template);
    localStorage.setItem('designTemplates', JSON.stringify(designTemplates));
    templateImageData = null;
    closeModal();
    renderDesignTemplates();
    updateTemplateCount();
    alert('✅ Template "' + name + '" added successfully!');
}

function editTemplate(id) {
    openModal('editTemplate', id);
}

function saveEditTemplate(id) {
    const template = designTemplates.find(t => t.id === id);
    if (!template) { alert('Template not found!'); return; }
    
    const name = document.getElementById('templateName').value.trim();
    const desc = document.getElementById('templateDesc').value.trim();
    const positionsText = document.getElementById('templatePositions').value.trim();
    
    if (!name) { alert('Enter template name'); return; }
    
    const positions = positionsText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (positions.length === 0) {
        alert('Enter valid positions (e.g., 1,2,3,4)');
        return;
    }
    
    template.name = name;
    template.desc = desc || 'Bangle Set Pattern';
    template.positions = positions;
    
    if (templateImageData) {
        template.image = templateImageData;
        templateImageData = null;
    }
    
    localStorage.setItem('designTemplates', JSON.stringify(designTemplates));
    closeModal();
    renderDesignTemplates();
    updateTemplateCount();
    alert('✅ Template "' + name + '" updated successfully!');
}

function deleteTemplate(id) {
    if (!confirm('⚠️ Delete this template?')) return;
    const template = designTemplates.find(t => t.id === id);
    designTemplates = designTemplates.filter(t => t.id !== id);
    localStorage.setItem('designTemplates', JSON.stringify(designTemplates));
    renderDesignTemplates();
    updateTemplateCount();
    alert('✅ Template "' + (template?.name || '') + '" deleted!');
}

function renderDesignTemplates() {
    const container = document.getElementById('designTemplates');
    if (!container) return;
    
    updateTemplateCount();
    
    if (designTemplates.length === 0) {
        container.innerHTML = `
            <div class="empty-templates">
                <div class="empty-icon">📐</div>
                <div class="empty-title">No design templates</div>
                <div class="empty-desc">Add your first design pattern by clicking "+ Add"</div>
                <button onclick="openModal('addTemplate')" class="btn-primary" style="margin-top:10px;padding:8px 24px;font-size:13px">
                    + Add Template
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = designTemplates.map((t, idx) => `
        <div class="template-card">
            <div class="template-image">
                <img src="${t.image}" alt="${t.name}">
            </div>
            <div class="template-name">${t.name}</div>
            <div class="template-desc">${t.desc || ''}</div>
            <div class="template-position-badge">${t.positions.length} bangles</div>
            <div class="template-actions">
                <button class="edit-btn" onclick="editTemplate('${t.id}')">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteTemplate('${t.id}')">🗑️</button>
            </div>
            <div style="font-size:9px;color:#6b7280;margin-top:4px">#${idx + 1}</div>
        </div>
    `).join('');
}

function updateTemplateCount() {
    const countEl = document.getElementById('templateCount');
    if (countEl) {
        countEl.textContent = designTemplates.length + ' templates';
    }
}

function addDesignTemplate() {
    openModal('addTemplate');
}

// ==========================================
// 5. SAREE COLOR SELECTION
// ==========================================

function selectSareeColor(color) {
    selectedSareeColor = color;
    selectedSareeImage = null;
    document.getElementById('selectedSareeColor').textContent = color + ' 🔴';
    document.querySelectorAll('.saree-color-option').forEach(el => {
        el.classList.remove('selected');
        if (el.textContent.includes(color)) el.classList.add('selected');
    });
    document.getElementById('sareeImagePreview').innerHTML = '';
}

function handleSareeImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedSareeImage = e.target.result;
        selectedSareeColor = null;
        document.getElementById('selectedSareeColor').textContent = 'Image Uploaded 🖼️';
        document.querySelectorAll('.saree-color-option').forEach(el => el.classList.remove('selected'));
        document.getElementById('sareeImagePreview').innerHTML = `
            <div class="image-preview-item">
                <img src="${e.target.result}" alt="Saree" style="width:100%;height:100%;object-fit:cover">
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

// ==========================================
// 6. AI SET GENERATOR
// ==========================================

function generateAISets() {
    const container = document.getElementById('generatedSets');
    
    if (!selectedSareeColor && !selectedSareeImage) {
        alert('⚠️ Please select a saree color or upload saree image first!');
        return;
    }
    
    let targetColor = selectedSareeColor;
    if (selectedSareeImage && !targetColor) {
        targetColor = prompt('Enter saree color from image (e.g., Red, Blue, Gold):');
        if (!targetColor) { alert('Please enter a color'); return; }
        selectedSareeColor = targetColor;
    }
    
    const matchingProducts = products.filter(p => 
        p.color && p.color.toLowerCase() === targetColor.toLowerCase() && p.stock > 0
    );
    
    if (matchingProducts.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:30px;border:2px solid rgba(239,68,68,0.3)">
                <div style="font-size:48px;margin-bottom:10px">😅</div>
                <h4 style="color:#f87171">No matching bangles found!</h4>
                <p style="color:#6b7280;font-size:13px;margin-top:8px">
                    Color: <strong>${targetColor}</strong><br>
                    Please add bangles of this color to inventory.
                </p>
                <button onclick="openModal('addProduct')" class="btn-gradient" style="margin-top:12px;padding:10px 30px;font-size:13px">
                    ➕ Add ${targetColor} Bangles
                </button>
            </div>
        `;
        return;
    }
    
    if (designTemplates.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:30px;border:2px solid rgba(239,68,68,0.3)">
                <div style="font-size:48px;margin-bottom:10px">📐</div>
                <h4 style="color:#f87171">No design templates found!</h4>
                <p style="color:#6b7280;font-size:13px;margin-top:8px">
                    Please add at least 1 design template first.
                </p>
                <button onclick="openModal('addTemplate')" class="btn-gradient" style="margin-top:12px;padding:10px 30px;font-size:13px">
                    📐 Add Design Template
                </button>
            </div>
        `;
        return;
    }
    
    // Generate sets for each template
    let setsHtml = '';
    let setCount = 0;
    let generatedSetsData = [];
    
    designTemplates.forEach((template, idx) => {
        const totalStock = matchingProducts.reduce((sum, p) => sum + p.stock, 0);
        const piecesPerSet = template.positions.length || 8;
        const maxSets = Math.floor(totalStock / piecesPerSet);
        
        if (maxSets < 1) return;
        setCount++;
        
        const selectedBangles = [];
        let stockCopy = matchingProducts.map(p => ({...p}));
        
        for (let i = 0; i < piecesPerSet; i++) {
            const available = stockCopy.filter(p => p.stock > 0);
            if (available.length === 0) break;
            const pick = available[Math.floor(Math.random() * available.length)];
            const idx2 = stockCopy.indexOf(pick);
            if (idx2 > -1) {
                stockCopy[idx2].stock--;
                selectedBangles.push(pick);
            }
        }
        
        if (selectedBangles.length < 2) return;
        
        const setPrice = selectedBangles.reduce((sum, b) => sum + (b.price || 0), 0) + 100;
        
        generatedSetsData.push({
            template: template,
            selectedBangles: selectedBangles,
            maxSets: maxSets,
            setPrice: setPrice,
            targetColor: targetColor
        });
        
        setsHtml += `
            <div class="set-result-card">
                <div class="set-result-header">
                    <span class="set-result-name">🎨 ${template.name} - ${targetColor} Collection</span>
                    <span class="set-result-badge">${maxSets} sets</span>
                </div>
                
                <div class="set-result-preview">
                    ${selectedBangles.map((b, i) => `
                        <div class="bangle-item" style="background:${getColorHex(b.color)}">
                            <span style="font-size:14px;color:#fff;font-weight:700">${i+1}</span>
                            <div class="bangle-label">${b.name}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin:8px 0;padding:8px;background:rgba(255,255,255,0.02);border-radius:8px;font-size:12px;color:#6b7280;text-align:center">
                    ${template.desc} • ${selectedBangles.length} pieces • Pattern: ${template.name}
                </div>
                
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
                    <div>
                        <div style="font-size:12px;color:#6b7280">Set Price</div>
                        <div style="font-size:20px;font-weight:800;color:#818cf8">₹${setPrice}</div>
                    </div>
                    <div style="display:flex;gap:8px">
                        <button onclick="previewSet(${idx})" class="btn-secondary" style="padding:8px 16px;font-size:12px">👁️ Preview</button>
                        <button onclick="addSetToInventory(${idx})" class="btn-add-set">➕ Add Set</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    if (setCount === 0) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:30px">
                <div style="font-size:48px;margin-bottom:10px">😅</div>
                <h4 style="color:#f87171">Not enough stock!</h4>
                <p style="color:#6b7280;font-size:13px;margin-top:8px">
                    Need at least ${designTemplates[0]?.positions?.length || 8} bangles of ${targetColor} color.
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="margin:15px 0 10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <span style="font-size:14px;color:#6b7280">🎯 Found ${setCount} matching sets from ${designTemplates.length} templates</span>
            <button onclick="addAllSets()" class="btn-success" style="padding:8px 20px;font-size:13px;width:auto">
                📦 Add All Sets
            </button>
        </div>
        ${setsHtml}
    `;
    
    window._generatedSetsData = {
        templates: designTemplates,
        color: targetColor,
        products: matchingProducts,
        generatedData: generatedSetsData,
        setsHtml: setsHtml
    };
}

function getColorHex(color) {
    const map = {
        'Red':'#ef4444','Blue':'#3b82f6','Gold':'#f59e0b',
        'Green':'#22c55e','Silver':'#9ca3af','Pink':'#ec4899',
        'Purple':'#8b5cf6','Orange':'#f97316','Yellow':'#eab308'
    };
    return map[color] || '#6b7280';
}

function addSetToInventory(templateIdx) {
    const data = window._generatedSetsData;
    if (!data || !data.generatedData || !data.generatedData[templateIdx]) {
        alert('Please generate sets first!');
        return;
    }
    
    const setData = data.generatedData[templateIdx];
    const template = setData.template;
    
    let setSection = sections.find(s => s.name === 'AI Sets');
    if (!setSection) {
        setSection = { id: 'SEC-AI-' + Date.now(), name: 'AI Sets' };
        sections.push(setSection);
        localStorage.setItem('sections', JSON.stringify(sections));
    }
    
    const product = {
        id: 'SET-' + Date.now(),
        sectionId: setSection.id,
        name: template.name + ' (' + data.color + ' Set)',
        sku: 'SET-' + Date.now().toString().slice(-6),
        color: data.color,
        size: 'Set',
        price: setData.setPrice || 499,
        stock: 1,
        purchase: 0,
        isSet: true,
        templateId: template.id,
        templateImage: template.image,
        setDetails: {
            pieces: template.positions.length,
            pattern: template.name,
            description: template.desc,
            sareeColor: data.color,
            bangles: setData.selectedBangles.map(b => b.name)
        }
    };
    
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    updateUI();
    alert('✅ Added "' + product.name + '" to inventory!');
}

function addAllSets() {
    const data = window._generatedSetsData;
    if (!data || !data.generatedData) {
        alert('Please generate sets first!');
        return;
    }
    
    let added = 0;
    data.generatedData.forEach((setData, idx) => {
        const template = setData.template;
        
        let setSection = sections.find(s => s.name === 'AI Sets');
        if (!setSection) {
            setSection = { id: 'SEC-AI-' + Date.now(), name: 'AI Sets' };
            sections.push(setSection);
            localStorage.setItem('sections', JSON.stringify(sections));
        }
        
        const product = {
            id: 'SET-' + Date.now() + '-' + idx,
            sectionId: setSection.id,
            name: template.name + ' (' + data.color + ' Set)',
            sku: 'SET-' + Date.now().toString().slice(-6) + '-' + idx,
            color: data.color,
            size: 'Set',
            price: setData.setPrice || 499,
            stock: 1,
            purchase: 0,
            isSet: true,
            templateId: template.id,
            templateImage: template.image,
            setDetails: {
                pieces: template.positions.length,
                pattern: template.name,
                description: template.desc,
                sareeColor: data.color,
                bangles: setData.selectedBangles.map(b => b.name)
            }
        };
        products.push(product);
        added++;
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('sections', JSON.stringify(sections));
    updateUI();
    alert('✅ Added ' + added + ' sets to inventory!');
}

function previewSet(idx) {
    const data = window._generatedSetsData;
    if (!data || !data.generatedData || !data.generatedData[idx]) {
        alert('No set data found!');
        return;
    }
    
    const setData = data.generatedData[idx];
    const template = setData.template;
    
    alert(
        '🎨 SET PREVIEW\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        'Pattern: ' + template.name + '\n' +
        'Description: ' + (template.desc || 'N/A') + '\n' +
        'Saree Color: ' + data.color + '\n' +
        'Pieces: ' + (template.positions.length || 8) + ' bangles\n' +
        'Price: ₹' + (setData.setPrice || 499) + '\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        'Bangles in Set:\n' + 
        setData.selectedBangles.map((b, i) => '  ' + (i+1) + '. ' + b.name + ' (' + b.color + ')').join('\n') + '\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '📐 Pattern matches saree color with\n' +
        'the ' + template.name + ' design pattern.'
    );
}

// ==========================================
// 7. PRODUCTS
// ==========================================

function addProduct() {
    const sectionId = document.getElementById('productSection').value;
    const name = document.getElementById('productName').value.trim();
    const sku = document.getElementById('productSKU').value.trim();
    const color = document.getElementById('productColor').value;
    const size = document.getElementById('productSize').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    
    if (!sectionId) { alert('Select section'); return; }
    if (!name) { alert('Enter name'); return; }
    if (!sku) { alert('Enter SKU'); return; }
    if (products.some(p => p.sku === sku)) { alert('SKU exists!'); return; }
    
    products.push({
        id: 'PROD-' + Date.now(),
        sectionId, name, sku, color, size,
        price, stock, purchase: 0
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
}

function editProduct(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    
    const opts = sections.map(s => `<option value="${s.id}" ${s.id===p.sectionId?'selected':''}>${s.name}</option>`).join('');
    
    document.getElementById('modalContent').innerHTML = `
        <button class="modal-close" onclick="closeModal()">✕</button>
        <h3 class="modal-title">✏️ Edit Product</h3>
        <div class="form-group"><label>Section</label><select id="editSection" class="form-input">${opts}</select></div>
        <div class="form-group"><label>Name</label><input id="editName" value="${p.name}" class="form-input"></div>
        <div class="form-group"><label>SKU</label><input id="editSKU" value="${p.sku}" class="form-input"></div>
        <div class="form-group"><label>Color</label>
            <select id="editColor" class="form-input">
                <option value="">Select</option>
                <option value="Red" ${p.color==='Red'?'selected':''}>🔴 Red</option>
                <option value="Blue" ${p.color==='Blue'?'selected':''}>🔵 Blue</option>
                <option value="Gold" ${p.color==='Gold'?'selected':''}>🟡 Gold</option>
                <option value="Green" ${p.color==='Green'?'selected':''}>🟢 Green</option>
                <option value="Silver" ${p.color==='Silver'?'selected':''}>⚪ Silver</option>
                <option value="Pink" ${p.color==='Pink'?'selected':''}>🩷 Pink</option>
            </select>
        </div>
        <div class="form-group"><label>Size</label><input id="editSize" value="${p.size||''}" class="form-input"></div>
        <div class="form-group"><label>Price</label><input id="editPrice" type="number" value="${p.price}" class="form-input"></div>
        <div class="form-group"><label>Stock</label><input id="editStock" type="number" value="${p.stock}" class="form-input"></div>
        <button onclick="saveEdit('${id}')" class="btn-gradient">💾 Save</button>
        <button onclick="deleteProduct('${id}')" style="width:100%;padding:14px;margin-top:10px;background:#ef4444;color:#fff;border:none;border-radius:12px;font-weight:600;cursor:pointer">🗑️ Delete</button>
    `;
    document.getElementById('modal').classList.add('show');
}

function saveEdit(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    p.sectionId = document.getElementById('editSection').value;
    p.name = document.getElementById('editName').value.trim();
    p.sku = document.getElementById('editSKU').value.trim();
    p.color = document.getElementById('editColor').value;
    p.size = document.getElementById('editSize').value.trim();
    p.price = parseFloat(document.getElementById('editPrice').value) || 0;
    p.stock = parseInt(document.getElementById('editStock').value) || 0;
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
}

function deleteProduct(id) {
    if (!confirm('Delete?')) return;
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
}

// ==========================================
// 8. BULK
// ==========================================

function bulkAdd() {
    const sectionId = document.getElementById('bulkSection').value;
    const text = document.getElementById('bulkProducts').value;
    if (!sectionId) { alert('Select section'); return; }
    if (!text.trim()) { alert('Enter products'); return; }
    
    let added = 0, errors = [];
    text.split('\n').filter(l => l.trim()).forEach(line => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 4) { errors.push('Invalid: ' + line); return; }
        const [name, sku, color, size, price, stock] = parts;
        if (products.some(p => p.sku === sku)) { errors.push('SKU exists: ' + sku); return; }
        products.push({
            id: 'PROD-' + Date.now() + '-' + Math.random().toString(36).substr(2,3),
            sectionId, name, sku, color: color||'', size: size||'',
            price: parseFloat(price)||0, stock: parseInt(stock)||0, purchase: 0
        });
        added++;
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    updateUI();
    alert('✅ Added ' + added + ' products' + (errors.length ? '\nErrors:\n' + errors.join('\n') : ''));
}

// ==========================================
// 9. INVENTORY - WITH RENAME BUTTON
// ==========================================

function renderInventory() {
    const c = document.getElementById('inventorySections');
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterSection = document.getElementById('filterSection')?.value || '';
    const filterColor = document.getElementById('filterColor')?.value || '';
    
    const fs = document.getElementById('filterSection');
    if (fs) {
        const v = fs.value;
        fs.innerHTML = `<option value="">All Sections</option>` + sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        fs.value = v;
    }
    
    let filtered = products;
    if (search) filtered = filtered.filter(p => p.name?.toLowerCase().includes(search) || p.sku?.toLowerCase().includes(search));
    if (filterSection) filtered = filtered.filter(p => p.sectionId === filterSection);
    if (filterColor) filtered = filtered.filter(p => p.color === filterColor);
    
    if (sections.length === 0) {
        c.innerHTML = `<div class="card" style="text-align:center;padding:30px"><div style="font-size:48px;margin-bottom:10px">📁</div><p style="color:#6b7280">No sections</p><button onclick="openModal('addSection')" class="btn-gradient" style="margin-top:12px;padding:12px 30px">Create Section</button></div>`;
        return;
    }
    
    let html = '';
    sections.forEach(section => {
        const sp = filtered.filter(p => p.sectionId === section.id);
        if (sp.length === 0 && !filterSection && !search && !filterColor) {
            html += `
                <div class="section-card">
                    <div class="section-header">
                        <span class="section-name">📁 ${section.name}</span>
                        <div style="display:flex;align-items:center;gap:10px">
                            <span class="section-count">0</span>
                            <div class="section-header-actions">
                                <button class="rename-btn" onclick="openRenameSection('${section.id}')" title="Rename Section">✏️</button>
                                <button class="delete-btn" onclick="deleteSection('${section.id}')" title="Delete Section">🗑️</button>
                            </div>
                        </div>
                    </div>
                    <div style="padding:16px;text-align:center;color:#6b7280;font-size:13px">No products in this section</div>
                </div>
            `;
            return;
        }
        if (sp.length === 0) return;
        
        html += `
            <div class="section-card">
                <div class="section-header">
                    <span class="section-name" onclick="openRenameSection('${section.id}')" title="Click to rename">📁 ${section.name}</span>
                    <div style="display:flex;align-items:center;gap:10px">
                        <span class="section-count">${sp.length}</span>
                        <div class="section-header-actions">
                            <button class="rename-btn" onclick="openRenameSection('${section.id}')" title="Rename Section">✏️</button>
                            <button class="delete-btn" onclick="deleteSection('${section.id}')" title="Delete Section">🗑️</button>
                        </div>
                    </div>
                </div>
                <div class="section-products">
                    ${sp.map(p => `
                        <div class="product-item">
                            <div class="product-info">
                                <div class="product-name">${p.name}</div>
                                <div class="product-sku">SKU: ${p.sku} ${p.color ? '• '+p.color : ''} ${p.size ? '• '+p.size : ''}</div>
                            </div>
                            <div class="product-right">
                                <div class="product-price">₹${p.price||0}</div>
                                <span class="product-stock-badge ${(p.stock||0)<5?'badge-low':'badge-good'}">${p.stock||0}</span>
                                <button onclick="editProduct('${p.id}')" class="product-edit-btn">✏️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    c.innerHTML = html || '<p style="color:#6b7280;text-align:center;padding:30px">No products</p>';
}

// ==========================================
// 10. BILL
// ==========================================

function scanBillProduct() {
    const q = prompt('Enter SKU or name:');
    if (!q) return;
    const p = products.find(pr => pr.sku?.toLowerCase().includes(q.toLowerCase()) || pr.name?.toLowerCase().includes(q.toLowerCase()));
    if (!p) { alert('Not found'); return; }
    if ((p.stock||0) < 1) { alert('Out of stock'); return; }
    const qty = parseInt(prompt('Quantity:', '1')) || 1;
    if (qty > p.stock) { alert('Not enough stock'); return; }
    currentBill.push({ ...p, qty, subtotal: p.price * qty });
    renderBillItems();
}

function renderBillItems() {
    const c = document.getElementById('billItems');
    if (currentBill.length === 0) { c.innerHTML = '<p style="color:#6b7280;text-align:center;padding:12px">No items</p>'; return; }
    c.innerHTML = currentBill.map((item, idx) => `
        <div class="product-item">
            <div class="product-info"><div class="product-name">${item.name}</div><div class="product-sku">₹${item.price} × ${item.qty}</div></div>
            <div style="display:flex;align-items:center;gap:10px"><span style="font-weight:700">₹${item.subtotal}</span><button onclick="removeBillItem(${idx})" style="background:none;border:none;font-size:20px;color:#ef4444;cursor:pointer">✕</button></div>
        </div>
    `).join('');
    calculateBillTotal();
}

function removeBillItem(idx) { currentBill.splice(idx,1); renderBillItems(); }

function calculateBillTotal() {
    const sub = currentBill.reduce((s,i) => s + (i.subtotal||0), 0);
    const dis = parseInt(document.getElementById('billDiscount').value) || 0;
    document.getElementById('billSubtotal').textContent = '₹' + sub;
    document.getElementById('billTotal').textContent = '₹' + Math.max(0, sub - dis);
}

function saveBill() {
    if (currentBill.length === 0) { alert('Add items'); return; }
    const sub = currentBill.reduce((s,i) => s + (i.subtotal||0), 0);
    const dis = parseInt(document.getElementById('billDiscount').value) || 0;
    const total = Math.max(0, sub - dis);
    const bill = {
        id: 'BILL-' + Date.now(),
        date: new Date().toLocaleString(),
        customer: document.getElementById('customerName').value || 'Walk-in',
        mobile: document.getElementById('customerMobile').value || '',
        items: currentBill.map(i => ({...i})),
        subtotal: sub, discount: dis, total: total
    };
    currentBill.forEach(item => {
        const p = products.find(pr => pr.id === item.id);
        if (p) p.stock = (p.stock||0) - item.qty;
    });
    bills.push(bill);
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('products', JSON.stringify(products));
    currentBill = [];
    document.getElementById('customerName').value = '';
    document.getElementById('customerMobile').value = '';
    document.getElementById('billDiscount').value = '0';
    renderBillItems();
    updateUI();
    renderBillHistory();
    alert('✅ Bill saved! Total: ₹' + total);
}

function renderBillHistory() {
    const c = document.getElementById('billHistory');
    if (bills.length === 0) { c.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px">No bills</p>'; return; }
    c.innerHTML = bills.slice(-10).reverse().map(b => `
        <div class="card" style="cursor:pointer" onclick="viewBill('${b.id}')">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div><strong>#${b.id}</strong><div style="font-size:12px;color:#6b7280">${b.date}</div></div>
                <div style="text-align:right"><span style="font-weight:700;font-size:16px">₹${b.total}</span><div style="font-size:11px;color:#6b7280">${b.customer}</div></div>
            </div>
        </div>
    `).join('');
}

function viewBill(id) {
    const b = bills.find(bill => bill.id === id);
    if (!b) return;
    alert('🧾 BILL\n━━━━━━━━━━━━━━━━\nBill: ' + b.id + '\nDate: ' + b.date + '\nCustomer: ' + b.customer + '\n━━━━━━━━━━━━━━━━\n' + b.items.map(i => i.name + ' × ' + i.qty + ' = ₹' + i.subtotal).join('\n') + '\n━━━━━━━━━━━━━━━━\nSubtotal: ₹' + b.subtotal + '\nDiscount: ₹' + b.discount + '\nTOTAL: ₹' + b.total);
}

// ==========================================
// 11. UI UPDATE
// ==========================================

function updateUI() {
    document.getElementById('totalSections').textContent = sections.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalStock').textContent = products.reduce((s,p) => s + (p.stock||0), 0);
    renderHomeSections();
    renderInventory();
    renderBillHistory();
    renderDesignTemplates();
}

function renderHomeSections() {
    const c = document.getElementById('homeSections');
    if (sections.length === 0) {
        c.innerHTML = `<div class="card" style="text-align:center;padding:30px"><div style="font-size:48px;margin-bottom:10px">📂</div><p style="color:#6b7280">No sections</p><button onclick="openModal('addSection')" class="btn-gradient" style="margin-top:12px;padding:12px 30px">Create Section</button></div>`;
        return;
    }
    c.innerHTML = sections.slice(0,5).map(s => `
        <div class="section-card" onclick="switchPage('inventory')" style="cursor:pointer">
            <div class="section-header">
                <span class="section-name">📁 ${s.name}</span>
                <span class="section-count">${products.filter(p => p.sectionId === s.id).length} products</span>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 12. MORE
// ==========================================

function exportData() {
    const data = { products, sections, bills, designTemplates };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_inventory_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Exported!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.products) products = data.products;
                if (data.sections) sections = data.sections;
                if (data.bills) bills = data.bills;
                if (data.designTemplates) designTemplates = data.designTemplates;
                localStorage.setItem('products', JSON.stringify(products));
                localStorage.setItem('sections', JSON.stringify(sections));
                localStorage.setItem('bills', JSON.stringify(bills));
                localStorage.setItem('designTemplates', JSON.stringify(designTemplates));
                updateUI();
                alert('✅ Imported!');
            } catch(err) { alert('Invalid file'); }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (!confirm('Delete ALL data?')) return;
    if (!confirm('Sure?')) return;
    products = []; sections = []; bills = []; currentBill = [];
    designTemplates = [];
    localStorage.removeItem('products');
    localStorage.removeItem('sections');
    localStorage.removeItem('bills');
    localStorage.removeItem('designTemplates');
    updateUI();
    renderBillItems();
    renderDesignTemplates();
    alert('✅ Cleared!');
}

function aboutApp() {
    alert(
        '📱 Smart Inventory v2.0\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '✅ Sections: Add / Rename / Delete\n' +
        '✅ Products: Add / Edit / Delete\n' +
        '✅ Design Templates: Add / Edit / Delete\n' +
        '✅ Saree Color Matching\n' +
        '✅ AI Set Generation\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n' +
        '🎯 Complete Management System!'
    );
}

// ==========================================
// 13. INIT
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', renderInventory);
    document.getElementById('filterSection')?.addEventListener('change', renderInventory);
    document.getElementById('filterColor')?.addEventListener('change', renderInventory);
});

updateUI();
renderDesignTemplates();
updateTemplateCount();
console.log('✅ Smart Inventory v2.0 - Complete Management Loaded!');
console.log('📐 Design Templates:', designTemplates.length);
console.log('📦 Products:', products.length);
console.log('📂 Sections:', sections.length);
