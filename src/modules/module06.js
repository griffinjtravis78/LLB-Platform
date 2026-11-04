import { supabase } from '../app.js';

export async function renderModule06(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 6: Intellectual Property, Copyrights & Trademarks</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog registered copyrights, trademarks, and publishing assets. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod6-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Asset / Title Name *</label>
                    <input type="text" id="asset_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Protection Type (Copyright, Trademark, Patent) *</label>
                    <input type="text" id="protection_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Registration Number / ID *</label>
                    <input type="text" id="registration_number" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Intellectual Property Record</button>
            </form>
            <div id="mod6-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod6-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const asset_name = document.getElementById('asset_name').value;
        const protection_type = document.getElementById('protection_type').value;
        const registration_number = document.getElementById('registration_number').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_06_ip').insert({
            tenant_id: profile.tenant_id,
            asset_name,
            protection_type,
            registration_number
        });

        const status = document.getElementById('mod6-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved intellectual property record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
