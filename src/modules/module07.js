// File: src/modules/module07.js
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
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 7: Military Service Records & Veterans Services</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog military branches, serial numbers, MOS codes, DD-214 document vault links, and veterans funeral honors.</p>
                </div>
                <button id="btn-add-military" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Military Record (7.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Military Service Records
                </div>
                <div id="military-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-military').addEventListener('click', () => {
        window.app.activeSubLevel = '7.1';
        window.app.renderNavigation();
        window.app.loadModule('module07', '7.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_07_military')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('military-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No military service records entered yet. Click "+ Add Military Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Branch</th>
                    <th class="p-2.5">Final Rank</th>
                    <th class="p-2.5">MOS / Rating</th>
                    <th class="p-2.5">Discharge</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.branch_of_service || 'N/A'}</td>
                        <td class="p-2.5">${rec.final_rank || 'N/A'}</td>
                        <td class="p-2.5">${rec.mos_code || 'N/A'}</td>
                        <td class="p-2.5">${rec.discharge_characterization || 'N/A'}</td>
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
            if (confirm('Are you sure you want to delete this military service record?')) {
                const { error: delError } = await supabase.from('module_07_military').delete().eq('id', id);
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
            window.app.activeSubLevel = '7.1';
            window.app.renderNavigation();
            window.app.loadModule('module07', '7.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '7.1') {
        renderMilitaryForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderMilitaryForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 7.1: Military Service Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record service branch, serial number, MOS, and DD-214 links. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod7-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Branch of Service *</label>
                        <select id="branch_of_service" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                            <option value="">Select Branch...</option>
                            <option value="United States Marine Corps">United States Marine Corps</option>
                            <option value="United States Army">United States Army</option>
                            <option value="United States Navy">United States Navy</option>
                            <option value="United States Air Force">United States Air Force</option>
                            <option value="United States Coast Guard">United States Coast Guard</option>
                            <option value="Space Force">Space Force</option>
                            <option value="National Guard / Reserves">National Guard / Reserves</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Serial / Service Number</label>
                        <input type="text" id="service_number" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Final Rank / Grade</label>
                        <input type="text" id="final_rank" placeholder="e.g. Sergeant / E-5" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">MOS / Rating Code</label>
                        <input type="text" id="mos_code" placeholder="e.g. 3043" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Enlistment Date</label>
                        <input type="date" id="enlistment_date" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Discharge Date</label>
                        <input type="date" id="discharge_date" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Discharge Characterization</label>
                        <select id="discharge_characterization" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                            <option value="Honorable">Honorable</option>
                            <option value="General Under Honorable Conditions">General Under Honorable Conditions</option>
                            <option value="Other Than Honorable">Other Than Honorable</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">VA Claim / File Number</label>
                        <input type="text" id="va_claim_number" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">DD-214 Vault Linkage / Storage Notes</label>
                    <input type="text" id="dd214_link" placeholder="Location or secure vault reference" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Military Record</button>
            </form>
            <div id="mod7-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module07', null);
    });

    document.getElementById('mod7-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const branch_of_service = document.getElementById('branch_of_service').value;
        const service_number = document.getElementById('service_number').value.trim();
        const final_rank = document.getElementById('final_rank').value.trim();
        const mos_code = document.getElementById('mos_code').value.trim();
        const enlistment_date = document.getElementById('enlistment_date').value || null;
        const discharge_date = document.getElementById('discharge_date').value || null;
        const discharge_characterization = document.getElementById('discharge_characterization').value;
        const va_claim_number = document.getElementById('va_claim_number').value.trim();
        const dd214_link = document.getElementById('dd214_link').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod7-status');
        statusEl.textContent = 'Saving military record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_07_military').insert({
            tenant_id: profile.tenant_id,
            branch_of_service,
            service_number,
            final_rank,
            mos_code,
            enlistment_date,
            discharge_date,
            discharge_characterization,
            va_claim_number,
            dd214_link
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved military service record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module07', null);
            }, 1000);
        }
    });
}
