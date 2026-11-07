// File: src/modules/module01.js
import { supabase } from '../app.js';

export async function renderDashboard(container) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    const { data: records, error } = await supabase
        .from('module_01_vitals')
        .select('*')
        .eq('tenant_id', profile.tenant_id);

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center border-b border-[#D8C3A5]/20 pb-4">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 1: Biographical Vitals & Contact Ledger</h2>
                    <p class="text-xs text-gray-300 mt-1">Manage official legal vitals, biographical history, and professional counsel.</p>
                </div>
                <div class="flex gap-2">
                    <button id="btn-add-vitals" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                        + Add Vitals Record (1.1)
                    </button>
                    <button id="btn-add-counsel" class="bg-[#6A7B8C] hover:bg-[#485664] text-white font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                        + Add Counsel Record (1.2)
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="vitals-summary-cards">
                <!-- Dynamically loaded summary cards -->
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl mt-6">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Vitals & Counsel Records
                </div>
                <div id="vitals-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-vitals').addEventListener('click', () => {
        window.app.activeSubLevel = '1.1';
        window.app.renderNavigation();
        window.app.loadModule('module01', '1.1');
    });

    document.getElementById('btn-add-counsel').addEventListener('click', () => {
        window.app.activeSubLevel = '1.2';
        window.app.renderNavigation();
        window.app.loadModule('module01', '1.2');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_01_vitals')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('vitals-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No biographical vitals or counsel records entered yet. Click "+ Add Vitals Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Legal Name</th>
                    <th class="p-2.5">Date of Birth</th>
                    <th class="p-2.5">Attorney</th>
                    <th class="p-2.5">Physician</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.first_name || ''} ${rec.middle_name || ''} ${rec.last_name || ''}</td>
                        <td class="p-2.5">${rec.date_of_birth || 'N/A'}</td>
                        <td class="p-2.5">${rec.primary_attorney_name || 'None'}</td>
                        <td class="p-2.5">${rec.primary_physician || 'None'}</td>
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
            if (confirm('Are you sure you want to delete this vital record?')) {
                const { error: delError } = await supabase.from('module_01_vitals').delete().eq('id', id);
                if (delError) {
                    alert(`Error deleting record: ${delError.message}`);
                } else {
                    loadRecordsTable(tenantId);
                }
            }
        });
    });

    tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            window.app.activeSubLevel = '1.1';
            window.app.renderNavigation();
            window.app.loadModule('module01', '1.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '1.1') {
        renderVitalsForm(container);
    } else if (subLevelId === '1.2') {
        renderCounselForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderVitalsForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 1.1: Biographical Vitals</h2>
                    <p class="text-xs text-gray-300 mt-1">Enter official legal name and birth details. Mandatory fields are marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod1-vitals-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
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
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Date of Birth *</label>
                        <input type="date" id="date_of_birth" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Social Security Number</label>
                        <input type="password" id="ssn" placeholder="XXX-XX-0000" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                        <span class="text-[10px] text-gray-300 mt-0.5 block">Encrypted in vault; unmasked in Phase 2 for Proxy.</span>
                    </div>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Biographical Vitals</button>
            </form>
            <div id="mod1-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module01', null);
    });

    document.getElementById('mod1-vitals-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const first_name = document.getElementById('first_name').value.trim();
        const middle_name = document.getElementById('middle_name').value.trim();
        const last_name = document.getElementById('last_name').value.trim();
        const date_of_birth = document.getElementById('date_of_birth').value;
        const ssn = document.getElementById('ssn').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod1-status');
        statusEl.textContent = 'Saving vitals securely...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_01_vitals').upsert({
            tenant_id: profile.tenant_id,
            first_name,
            middle_name,
            last_name,
            date_of_birth,
            ssn: ssn || null
        }, { onConflict: 'tenant_id' });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved biographical vitals.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module01', null);
            }, 1000);
        }
    });
}

function renderCounselForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 1.2: Professional Counsel & Physicians</h2>
                    <p class="text-xs text-gray-300 mt-1">Record primary attorneys, accountants, and physicians.</p>
                </div>
                <button id="back-to-dash-2" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod1-counsel-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Primary Attorney Name</label>
                    <input type="text" id="primary_attorney_name" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Primary Attorney Contact (Phone / Email)</label>
                    <input type="text" id="primary_attorney_contact" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Primary Physician Name & Contact</label>
                    <input type="text" id="primary_physician" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Professional Counsel</button>
            </form>
            <div id="mod1-counsel-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash-2').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module01', null);
    });

    document.getElementById('mod1-counsel-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const primary_attorney_name = document.getElementById('primary_attorney_name').value.trim();
        const primary_attorney_contact = document.getElementById('primary_attorney_contact').value.trim();
        const primary_physician = document.getElementById('primary_physician').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod1-counsel-status');
        statusEl.textContent = 'Saving counsel records...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_01_vitals').update({
            primary_attorney_name,
            primary_attorney_contact,
            primary_physician
        }).eq('tenant_id', profile.tenant_id);

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved professional counsel.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module01', null);
            }, 1000);
        }
    });
}
