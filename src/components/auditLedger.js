import { supabase } from '../app.js';

export async function renderAuditLedger(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Evidentiary Audit & Transaction Ledger</h2>
                <p class="text-xs text-gray-400 mt-1">Immutable, cryptographically hashed SHA-256 event log for probate compliance and audit tracking.</p>
            </div>
            <div id="ledger-table-container" class="overflow-x-auto">
                <p class="text-xs text-gray-500">Loading immutable ledger records...</p>
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

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-400">Error loading audit trail: ${error.message}</p>`;
        return;
    }

    if (!logs || logs.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-400">No audit events recorded yet for this estate.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-gray-800 text-[#C5A059]">
                    <th class="p-2">Timestamp</th>
                    <th class="p-2">Module</th>
                    <th class="p-2">Action Type</th>
                    <th class="p-2">Current Hash (SHA-256)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-800 text-gray-300">
                ${logs.map(log => `
                    <tr>
                        <td class="p-2">${new Date(log.created_at).toLocaleString()}</td>
                        <td class="p-2">${log.module_identifier}</td>
                        <td class="p-2 font-semibold text-white">${log.action_type}</td>
                        <td class="p-2 font-mono text-gray-500 truncate max-w-xs">${log.current_hash}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
