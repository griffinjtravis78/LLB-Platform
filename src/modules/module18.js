import { supabase } from '../app.js';

export async function renderModule18(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 18: Safe Deposit Boxes & Physical Keys</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog financial institution safe deposit boxes, branch locations, and keyholder assignments. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod18-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Financial Institution & Branch *</label>
                    <input type="text" id="institution_branch" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Safe Deposit Box Number *</label>
                    <input type="text" id="box_number" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Key Location / Authorized Deputy *</label>
                    <input type="text" id="key_location" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Safe Deposit Record</button>
            </form>
            <div id="mod18-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod18-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const institution_branch = document.getElementById('institution_branch').value;
        const box_number = document.getElementById('box_number').value;
        const key_location = document.getElementById('key_location').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_18_safes').insert({
            tenant_id: profile.tenant_id,
            institution_branch,
            box_number,
            key_location
        });

        const status = document.getElementById('mod18-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved safe deposit record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
