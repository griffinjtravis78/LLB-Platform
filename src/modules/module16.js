// File: src/modules/module16.js
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
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 16: Life Insurance Policies & Benefit Programs</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog life insurance providers, policy numbers, beneficiaries, coverage amounts, and agent contact details.</p>
                </div>
                <button id="btn-add-insurance" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Insurance Record (16.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Life Insurance Policies
                </div>
                <div id="insurance-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-insurance').addEventListener('click', () => {
        window.app.activeSubLevel = '16.1';
        window.app.renderNavigation();
        window.app.loadModule('module16', '16.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_16_insurance')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('insurance-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No insurance policies entered yet. Click "+ Add Insurance Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Insurance Provider</th>
                    <th class="p-2.5">Policy Number</th>
                    <th class="p-2.5">Named Beneficiary</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.provider_name || 'N/A'}</td>
                        <td class="p-2.5 font-mono">${rec.policy_number || 'N/A'}</td>
                        <td class="p-2.5">${rec.named_beneficiary || 'N/A'}</td>
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
            if (confirm('Are you sure you want to delete this insurance policy record?')) {
                const { error: delError } = await supabase.from('module_16_insurance').delete().eq('id', id);
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
            window.app.activeSubLevel = '16.1';
            window.app.renderNavigation();
            window.app.loadModule('module16', '16.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '16.1') {
        renderInsuranceForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderInsuranceForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 16.1: Life Insurance Policy Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record insurance provider, policy number, and beneficiaries. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod16-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Insurance Provider Name *</label>
                    <input type="text" id="provider_name" placeholder="e.g. New York Life, Northwestern Mutual" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Policy Number *</label>
                        <input type="text" id="policy_number" placeholder="Policy ID or Reference" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Named Beneficiary *</label>
                        <input type="text" id="named_beneficiary" placeholder="Primary Beneficiary Full Name" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Agent Contact Breakdown & Policy Notes</label>
                    <textarea id="policy_notes" placeholder="Enter agent name, phone, email, or coverage face value..." rows="3" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Insurance Record</button>
            </form>
            <div id="mod16-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module16', null);
    });

    document.getElementById('mod16-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const provider_name = document.getElementById('provider_name').value.trim();
        const policy_number = document.getElementById('policy_number').value.trim();
        const named_beneficiary = document.getElementById('named_beneficiary').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod16-status');
        statusEl.textContent = 'Saving insurance record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_16_insurance').insert({
            tenant_id: profile.tenant_id,
            provider_name,
            policy_number,
            named_beneficiary
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved insurance record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module16', null);
            }, 1000);
        }
    });
}
