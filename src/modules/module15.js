import { supabase } from '../app.js';

export async function renderModule15(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 15: Financial Assets & Accounts</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog financial institutions and account details. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod15-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Financial Institution Name *</label>
                    <input type="text" id="institution_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Account Type (Checking, Savings, Trust, Investment) *</label>
                    <input type="text" id="account_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Encrypted Account Identifier / Number *</label>
                    <input type="password" id="encrypted_account_number" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Financial Asset Record</button>
            </form>
            <div id="mod15-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod15-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const institution_name = document.getElementById('institution_name').value;
        const account_type = document.getElementById('account_type').value;
        const encrypted_account_number = document.getElementById('encrypted_account_number').value;

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

        const { error } = await supabase.from('module_15_financials').insert({
            tenant_id: profile.tenant_id,
            institution_name,
            account_type,
            encrypted_account_number
        });

        if (error) {
            document.getElementById('mod15-status').textContent = `Error: ${error.message}`;
            document.getElementById('mod15-status').className = 'text-xs text-red-400 mt-2';
        } else {
            document.getElementById('mod15-status').textContent = 'Successfully saved Module 15 financial asset record.';
            document.getElementById('mod15-status').className = 'text-xs text-green-400 mt-2';
        }
    });
}
