// File: src/components/auditLedger.js
import { supabase } from '../app.js';

export async function renderAuditLedger(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="border-b border-[#D8C3A5]/20 pb-4">
                <h2 class="text-lg font-bold text-[#D8C3A5]">Evidentiary Audit & Transaction Ledger</h2>
                <p class="text-xs text-gray-300 mt-1">Immutable, cryptographically hashed SHA-256 event log for probate compliance and audit tracking.</p>
            </div>
            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Immutable Audit Trail
                </div>
                <div id="ledger-table-container" class="p-4 overflow-x-auto">
                    <p class="text-xs text-gray-300">Loading immutable ledger records...</p>
                </div>
            </div>
        </div>
    `;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    const { data: logs, error } = await supabase
        .from('audit_ledger')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

    const tableContainer = document.getElementById('ledger-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading audit trail: ${error.message}</p>`;
        return;
    }

    if (!logs || logs.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No audit events recorded yet for this estate.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Timestamp</th>
                    <th class="p-2.5">Module</th>
                    <th class="p-2.5">Action Type</th>
                    <th class="p-2.5">Current Hash (SHA-256)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${logs.map(log => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5">${new Date(log.created_at).toLocaleString()}</td>
                        <td class="p-2.5 font-mono">${log.module_identifier}</td>
                        <td class="p-2.5 font-semibold text-white">${log.action_type}</td>
                        <td class="p-2.5 font-mono text-gray-400 truncate max-w-xs">${log.current_hash}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
