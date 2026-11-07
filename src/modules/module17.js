// File: src/modules/module17.js
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
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 17: Utilities, Subscriptions & Pet Care Directives</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog recurring utility accounts, digital subscriptions, housing directives, and pet care instructions (e.g., Dolly Pawton).</p>
                </div>
                <div class="flex gap-2">
                    <button id="btn-add-utility" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-3 py-2 rounded text-[11px] uppercase tracking-wider transition shadow cursor-pointer">
                        + Add Utility / Sub (17.1)
                    </button>
                    <button id="btn-add-pet" class="bg-[#6A7B8C] hover:bg-[#485664] text-white font-bold px-3 py-2 rounded text-[11px] uppercase tracking-wider transition shadow cursor-pointer">
                        + Add Pet Directive (17.2)
                    </button>
                </div>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Utilities & Pet Care Directives
                </div>
                <div id="utilities-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-utility').addEventListener('click', () => {
        window.app.activeSubLevel = '17.1';
        window.app.renderNavigation();
        window.app.loadModule('module17', '17.1');
    });

    document.getElementById('btn-add-pet').addEventListener('click', () => {
        window.app.activeSubLevel = '17.2';
        window.app.renderNavigation();
        window.app.loadModule('module17', '17.2');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_17_utilities')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('utilities-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No utility or pet care records entered yet. Click the buttons above to add entries.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Category / Type</th>
                    <th class="p-2.5">Service / Provider / Pet Name</th>
                    <th class="p-2.5">Account / Caretaker</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D8C3A5]/20 text-[#D8C3A5] border border-[#D8C3A5]/40">${rec.category_type || 'Utility'}</span></td>
                        <td class="p-2.5">${rec.service_name || 'N/A'}</td>
                        <td class="p-2.5 font-mono">${rec.account_reference || 'N/A'}</td>
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
            if (confirm('Are you sure you want to delete this record?')) {
                const { error: delError } = await supabase.from('module_17_utilities').delete().eq('id', id);
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
            window.app.activeSubLevel = '17.1';
            window.app.renderNavigation();
            window.app.loadModule('module17', '17.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '17.1') {
        renderUtilityForm(container);
    } else if (subLevelId === '17.2') {
        renderPetForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderUtilityForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 17.1: Utility & Subscription Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record recurring utility accounts or digital subscriptions. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod17-util-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Category Type *</label>
                        <select id="category_type" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                            <option value="Utility (Electric/Water/Gas)">Utility (Electric/Water/Gas)</option>
                            <option value="Internet / Communications">Internet / Communications</option>
                            <option value="Digital SaaS Subscription">Digital SaaS Subscription</option>
                            <option value="Housing / HOA">Housing / HOA</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Service / Provider Name *</label>
                        <input type="text" id="service_name" placeholder="e.g. Ameren UE, Netflix" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Account Number / Reference *</label>
                    <input type="text" id="account_reference" placeholder="Account ID or login reference" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs font-mono" />
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Kill Switch & Cancellation Instructions</label>
                    <textarea id="instructions" placeholder="Enter instructions for cancelling service or transferring account..." rows="3" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Utility Record</button>
            </form>
            <div id="mod17-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module17', null);
    });

    document.getElementById('mod17-util-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const category_type = document.getElementById('category_type').value;
        const service_name = document.getElementById('service_name').value.trim();
        const account_reference = document.getElementById('account_reference').value.trim();
        const instructions = document.getElementById('instructions').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod17-status');
        statusEl.textContent = 'Saving utility record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_17_utilities').insert({
            tenant_id: profile.tenant_id,
            category_type,
            service_name,
            account_reference,
            instructions
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved utility record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module17', null);
            }, 1000);
        }
    });
}

function renderPetForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 17.2: Pet Care Directive (e.g. Dolly Pawton)</h2>
                    <p class="text-xs text-gray-300 mt-1">Record pet care trusts, designated caretakers, and veterinary instructions. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod17-pet-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Category Type</label>
                        <input type="text" id="category_type" value="Pet Care Directive" readonly class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-gray-300 outline-none text-xs font-mono" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Pet Name & Species *</label>
                        <input type="text" id="service_name" placeholder="e.g. Dolly Pawton (Lu Lu) - Dog" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Designated Caretaker & Contact *</label>
                    <input type="text" id="account_reference" placeholder="Caretaker Name, Phone & Email" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Veterinary Instructions & Trust Provisions *</label>
                    <textarea id="instructions" placeholder="Enter vet clinic details, dietary needs, medication schedules, and trust funding instructions..." rows="4" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Pet Care Directive</button>
            </form>
            <div id="mod17-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module17', null);
    });

    document.getElementById('mod17-pet-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const category_type = document.getElementById('category_type').value;
        const service_name = document.getElementById('service_name').value.trim();
        const account_reference = document.getElementById('account_reference').value.trim();
        const instructions = document.getElementById('instructions').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod17-status');
        statusEl.textContent = 'Saving pet care directive...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_17_utilities').insert({
            tenant_id: profile.tenant_id,
            category_type,
            service_name,
            account_reference,
            instructions
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved pet care directive.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module17', null);
            }, 1000);
        }
    });
}
