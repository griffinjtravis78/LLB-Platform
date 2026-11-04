import { supabase } from '../app.js';

export async function renderModule14(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 14: Tax, CPA & Government Records</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog tax preparers, prior returns storage, and government identification records. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod14-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">CPA / Tax Preparer Name & Firm *</label>
                    <input type="text" id="cpa_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Record Type (Tax Return, IP PIN, EIN, Assessment) *</label>
                    <input type="text" id="record_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Storage Location / Contact Phone *</label>
                    <input type="text" id="storage_location" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Tax Record</button>
            </form>
            <div id="mod14-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod14-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cpa_name = document.getElementById('cpa_name').value;
        const record_type = document.getElementById('record_type').value;
        const storage_location = document.getElementById('storage_location').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_14_taxes').insert({
            tenant_id: profile.tenant_id,
            cpa_name,
            record_type,
            storage_location
        });

        const status = document.getElementById('mod14-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved tax and government record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
