// File: src/modules/module10.js
import { supabase } from '../app.js';

export async function renderDashboard(container) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center border-b border-[#D8C3A5]/20 pb-4">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 10: Aesthetics, Burial Attire, Jewelry & Floral Preferences</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog casket aesthetics, burial clothing, keepsake jewelry directives, and floral arrangement preferences.</p>
                </div>
                <button id="btn-add-aesthetics" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Aesthetics Record (10.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Aesthetic Preferences
                </div>
                <div id="aesthetics-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-aesthetics').addEventListener('click', () => {
        window.app.activeSubLevel = '10.1';
        window.app.renderNavigation();
        window.app.loadModule('module10', '10.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_10_aesthetics')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('aesthetics-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No aesthetic preferences entered yet. Click "+ Add Aesthetics Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Casket / Urn Aesthetic</th>
                    <th class="p-2.5">Burial Attire</th>
                    <th class="p-2.5">Jewelry Instructions</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.casket_aesthetic || 'N/A'}</td>
                        <td class="p-2.5">${rec.burial_attire || 'N/A'}</td>
                        <td class="p-2.5">${rec.jewelry_directives || 'None'}</td>
                        <td class="p-2.5 text-right space-x-2">
                            <button data-id="${rec.id}" class="edit-btn text-[#D8C3A5] hover:underline font-bold bg-transparent border-none cursor-pointer">EDIT</button>
                            <button data-id="${rec.id}" class="delete-btn text-red-300 hover:underline font-bold bg-transparent border-none cursor-pointer">DELETE</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this aesthetics record?')) {
                const { error: delError } = await supabase.from('module_10_aesthetics').delete().eq('id', id);
                if (delError) {
                    alert(`Error deleting record: ${delError.message}`);
                } else {
                    loadRecordsTable(tenantId);
                }
            }
        });
    });

    tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.app.activeSubLevel = '10.1';
            window.app.renderNavigation();
            window.app.loadModule('module10', '10.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '10.1') {
        renderAestheticsForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderAestheticsForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 10.1: Aesthetics & Attire Directives</h2>
                    <p class="text-xs text-gray-300 mt-1">Record casket style, clothing, and floral preferences. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod10-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Casket / Urn Aesthetic & Finish *</label>
                    <input type="text" id="casket_aesthetic" placeholder="e.g. Polished mahogany, brushed bronze, natural wicker" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Burial Attire / Clothing Instructions *</label>
                    <input type="text" id="burial_attire" placeholder="e.g. Navy suit, traditional garments" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Keepsake Jewelry & Personal Items Directives</label>
                    <input type="text" id="jewelry_directives" placeholder="e.g. Wear wedding band, return watch to niece" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Floral Arrangement & Color Preferences</label>
                    <textarea id="floral_preferences" placeholder="Specify preferred flowers, colors, or requests for charitable donations instead of flowers..." rows="3" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Aesthetics Record</button>
            </form>
            <div id="mod10-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module10', null);
    });

    document.getElementById('mod10-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const casket_aesthetic = document.getElementById('casket_aesthetic').value.trim();
        const burial_attire = document.getElementById('burial_attire').value.trim();
        const jewelry_directives = document.getElementById('jewelry_directives').value.trim();
        const floral_preferences = document.getElementById('floral_preferences').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod10-status');
        statusEl.textContent = 'Saving aesthetics record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_10_aesthetics').insert({
            tenant_id: profile.tenant_id,
            casket_aesthetic,
            burial_attire,
            jewelry_directives,
            floral_preferences
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved aesthetics record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module10', null);
            }, 1000);
        }
    });
}
