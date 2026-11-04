import { supabase } from '../app.js';

export async function renderModule00(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 0: Customer Onboarding & Support Track</h2>
                <p class="text-xs text-gray-400 mt-1">Configure your primary support track and proxy contacts. All fields marked with * are mandatory.</p>
            </div>
            <form id="mod0-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Proxy Full Name *</label>
                    <input type="text" id="proxy_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Proxy Phone *</label>
                    <input type="text" id="proxy_phone" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Proxy Email *</label>
                    <input type="email" id="proxy_email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Support Track Selection *</label>
                    <select id="support_track" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none">
                        <option value="track_a_doula">Track A: End-of-Life Doula Assisted</option>
                        <option value="track_b_independent">Track B: Independent Proxy Managed</option>
                    </select>
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Onboarding Record</button>
            </form>
        </div>
    `;
}
