import { supabase } from '../app.js';

export async function renderModule04(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 4: Physical Valuables, Collections & Vaults</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog tangible heirlooms, vintage collections, and physical vault holdings. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod4-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Item / Collection Name *</label>
                    <input type="text" id="item_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Asset Category (Coinage, Precious Metals, Art, Heirloom) *</label>
                    <input type="text" id="asset_category" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Physical Location / Storage Vault *</label>
                    <input type="text" id="storage_location" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Physical Asset Record</button>
            </form>
            <div id="mod4-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod4-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const item_name = document.getElementById('item_name').value;
        const asset_category = document.getElementById('asset_category').value;
        const storage_location = document.getElementById('storage_location').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_04_valuables').insert({
            tenant_id: profile.tenant_id,
            item_name,
            asset_category,
            storage_location
        });

        const status = document.getElementById('mod4-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved physical valuable record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
