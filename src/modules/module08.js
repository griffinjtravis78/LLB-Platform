import { supabase } from '../app.js';

export async function renderModule08(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 8: Investments, Brokerage Accounts & Securities</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog brokerage firms, investment portfolios, and retirement accounts. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod8-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Brokerage / Institution Name *</label>
                    <input type="text" id="brokerage_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Account Type (Brokerage, IRA, 401k, Mutual Fund) *</label>
                    <input type="text" id="investment_account_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Encrypted Account Number / Identifier *</label>
                    <input type="password" id="encrypted_investment_number" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Investment Record</button>
            </form>
            <div id="mod8-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod8-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const brokerage_name = document.getElementById('brokerage_name').value;
        const investment_account_type = document.getElementById('investment_account_type').value;
        const encrypted_investment_number = document.getElementById('encrypted_investment_number').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_08_investments').insert({
            tenant_id: profile.tenant_id,
            brokerage_name,
            investment_account_type,
            encrypted_investment_number
        });

        const status = document.getElementById('mod8-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved investment record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
