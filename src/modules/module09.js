import { supabase } from '../app.js';

export async function renderModule09(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 9: Mortuary Vendor Hub & Prepayments</h2>
                <p class="text-xs text-gray-400 mt-1">Record pre-arranged mortuary contracts and vendor locations. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod9-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Mortuary / Funeral Home Name *</label>
                    <input type="text" id="mortuary_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Mortuary Address *</label>
                    <input type="text" id="mortuary_address" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Prepaid Contract Number</label>
                    <input type="text" id="prepaid_contract_number" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Mortuary Record</button>
            </form>
            <div id="mod9-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod9-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mortuary_name = document.getElementById('mortuary_name').value;
        const mortuary_address = document.getElementById('mortuary_address').value;
        const prepaid_contract_number = document.getElementById('prepaid_contract_number').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Error: No authenticated user session found.");
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) {
            alert("Error: No tenant profile linked to this user.");
            return;
        }

        const { error } = await supabase.from('module_09_mortuary').insert({
            tenant_id: profile.tenant_id,
            mortuary_name,
            mortuary_address,
            prepaid_contract_number
        });

        if (error) {
            document.getElementById('mod9-status').textContent = `Error: ${error.message}`;
            document.getElementById('mod9-status').className = 'text-xs text-red-400 mt-2';
        } else {
            document.getElementById('mod9-status').textContent = 'Successfully saved Module 9 mortuary record.';
            document.getElementById('mod9-status').className = 'text-xs text-green-400 mt-2';
        }
    });
}
