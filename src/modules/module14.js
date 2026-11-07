// File: src/modules/module14.js
import { supabase } from '../app.js';

export async function renderDashboard(container) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center border-b border-[#D8C3A5]/20 pb-4">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 14: Multi-Service Event Itineraries & Scheduling</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog multi-service event itineraries (Wake, Funeral, Graveside Service) and proxy-locked scheduling details.</p>
                </div>
                <button id="btn-add-itinerary" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Itinerary Record (14.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Service Itineraries
                </div>
                <div id="itineraries-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-itinerary').addEventListener('click', () => {
        window.app.activeSubLevel = '14.1';
        window.app.renderNavigation();
        window.app.loadModule('module14', '14.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_14_itineraries')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('itineraries-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No event itineraries entered yet. Click "+ Add Itinerary Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Event Type</th>
                    <th class="p-2.5">Venue Name</th>
                    <th class="p-2.5">Date & Time</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.event_type || 'N/A'}</td>
                        <td class="p-2.5">${rec.venue_name || 'N/A'}</td>
                        <td class="p-2.5">${rec.event_datetime ? new Date(rec.event_datetime).toLocaleString() : 'TBD'}</td>
                        <td class="p-2.5 text-right space-x-2">
                            <button data-id="${rec.id}" class="edit-btn text-[#D8C3A5] hover:underline font-bold bg-transparent border-none cursor-pointer">EDIT</button>
                            <button data-id="${rec.id}" class="delete-btn text-red-300 hover:underline font-bold bg-transparent border-none cursor-pointer">DELETE</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this itinerary record?')) {
                const { error: delError } = await supabase.from('module_14_itineraries').delete().eq('id', id);
                if (delError) {
                    alert(`Error deleting record: ${delError.message}`);
                } else {
                    loadRecordsTable(tenantId);
                }
            }
        });
    });

    tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.app.activeSubLevel = '14.1';
            window.app.renderNavigation();
            window.app.loadModule('module14', '14.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '14.1') {
        renderItineraryForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderItineraryForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 14.1: Event Itinerary Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record service type, venue location, and schedule timing. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod14-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Event Type *</label>
                    <select id="event_type" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                        <option value="">Select Event Type...</option>
                        <option value="Wake / Visitation">Wake / Visitation</option>
                        <option value="Funeral Service">Funeral Service</option>
                        <option value="Celebration of Life">Celebration of Life</option>
                        <option value="Graveside Service / Interment">Graveside Service / Interment</option>
                        <option value="Memorial Reception / Repast">Memorial Reception / Repast</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Venue Name *</label>
                        <input type="text" id="venue_name" placeholder="e.g. Grace Fellowship Church / Cemetery" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Date & Time</label>
                        <input type="datetime-local" id="event_datetime" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Venue Address & Scheduling Instructions</label>
                    <textarea id="itinerary_notes" placeholder="Enter venue address, parking instructions, or proxy scheduling notes..." rows="3" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Itinerary Record</button>
            </form>
            <div id="mod14-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module14', null);
    });

    document.getElementById('mod14-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const event_type = document.getElementById('event_type').value;
        const venue_name = document.getElementById('venue_name').value.trim();
        const event_datetime = document.getElementById('event_datetime').value || null;
        const itinerary_notes = document.getElementById('itinerary_notes').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod14-status');
        statusEl.textContent = 'Saving event itinerary record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_14_itineraries').insert({
            tenant_id: profile.tenant_id,
            event_type,
            venue_name,
            event_datetime,
            itinerary_notes
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved event itinerary record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module14', null);
            }, 1000);
        }
    });
}
