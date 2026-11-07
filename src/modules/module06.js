// File: src/modules/module06.js
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
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 6: Religious, Spiritual & Faith Community</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog houses of worship, clergy contacts, congregational memberships, and requested religious rites.</p>
                </div>
                <button id="btn-add-faith" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Faith Record (6.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Faith Community Records
                </div>
                <div id="faith-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-faith').addEventListener('click', () => {
        window.app.activeSubLevel = '6.1';
        window.app.renderNavigation();
        window.app.loadModule('module06', '6.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_06_faith')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('faith-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No faith records entered yet. Click "+ Add Faith Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">House of Worship</th>
                    <th class="p-2.5">Tradition / Denomination</th>
                    <th class="p-2.5">Clergy Contact</th>
                    <th class="p-2.5">Requested Rites</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.worship_name || 'N/A'}</td>
                        <td class="p-2.5">${rec.denomination || 'N/A'}</td>
                        <td class="p-2.5">${rec.clergy_contact || 'None'}</td>
                        <td class="p-2.5">${rec.requested_rites || 'None'}</td>
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
            if (confirm('Are you sure you want to delete this faith record?')) {
                const { error: delError } = await supabase.from('module_06_faith').delete().eq('id', id);
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
            window.app.activeSubLevel = '6.1';
            window.app.renderNavigation();
            window.app.loadModule('module06', '6.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '6.1') {
        renderFaithForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderFaithForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 6.1: Faith Community Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record house of worship details and sacraments. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod6-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">House of Worship Name *</label>
                    <input type="text" id="worship_name" placeholder="e.g. Grace Fellowship Church" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Denominational Tradition</label>
                        <input type="text" id="denomination" placeholder="e.g. Baptist, Catholic, Non-Denominational" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Clergy Contact Details</label>
                        <input type="text" id="clergy_contact" placeholder="Name, Phone or Email" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Requested Religious Rites & Sacraments</label>
                    <textarea id="requested_rites" placeholder="e.g. Traditional funeral mass, scripture readings, specific hymns..." rows="3" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Faith Record</button>
            </form>
            <div id="mod6-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module06', null);
    });

    document.getElementById('mod6-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const worship_name = document.getElementById('worship_name').value.trim();
        const denomination = document.getElementById('denomination').value.trim();
        const clergy_contact = document.getElementById('clergy_contact').value.trim();
        const requested_rites = document.getElementById('requested_rites').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod6-status');
        statusEl.textContent = 'Saving faith community record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_06_faith').insert({
            tenant_id: profile.tenant_id,
            worship_name,
            denomination,
            clergy_contact,
            requested_rites
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved faith community record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module06', null);
            }, 1000);
        }
    });
}
