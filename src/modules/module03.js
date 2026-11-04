import { supabase } from '../app.js';

export async function renderModule03(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 3: Digital Assets & Vault Credentials</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog password managers, cryptocurrency wallets, and online accounts. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod3-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Platform / Service Name *</label>
                    <input type="text" id="platform_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Account Username / Handle *</label>
                    <input type="text" id="account_username" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Digital Asset</button>
            </form>
            <div id="mod3-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod3-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const platform_name = document.getElementById('platform_name').value;
        const account_username = document.getElementById('account_username').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_03_digital').insert({
            tenant_id: profile.tenant_id,
            platform_name,
            account_username
        });

        const status = document.getElementById('mod3-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved digital asset record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
