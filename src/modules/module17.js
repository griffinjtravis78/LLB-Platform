import { supabase } from '../app.js';

export async function renderModule17(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 17: Final Wishes & Memorial Service Directives</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog memorial preferences, disposition directives, and service arrangements. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod17-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Disposition Preference (Burial, Cremation, Entombment) *</label>
                    <input type="text" id="disposition_preference" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Service Type (Celebration of Life, Traditional, Private, None) *</label>
                    <input type="text" id="service_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Special Instructions / Music / Readings *</label>
                    <input type="text" id="special_instructions" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Final Wishes Record</button>
            </form>
            <div id="mod17-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod17-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const disposition_preference = document.getElementById('disposition_preference').value;
        const service_type = document.getElementById('service_type').value;
        const special_instructions = document.getElementById('special_instructions').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_17_wishes').insert({
            tenant_id: profile.tenant_id,
            disposition_preference,
            service_type,
            special_instructions
        });

        const status = document.getElementById('mod17-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved final wishes record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
