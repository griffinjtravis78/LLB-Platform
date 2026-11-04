import { supabase } from '../app.js';

export async function renderModule12(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 12: Charitable Bequests & Legacy Endowments</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog non-profit bequests, foundation allocations, and charitable pledges. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod12-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Charitable Organization Name *</label>
                    <input type="text" id="organization_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Bequest Type (Percentage, Fixed Amount, Specific Asset) *</label>
                    <input type="text" id="bequest_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Allocation Details / Contact *</label>
                    <input type="text" id="allocation_details" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Charitable Record</button>
            </form>
            <div id="mod12-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod12-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const organization_name = document.getElementById('organization_name').value;
        const bequest_type = document.getElementById('bequest_type').value;
        const allocation_details = document.getElementById('allocation_details').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_12_charity').insert({
            tenant_id: profile.tenant_id,
            organization_name,
            bequest_type,
            allocation_details
        });

        const status = document.getElementById('mod12-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved charitable bequest record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
