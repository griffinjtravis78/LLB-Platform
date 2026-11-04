import { supabase } from '../app.js';

export async function renderModule01(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 1: Vitals & Professional Contacts</h2>
                <p class="text-xs text-gray-400 mt-1">Capture official legal vitals and primary legal counsel details. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod1-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Legal Full Name *</label>
                    <input type="text" id="legal_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Date of Birth *</label>
                    <input type="date" id="date_of_birth" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Attorney Name</label>
                    <input type="text" id="primary_attorney_name" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Attorney Contact (Phone/Email)</label>
                    <input type="text" id="primary_attorney_contact" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Vitals & Contacts</button>
            </form>
            <div id="mod1-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod1-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const legal_name = document.getElementById('legal_name').value;
        const date_of_birth = document.getElementById('date_of_birth').value;
        const primary_attorney_name = document.getElementById('primary_attorney_name').value;
        const primary_attorney_contact = document.getElementById('primary_attorney_contact').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Error: No authenticated user session found.");
            return;
        }

        // Fetch tenant_id linked to user profile
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) {
            alert("Error: No tenant profile linked to this user.");
            return;
        }

        const { error } = await supabase.from('module_01_vitals').insert({
            tenant_id: profile.tenant_id,
            legal_name,
            date_of_birth,
            primary_attorney_name,
            primary_attorney_contact
        });

        if (error) {
            document.getElementById('mod1-status').textContent = `Error: ${error.message}`;
            document.getElementById('mod1-status').className = 'text-xs text-red-400 mt-2';
        } else {
            document.getElementById('mod1-status').textContent = 'Successfully saved Module 1 vitals record.';
            document.getElementById('mod1-status').className = 'text-xs text-green-400 mt-2';
        }
    });
}
