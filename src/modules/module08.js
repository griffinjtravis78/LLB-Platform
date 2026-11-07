// File: src/modules/module08.js
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
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 8: Cultural, Spiritual & Tribal Baseline</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog tribal enrollment, cultural heritage identity, traditional leadership contacts, and cleansing or greeting protocols.</p>
                </div>
                <button id="btn-add-cultural" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Cultural Record (8.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Cultural & Tribal Baseline Records
                </div>
                <div id="cultural-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-cultural').addEventListener('click', () => {
        window.app.activeSubLevel = '8.1';
        window.app.renderNavigation();
        window.app.loadModule('module08', '8.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_08_cultural')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('cultural-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No cultural or tribal records entered yet. Click "+ Add Cultural Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Tribal Nation / Identity</th>
                    <th class="p-2.5">Enrollment Number</th>
                    <th class="p-2.5">Traditional Leader</th>
                    <th class="p-2.5">Cleansing Protocols</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.tribal_identity || 'N/A'}</td>
                        <td class="p-2.5">${rec.enrollment_number || 'N/A'}</td>
                        <td class="p-2.5">${rec.traditional_leader || 'None'}</td>
                        <td class="p-2.5">${rec.cleansing_protocols || 'None'}</td>
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
            if (confirm('Are you sure you want to delete this cultural record?')) {
                const { error: delError } = await supabase.from('module_08_cultural').delete().eq('id', id);
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
            window.app.activeSubLevel = '8.1';
            window.app.renderNavigation();
            window.app.loadModule('module08', '8.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '8.1') {
        renderCulturalForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderCulturalForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 8.1: Cultural & Tribal Baseline Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record tribal enrollment and traditional custom protocols. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod8-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Tribal Nation / Cultural Identity Name *</label>
                    <input type="text" id="tribal_identity" placeholder="e.g. Wyandotte Nation" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Enrollment / Roll Number</label>
                        <input type="text" id="enrollment_number" placeholder="Tribal ID reference" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Traditional Leader / Elder Contact</label>
                        <input type="text" id="traditional_leader" placeholder="Name, Phone or Email" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Required Cleansing / Greeting Rites & Timing Protocols</label>
                    <textarea id="cleansing_protocols" placeholder="Specify traditional greeting customs, cleansing timing, or ceremonial protocols..." rows="3" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Cultural Record</button>
            </form>
            <div id="mod8-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module08', null);
    });

    document.getElementById('mod8-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tribal_identity = document.getElementById('tribal_identity').value.trim();
        const enrollment_number = document.getElementById('enrollment_number').value.trim();
        const traditional_leader = document.getElementById('traditional_leader').value.trim();
        const cleansing_protocols = document.getElementById('cleansing_protocols').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod8-status');
        statusEl.textContent = 'Saving cultural and tribal record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_08_cultural').insert({
            tenant_id: profile.tenant_id,
            tribal_identity,
            enrollment_number,
            traditional_leader,
            cleansing_protocols
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved cultural record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module08', null);
            }, 1000);
        }
    });
}
