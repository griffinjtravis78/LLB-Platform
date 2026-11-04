import { supabase } from '../app.js';

export async function renderModule16(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 16: Life Insurance Policies & Beneficiaries</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog life insurance providers, policy numbers, and beneficiaries. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod16-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Insurance Provider Name *</label>
                    <input type="text" id="provider_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Policy Number *</label>
                    <input type="text" id="policy_number" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Named Beneficiary *</label>
                    <input type="text" id="named_beneficiary" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Insurance Record</button>
            </form>
            <div id="mod16-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod16-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const provider_name = document.getElementById('provider_name').value;
        const policy_number = document.getElementById('policy_number').value;
        const named_beneficiary = document.getElementById('named_beneficiary').value;

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

        const { error } = await supabase.from('module_16_insurance').insert({
            tenant_id: profile.tenant_id,
            provider_name,
            policy_number,
            named_beneficiary
        });

        if (error) {
            document.getElementById('mod16-status').textContent = `Error: ${error.message}`;
            document.getElementById('mod16-status').className = 'text-xs text-red-400 mt-2';
        } else {
            document.getElementById('mod16-status').textContent = 'Successfully saved Module 16 insurance record.';
            document.getElementById('mod16-status').className = 'text-xs text-green-400 mt-2';
        }
    });
}
