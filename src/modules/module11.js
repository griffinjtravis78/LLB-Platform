import { supabase } from '../app.js';

export async function renderModule11(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 11: Pet Care & Veterinary Trusts</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog pet care instructions, designated custodians, and veterinary provisions. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod11-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Pet Name & Species *</label>
                    <input type="text" id="pet_details" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Designated Caretaker / Custodian *</label>
                    <input type="text" id="caretaker_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Veterinary Clinic & Contact *</label>
                    <input type="text" id="veterinary_contact" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Pet Care Record</button>
            </form>
            <div id="mod11-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod11-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pet_details = document.getElementById('pet_details').value;
        const caretaker_name = document.getElementById('caretaker_name').value;
        const veterinary_contact = document.getElementById('veterinary_contact').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_11_pets').insert({
            tenant_id: profile.tenant_id,
            pet_details,
            caretaker_name,
            veterinary_contact
        });

        const status = document.getElementById('mod11-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved pet care record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
