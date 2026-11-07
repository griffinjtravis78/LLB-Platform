// File: src/modules/module02.js
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
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 2: Parental History & Passing Records</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog maternal and paternal lineage, vital status, and memorial passing details.</p>
                </div>
                <button id="btn-add-parent" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Parent / Guardian Record (2.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Parental Records
                </div>
                <div id="parents-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-parent').addEventListener('click', () => {
        window.app.activeSubLevel = '2.1';
        window.app.renderNavigation();
        window.app.loadModule('module02', '2.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_02_parents')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('parents-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No parental records entered yet. Click "+ Add Parent / Guardian Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Relationship</th>
                    <th class="p-2.5">Full Name</th>
                    <th class="p-2.5">Living Status</th>
                    <th class="p-2.5">Passing Details</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.relationship_type || 'N/A'}</td>
                        <td class="p-2.5">${rec.first_name || ''} ${rec.middle_name || ''} ${rec.last_name || ''}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${rec.living_status === 'Living' ? 'bg-green-900/40 text-green-300 border border-green-700/50' : 'bg-gray-800 text-gray-300 border border-gray-700'}">${rec.living_status || 'Living'}</span></td>
                        <td class="p-2.5">${rec.living_status === 'Deceased' ? (rec.passing_date || 'Deceased') : 'N/A'}</td>
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
            if (confirm('Are you sure you want to delete this parental record?')) {
                const { error: delError } = await supabase.from('module_02_parents').delete().eq('id', id);
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
            window.app.activeSubLevel = '2.1';
            window.app.renderNavigation();
            window.app.loadModule('module02', '2.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '2.1') {
        renderParentForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderParentForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 2.1: Parent / Guardian Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record maternal or paternal biographical details. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod2-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Relationship Type *</label>
                    <select id="relationship_type" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                        <option value="">Select Relationship...</option>
                        <option value="Biological Mother">Biological Mother</option>
                        <option value="Biological Father">Biological Father</option>
                        <option value="Adoptive Mother">Adoptive Mother</option>
                        <option value="Adoptive Father">Adoptive Father</option>
                        <option value="Step-Mother">Step-Mother</option>
                        <option value="Step-Father">Step-Father</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                    </select>
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">First Name *</label>
                        <input type="text" id="first_name" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Middle Name</label>
                        <input type="text" id="middle_name" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Last Name *</label>
                        <input type="text" id="last_name" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Living Status *</label>
                        <select id="living_status" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                            <option value="Living">Living</option>
                            <option value="Deceased">Deceased</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Passing Date (if deceased)</label>
                        <input type="date" id="passing_date" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Parental Record</button>
            </form>
            <div id="mod2-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module02', null);
    });

    document.getElementById('mod2-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const relationship_type = document.getElementById('relationship_type').value;
        const first_name = document.getElementById('first_name').value.trim();
        const middle_name = document.getElementById('middle_name').value.trim();
        const last_name = document.getElementById('last_name').value.trim();
        const living_status = document.getElementById('living_status').value;
        const passing_date = document.getElementById('passing_date').value || null;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod2-status');
        statusEl.textContent = 'Saving parental record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_02_parents').insert({
            tenant_id: profile.tenant_id,
            relationship_type,
            first_name,
            middle_name,
            last_name,
            living_status,
            passing_date
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved parental record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module02', null);
            }, 1000);
        }
    });
}
