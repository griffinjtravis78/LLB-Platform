// File: src/modules/module11.js
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
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 11: Service Participants & Ceremonial Roles</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog memorial service participants, officiants, eulogists, speakers, pallbearers, and musicians.</p>
                </div>
                <button id="btn-add-participant" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Participant Record (11.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Ceremonial Participants
                </div>
                <div id="participants-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-participant').addEventListener('click', () => {
        window.app.activeSubLevel = '11.1';
        window.app.renderNavigation();
        window.app.loadModule('module11', '11.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_11_participants')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('participants-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No ceremonial participants entered yet. Click "+ Add Participant Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Participant Name</th>
                    <th class="p-2.5">Ceremonial Role</th>
                    <th class="p-2.5">Contact Info</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.participant_name || 'N/A'}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D8C3A5]/20 text-[#D8C3A5] border border-[#D8C3A5]/40">${rec.ceremonial_role || 'Participant'}</span></td>
                        <td class="p-2.5">${rec.contact_info || 'None'}</td>
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
            if (confirm('Are you sure you want to delete this participant record?')) {
                const { error: delError } = await supabase.from('module_11_participants').delete().eq('id', id);
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
            window.app.activeSubLevel = '11.1';
            window.app.renderNavigation();
            window.app.loadModule('module11', '11.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '11.1') {
        renderParticipantForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderParticipantForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 11.1: Ceremonial Participant Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record officiants, speakers, eulogists, and pallbearers. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod11-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Participant Full Name *</label>
                    <input type="text" id="participant_name" placeholder="e.g. Reverend Dr. John Smith" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Ceremonial Role *</label>
                        <select id="ceremonial_role" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                            <option value="">Select Role...</option>
                            <option value="Officiant / Clergy">Officiant / Clergy</option>
                            <option value="Eulogist">Eulogist</option>
                            <option value="Guest Speaker">Guest Speaker</option>
                            <option value="Pallbearer">Pallbearer</option>
                            <option value="Honorary Pallbearer">Honorary Pallbearer</option>
                            <option value="Musician / Vocalist">Musician / Vocalist</option>
                            <option value="Scripture Reader">Scripture Reader</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Contact Phone / Email</label>
                        <input type="text" id="contact_info" placeholder="Phone or Email" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Special Speaking Notes or Assignment Instructions</label>
                    <textarea id="speaking_notes" placeholder="Specify topic, reading passages, or specific instructions..." rows="3" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Participant Record</button>
            </form>
            <div id="mod11-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module11', null);
    });

    document.getElementById('mod11-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const participant_name = document.getElementById('participant_name').value.trim();
        const ceremonial_role = document.getElementById('ceremonial_role').value;
        const contact_info = document.getElementById('contact_info').value.trim();
        const speaking_notes = document.getElementById('speaking_notes').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod11-status');
        statusEl.textContent = 'Saving participant record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_11_participants').insert({
            tenant_id: profile.tenant_id,
            participant_name,
            ceremonial_role,
            contact_info,
            speaking_notes
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved participant record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module11', null);
            }, 1000);
        }
    });
}
