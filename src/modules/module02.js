import { supabase } from '../app.js';

export async function renderModule02(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 2: Real Estate & Property Assets</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog land parcels, residential property, and deeds. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod2-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Property Description / Address *</label>
                    <input type="text" id="property_address" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Deed / Parcel Number *</label>
                    <input type="text" id="parcel_number" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Property Record</button>
            </form>
            <div id="mod2-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod2-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const property_address = document.getElementById('property_address').value;
        const parcel_number = document.getElementById('parcel_number').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_02_property').insert({
            tenant_id: profile.tenant_id,
            property_address,
            parcel_number
        });

        const status = document.getElementById('mod2-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved real estate record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
