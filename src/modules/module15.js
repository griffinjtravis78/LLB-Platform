// File: src/modules/module15.js
import { supabase } from '../app.js';

export async function renderDashboard(container) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#D8C3A5]/20 pb-4 gap-4">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 15: Financial Assets, Accounts & Estates</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog financial institutions, checking, savings, trusts, investments, and asset holdings.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button data-sub="15.1" class="sub-redirect bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition shadow cursor-pointer">+ Real Estate (15.1)</button>
                    <button data-sub="15.2" class="sub-redirect bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition shadow cursor-pointer">+ Vehicles (15.2)</button>
                    <button data-sub="15.3" class="sub-redirect bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition shadow cursor-pointer">+ Digital (15.3)</button>
                    <button data-sub="15.4" class="sub-redirect bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition shadow cursor-pointer">+ Valuables (15.4)</button>
                    <button data-sub="15.5" class="sub-redirect bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition shadow cursor-pointer">+ Business (15.5)</button>
                    <button data-sub="15.6" class="sub-redirect bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider transition shadow cursor-pointer">+ Invest (15.6)</button>
                </div>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Financial Assets & Accounts
                </div>
                <div id="financials-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.sub-redirect').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const subId = e.currentTarget.getAttribute('data-sub');
            window.app.activeSubLevel = subId;
            window.app.renderNavigation();
            window.app.loadModule('module15', subId);
        });
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_15_financials')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('financials-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No financial asset records entered yet. Click any category button above to add records.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Institution / Name</th>
                    <th class="p-2.5">Account / Asset Type</th>
                    <th class="p-2.5">Identifier / Reference</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.institution_name || 'N/A'}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D8C3A5]/20 text-[#D8C3A5] border border-[#D8C3A5]/40">${rec.account_type || 'Financial'}</span></td>
                        <td class="p-2.5 font-mono text-gray-400">••••••••</td>
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
            if (confirm('Are you sure you want to delete this financial record?')) {
                const { error: delError } = await supabase.from('module_15_financials').delete().eq('id', id);
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
            window.app.activeSubLevel = '15.1';
            window.app.renderNavigation();
            window.app.loadModule('module15', '15.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    renderFinancialForm(container, subLevelId);
}

function renderFinancialForm(container, subLevelId) {
    const subTitles = {
        '15.1': '15.1 Real Estate & Property Assets (Deeds & Parcels)',
        '15.2': '15.2 Vehicles, Watercraft & Equipment Titles (VINs)',
        '15.3': '15.3 Digital Assets & Vault Credentials',
        '15.4': '15.4 Physical Valuables, Collections & Vault Holdings',
        '15.5': '15.5 Business Interests & Operating Entities (LLCs)',
        '15.6': '15.6 Investments, Brokerage Accounts & Securities'
    };

    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level ${subTitles[subLevelId] || subLevelId}</h2>
                    <p class="text-xs text-gray-300 mt-1">Record institutional details and secure account identifiers. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod15-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Financial Institution / Asset Name *</label>
                    <input type="text" id="institution_name" placeholder="e.g. Chase Bank, Vanguard, County Recorder" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Account / Asset Type *</label>
                        <input type="text" id="account_type" value="${subLevelId}" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Encrypted Identifier / Number *</label>
                        <input type="password" id="encrypted_account_number" placeholder="Account # or Deed ID" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                    </div>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Financial Asset Record</button>
            </form>
            <div id="mod15-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module15', null);
    });

    document.getElementById('mod15-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const institution_name = document.getElementById('institution_name').value.trim();
        const account_type = document.getElementById('account_type').value.trim();
        const encrypted_account_number = document.getElementById('encrypted_account_number').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod15-status');
        statusEl.textContent = 'Saving financial asset record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_15_financials').insert({
            tenant_id: profile.tenant_id,
            institution_name,
            account_type,
            encrypted_account_number
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved financial asset record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module15', null);
            }, 1000);
        }
    });
}
