import { supabase } from '../app.js';

export async function renderModule07(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 7: Business Interests & Operating Entities</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog commercial entities, corporate shares, and operating agreements. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod7-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Business / Entity Name *</label>
                    <input type="text" id="business_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Entity Type (LLC, Corp, Partnership, Sole Prop) *</label>
                    <input type="text" id="entity_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Ownership Percentage / Share Count *</label>
                    <input type="text" id="ownership_stake" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Business Record</button>
            </form>
            <div id="mod7-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod7-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const business_name = document.getElementById('business_name').value;
        const entity_type = document.getElementById('entity_type').value;
        const ownership_stake = document.getElementById('ownership_stake').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_07_business').insert({
            tenant_id: profile.tenant_id,
            business_name,
            entity_type,
            ownership_stake
        });

        const status = document.getElementById('mod7-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved business interest record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
