import { supabase } from '../app.js';

export async function renderModule13(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 13: Liabilities, Debts & Obligations</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog mortgages, loans, credit lines, and creditor contacts. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod13-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Creditor / Institution Name *</label>
                    <input type="text" id="creditor_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Liability Type (Mortgage, Auto Loan, Credit Card, Personal Loan) *</label>
                    <input type="text" id="liability_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Account Identifier / Reference *</label>
                    <input type="password" id="account_reference" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Liability Record</button>
            </form>
            <div id="mod13-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod13-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const creditor_name = document.getElementById('creditor_name').value;
        const liability_type = document.getElementById('liability_type').value;
        const account_reference = document.getElementById('account_reference').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_13_liabilities').insert({
            tenant_id: profile.tenant_id,
            creditor_name,
            liability_type,
            account_reference
        });

        const status = document.getElementById('mod13-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved liability record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
