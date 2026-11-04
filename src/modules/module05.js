import { supabase } from '../app.js';

export async function renderModule05(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 5: Vehicles, Watercraft & Equipment Titles</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog motor vehicles, VINs, and equipment titles. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod5-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Vehicle / Equipment Make & Model *</label>
                    <input type="text" id="vehicle_description" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">VIN / Serial Number *</label>
                    <input type="text" id="vin_number" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Title Storage Location *</label>
                    <input type="text" id="title_location" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Vehicle Record</button>
            </form>
            <div id="mod5-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod5-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const vehicle_description = document.getElementById('vehicle_description').value;
        const vin_number = document.getElementById('vin_number').value;
        const title_location = document.getElementById('title_location').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_05_vehicles').insert({
            tenant_id: profile.tenant_id,
            vehicle_description,
            vin_number,
            title_location
        });

        const status = document.getElementById('mod5-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved vehicle record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
